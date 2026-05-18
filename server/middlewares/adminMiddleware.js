const User = require('../models/user')

const isAdmin = async (req, res, next) => {
    try {
        // req.user is set by verifyToken middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - please log in'
            })
        }

        // Check the role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied - admins only'
            })
        }

        // Fetch the full user from DB to check if they are blocked
        const admin = await User.findById(req.user.userId)

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin account not found'
            })
        }

        if (admin.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Admin account is blocked'
            })
        }

        // All checks passed - move to the controller
        next()

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = isAdmin