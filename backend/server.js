require("dotenv").config();

const app = require("./src/app");

// Additional routes
const salesRoutes = require("./src/routes/salesRoutes");
const revenueRoutes = require("./src/routes/revenueRoutes");
const payoutRoutes = require("./src/routes/payoutRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");

// Mount additional routes
app.use("/api/sales", salesRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 3000;

// Local development
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`🚀 Server running locally on port ${PORT}`);
    });
}

module.exports = app;