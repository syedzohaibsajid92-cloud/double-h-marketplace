const pool = require("../config/db");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

function generateTrackingNumber() {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `PAK-${random}`;
}

// 1. PLACE ORDER (With Database Transaction & Stock Deduction)
const placeOrder = async (req, res) => {
    const client = await pool.connect(); // Acquire dedicated client for transaction

    try {
        const user_id = req.user.id; // Securely extracted from JWT
        const { address_id, payment_method = "COD" } = req.body;

        if (!address_id) {
            return res.status(400).json({ message: "address_id is required." });
        }

        // Verify shipping address belongs to authenticated user
        const addressCheck = await client.query(
            "SELECT id FROM addresses WHERE id = $1 AND user_id = $2",
            [address_id, user_id]
        );

        if (addressCheck.rows.length === 0) {
            return res.status(404).json({ message: "Invalid shipping address." });
        }

        // Retrieve user's cart items
        const cartItemsResult = await client.query(
            `SELECT 
                cart.product_id,
                cart.quantity,
                products.price,
                products.stock,
                products.name
            FROM cart
            JOIN products ON cart.product_id = products.id
            WHERE cart.user_id = $1`,
            [user_id]
        );

        if (cartItemsResult.rows.length === 0) {
            return res.status(400).json({ message: "Cart is empty." });
        }

        const cartItems = cartItemsResult.rows;

        // Verify stock availability for all items
        for (const item of cartItems) {
            if (item.quantity > item.stock) {
                return res.status(400).json({
                    message: `Insufficient stock for ${item.name}. Available: ${item.stock}, Requested: ${item.quantity}`
                });
            }
        }

        // Calculate Subtotal & Grand Total
        const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        const shippingFee = subtotal > 5000 ? 0 : 250;
        const tax = parseFloat((subtotal * 0.05).toFixed(2));
        const grandTotal = parseFloat((subtotal + shippingFee + tax).toFixed(2));

        // START TRANSACTION
        await client.query("BEGIN");

               // Step A: Create Order (with a generated tracking number)
        const trackingNumber = generateTrackingNumber();
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, address_id, total_amount, payment_method, status, tracking_number)
             VALUES ($1, $2, $3, $4, 'pending', $5)
             RETURNING *`,
            [user_id, address_id, grandTotal, payment_method, trackingNumber]
        );

        const orderId = orderResult.rows[0].id;

        // Step B: Insert Order Items & Deduct Product Stock
        for (const item of cartItems) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.product_id, item.quantity, item.price]
            );

            await client.query(
                `UPDATE products 
                 SET stock = stock - $1 
                 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }

        // Step C: Clear User's Cart
        await client.query(`DELETE FROM cart WHERE user_id = $1`, [user_id]);

                // COMMIT TRANSACTION
        await client.query("COMMIT");

        // Send real order confirmation email (non-blocking — order still succeeds even if email fails)
        try {
            const userResult = await pool.query("SELECT email, first_name FROM users WHERE id = $1", [user_id]);
            const customer = userResult.rows[0];

            if (customer?.email) {
                await resend.emails.send({
                    from: "PAK Hardware <onboarding@resend.dev>",
                    to: customer.email,
                    subject: `Order Confirmed - Tracking #${trackingNumber}`,
                    html: `
                        <h2>Thanks for your order, ${customer.first_name || "there"}!</h2>
                        <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
                        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                        <p><strong>Total:</strong> Rs. ${grandTotal}</p>
                        <p>We'll notify you as your order progresses.</p>
                        <p>— PAK Hardware Store</p>
                    `,
                });
            }
        } catch (emailErr) {
            console.error("Order confirmation email failed to send:", emailErr);
        }

        res.status(201).json({
            message: "Order placed successfully",
            order: orderResult.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK"); // Rollback all DB actions if an error occurs
        console.error(error);
        res.status(500).json({ message: "Server Error during order placement" });
    } finally {
        client.release(); // Release client connection back to pool
    }
};

// 2. GET USER ORDER HISTORY (Self-only)
const getUserOrders = async (req, res) => {
    try {
        const user_id = req.user.id; // Enforce logged-in user context

        const result = await pool.query(
            `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
            [user_id]
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. GET SINGLE ORDER DETAILS (Ownership protected)
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const orderResult = await pool.query(
            `SELECT o.*, a.full_name, a.phone, a.address_line1, a.city, a.country 
             FROM orders o
             LEFT JOIN addresses a ON o.address_id = a.id
             WHERE o.id = $1 AND o.user_id = $2`,
            [id, user_id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const itemsResult = await pool.query(
            `SELECT oi.*, p.name, p.image_url 
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [id]
        );

        res.status(200).json({
            order: orderResult.rows[0],
            items: itemsResult.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. CANCEL ORDER (With Inventory Restocking)
const cancelOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        await client.query("BEGIN");

        // Cancel order only if pending
        const orderResult = await client.query(
            `UPDATE orders
             SET status = 'Cancelled'
             WHERE id = $1 AND user_id = $2 AND status = 'pending'
             RETURNING *`,
            [id, user_id]
        );

        if (orderResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message: "Order not found, already processed, or permission denied."
            });
        }

        // Fetch order items to restore stock
        const itemsResult = await client.query(
            "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
            [id]
        );

        for (const item of itemsResult.rows) {
            await client.query(
                "UPDATE products SET stock = stock + $1 WHERE id = $2",
                [item.quantity, item.product_id]
            );
        }

        await client.query("COMMIT");

        res.status(200).json({
            message: "Order cancelled and stock restored successfully",
            order: orderResult.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    } finally {
        client.release();
    }
};

// 5. GET ALL ORDERS (Admin-only route)
const getAllOrders = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                o.id,
                o.status,
                o.created_at,
                u.first_name,
                u.last_name,
                u.email AS customer_email,
                json_agg(
                    json_build_object(
                        'productId', oi.product_id,
                        'name', p.name,
                        'price', oi.price,
                        'qty', oi.quantity,
                        'vendorId', p.vendor_id
                    )
                ) AS items
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products p ON p.id = oi.product_id
            GROUP BY o.id, o.status, o.created_at, u.first_name, u.last_name, u.email
            ORDER BY o.id DESC
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 6. GENERATE INVOICE DATA
const getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Fetch order details with user & address info
        const orderResult = await pool.query(
            `SELECT 
                o.id AS invoice_number,
                o.created_at AS invoice_date,
                o.total_amount,
                o.payment_method,
                o.status,
                u.email AS customer_email,
                a.full_name AS recipient_name,
                a.phone,
                a.address_line1,
                a.city,
                a.country
             FROM orders o
             JOIN users u ON o.user_id = u.id
             LEFT JOIN addresses a ON o.address_id = a.id
             WHERE o.id = $1 AND o.user_id = $2`,
            [id, user_id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: "Invoice not found or unauthorized access." });
        }

        // Fetch line items
        const itemsResult = await pool.query(
            `SELECT 
                oi.product_id,
                p.name AS item_name,
                oi.quantity,
                oi.price AS unit_price,
                (oi.quantity * oi.price) AS subtotal
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [id]
        );

        const order = orderResult.rows[0];
        const items = itemsResult.rows;

        // Structure clean invoice data
        res.status(200).json({
            success: true,
            invoice: {
                company: "Double-H Hardware Marketplace",
                invoice_no: `INV-${String(order.invoice_number).padStart(6, '0')}`,
                date: order.invoice_date,
                customer: {
                    email: order.customer_email
                },
                shipping_address: {
                    recipient: order.recipient_name || "N/A",
                    phone: order.phone || "N/A",
                    address: order.address_line1 || "N/A",
                    city: order.city || "N/A",
                    country: order.country || "N/A"
                },
                payment_method: order.payment_method,
                status: order.status,
                items: items,
                total_amount: order.total_amount
            }
        });

    } catch (error) {
        console.error("Invoice Error:", error);
        res.status(500).json({ message: "Server Error generating invoice" });
    }
};

// 7. UPDATE DELIVERY STATUS (Admin Endpoint)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!status || !validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ 
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }

        const result = await pool.query(
            `UPDATE orders 
             SET status = $1 
             WHERE id = $2 
             RETURNING *`,
            [status.toLowerCase(), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Order not found." });
        }

        res.status(200).json({
            success: true,
            message: `Order status updated to '${status}' successfully`,
            order: result.rows[0]
        });

    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ message: "Server Error updating status" });
    }
};

module.exports = {
    placeOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    getInvoice,
    updateOrderStatus
};