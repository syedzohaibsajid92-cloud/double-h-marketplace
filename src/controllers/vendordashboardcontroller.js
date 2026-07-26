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
                is_active
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

            vendor: vendor.rows[0],

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