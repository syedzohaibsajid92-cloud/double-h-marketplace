const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path"); // Added path module


// Route imports
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const vendorDashboardRoutes = require("./routes/vendorDashboardRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const b2bRoutes = require("./routes/b2bRoutes");
const disputeRoutes = require("./routes/disputeRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require("./routes/profileRoutes");
const addressRoutes = require("./routes/addressRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const returnRoutes = require("./routes/returnRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const imageRoutes = require("./routes/imageRoutes"); // Added Image routes
const brandRoutes = require('./routes/brandRoutes');
const stockRoutes = require('./routes/stockRoutes');
const discountRoutes = require('./routes/discountRoutes');


const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allows frontend to fetch uploaded images freely
  })
);
app.use(morgan("dev"));

// Serve static files from the uploads directory (located at the root level)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Double H Marketplace API is running");
});

// Route Endpoints
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/vendor-dashboard", vendorDashboardRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api/b2b", b2bRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/images", imageRoutes); // Added Image API route
app.use('/api/brands', brandRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/discounts', discountRoutes);
module.exports = app;