const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const pool = require("../config/db");

// 1. CREATE STRIPE PAYMENT INTENT & RECORD IN DB
const createStripePaymentIntent = async (req, res) => {
    try {
        const { order_id } = req.body;
        const user_id = req.user.id; // From authMiddleware JWT

        if (!order_id) {
            return res.status(400).json({ message: "order_id is required." });
        }

        // Fetch order details
        const orderResult = await pool.query(
            "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
            [order_id, user_id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: "Order not found." });
        }

        const order = orderResult.rows[0];
        const amountInCents = Math.round(parseFloat(order.total_amount) * 100);

        // Create Payment Intent on Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "usd",
            metadata: {
                order_id: order.id.toString(),
                user_id: user_id.toString()
            }
        });

        // Record initial payment record as 'pending' in your DB
        const transaction_id = paymentIntent.id; // Use Stripe's unique intent ID

        await pool.query(
            `INSERT INTO payments (user_id, order_id, amount, payment_method, transaction_id, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')
             ON CONFLICT (transaction_id) DO NOTHING`,
            [user_id, order_id, order.total_amount, "Stripe", transaction_id]
        );

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: order.total_amount
        });

    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. CONFIRM STRIPE PAYMENT & UPDATE DB
const confirmStripePayment = async (req, res) => {
    try {
        const { order_id, payment_intent_id } = req.body;

        if (!order_id || !payment_intent_id) {
            return res.status(400).json({ message: "order_id and payment_intent_id are required." });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

        if (paymentIntent.status === "succeeded") {
            // Update payments record status
            await pool.query(
                "UPDATE payments SET status = 'completed' WHERE transaction_id = $1",
                [payment_intent_id]
            );

            // Update orders record status
            const orderResult = await pool.query(
                "UPDATE orders SET status = 'processing', payment_method = 'Stripe' WHERE id = $1 RETURNING *",
                [order_id]
            );

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully!",
                order: orderResult.rows[0]
            });
        }

        res.status(400).json({ success: false, message: `Payment failed. Status: ${paymentIntent.status}` });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 3. YOUR EXISTING MAKE PAYMENT (For manual/COD entries)
const makePayment = async (req, res) => {
    try {
        const { order_id, amount, payment_method } = req.body;
        const user_id = req.user.id;

        const transaction_id = "TXN" + Date.now();

        const result = await pool.query(
            `INSERT INTO payments (user_id, order_id, amount, payment_method, transaction_id, status)
             VALUES ($1, $2, $3, $4, $5, 'completed')
             RETURNING *`,
            [user_id, order_id, amount, payment_method, transaction_id]
        );

        res.status(201).json({
            message: "Payment Successful",
            payment: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. YOUR EXISTING PAYMENT HISTORY
const getPaymentHistory = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                payments.id,
                payments.order_id,
                payments.amount,
                payments.payment_method,
                payments.status,
                payments.transaction_id,
                payments.created_at,
                users.first_name,
                users.last_name
            FROM payments
            JOIN users ON payments.user_id = users.id
            ORDER BY payments.created_at DESC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createStripePaymentIntent,
    confirmStripePayment,
    makePayment,
    getPaymentHistory
};