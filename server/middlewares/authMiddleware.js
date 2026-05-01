const jwt = require('jsonwebtoken');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    try {
        if (!JWT_SECRET) {
            return res.status(500).json({ message: 'JWT secret is not configured' });
        }

        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        const status = err.name === 'TokenExpiredError' ? 401 : 403;
        return res.status(status).json({ message: 'Invalid or expired token' });
    }
};

module.exports = verifyToken;