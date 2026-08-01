require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/db");

// Import Routes
const salesRoutes = require('./src/routes/salesRoutes');
const revenueRoutes = require('./src/routes/revenueRoutes');
const payoutRoutes = require('./src/routes/payoutRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes'); // 👈 Added payment routes import

// Mount Routes
app.use('/api/sales', salesRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes); // 👈 Mounted payment routes

const PORT = process.env.PORT || 3000;

pool.connect()
  .then(() => {
    console.log("✅ Connected to PostgreSQL Database!");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:");
    console.error(err.message);
  });