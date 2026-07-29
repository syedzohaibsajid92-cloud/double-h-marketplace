require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/db");
const salesRoutes = require('./src/routes/salesRoutes');
app.use('/api/sales', salesRoutes);
const revenueRoutes = require('./src/routes/revenueRoutes');
app.use('/api/revenue', revenueRoutes);
const payoutRoutes = require('./src/routes/payoutRoutes');
app.use('/api/payouts', payoutRoutes);
const analyticsRoutes = require('./src/routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);


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