// middleware/isAdmin.js
module.exports = function (req, res, next) {
    // Check if user is logged in AND their role is 'admin'
    if (req.session.user && req.session.user.role === 'admin') {
        return next(); // Let them pass
    }

    // If not admin, send an error
    res.status(403).send("Access Denied: Only Admins can perform this action.");
};