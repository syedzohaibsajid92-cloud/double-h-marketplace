const pool = require("../config/db");

const getVendorDashboard = async (req, res) => {
    try {

        const { vendorId } = req.params;

        const vendor = await pool.query(
            `
            SELECT
                business_name,
                total_sales,
                pending_payout,
                commission_rate,
                is_active,
                user_id
            FROM vendors
            WHERE id = $1
            `,
            [vendorId]
        );

        if (vendor.rows.length === 0) {
            return res.status(404).json({
                message: "Vendor not found"
            });
        }

        const vendorData = vendor.rows[0];

        // Ownership check: admin can view any vendor; a vendor can only view their own
        const requesterRole = (req.user.role || "").toLowerCase();
        const isAdmin = requesterRole === "admin";
        const isOwner = vendorData.user_id === req.user.id;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                message: "Access denied. You can only view your own vendor dashboard."
            });
        }

        const totalProducts = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM products
            WHERE vendor_id = $1
            `,
            [vendorId]
        );

        const totalOrders = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM orders
            WHERE vendor_id = $1
            `,
            [vendorId]
        );

        res.status(200).json({

            vendor: {
                business_name: vendorData.business_name,
                total_sales: vendorData.total_sales,
                pending_payout: vendorData.pending_payout,
                commission_rate: vendorData.commission_rate,
                is_active: vendorData.is_active
            },

            statistics: {
                total_products: totalProducts.rows[0].total,
                total_orders: totalOrders.rows[0].total
            }

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

module.exports = {
    getVendorDashboard
};