require("dotenv").config();

const app = require("./src/app");

// Import Additional Routes
const salesRoutes = require('./src/routes/salesRoutes');
const revenueRoutes = require('./src/routes/revenueRoutes');
const payoutRoutes = require('./src/routes/payoutRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');

// Mount Additional Routes
app.use('/api/sales', salesRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 3000;

// Local development server listener
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}

// Required for Vercel Serverless Function
module.exports = app;