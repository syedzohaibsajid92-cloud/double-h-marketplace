const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const userRole = (req.user.role || "").toLowerCase();
        const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

        if (!normalizedAllowed.includes(userRole)) {
            return res.status(403).json({
                message: "Access denied. Insufficient permissions."
            });
        }

        next();

    };

};

module.exports = authorizeRoles;