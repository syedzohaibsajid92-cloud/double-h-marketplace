const jwt = require("jsonwebtoken");

// Verifies Bearer JWT token from Authorization header
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid token format. Use 'Bearer <token>'.",
    });
  }

  try {
   if (!process.env.JWT_SECRET) {
  return res.status(500).json({ message: "Server misconfigured." });
}
const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

// Protects endpoints requiring Admin privileges
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }
  });
};

// Protects endpoints requiring Vendor privileges
const verifyVendor = (req, res, next) => {
  verifyToken(req, res, () => {
    const role = req.user?.role?.toLowerCase();
    if (role === "vendor" || role === "admin") {
      next();
    } else {
      res.status(403).json({
        message: "Access denied. Vendor privileges required.",
      });
    }
  });
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyVendor,
};