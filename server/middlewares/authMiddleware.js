const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token provided' })

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (err) {
        return res.status(err.name === 'TokenExpiredError' ? 401 : 403).json({ error: 'Invalid or expired token' })
    }
}

const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role))
        return res.status(403).json({ error: 'Access denied' })
    next()
}

module.exports = { verifyToken, requireRole }
