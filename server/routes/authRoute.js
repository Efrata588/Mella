const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const authController = require('../controllers/authController')
const { verifyToken, requireRole } = require('../middlewares/authMiddleware')
const { registerRules, loginRules, forgotPasswordRules, resetPasswordRules } = require('../middlewares/validate')

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many requests, please try again later.' }
})

// Public
router.post('/register', authLimiter, registerRules, authController.Register)
router.post('/login', authLimiter, loginRules, authController.Login)
router.get('/verify-email/:token', authController.VerifyEmail)
router.post('/refresh-token', authController.RefreshToken)
router.post('/forgot-password', authLimiter, forgotPasswordRules, authController.ForgetPassword)
router.get('/verify-reset-token/:token', authController.VerifyResetCode)
router.post('/reset-password/:token', resetPasswordRules, authController.ResetPassword)

// Protected
router.post('/logout', verifyToken, authController.Logout)

// Role-based example routes
router.get('/admin', verifyToken, requireRole('admin'), (req, res) => res.json({ message: 'Admin access granted' }))
router.get('/dashboard', verifyToken, requireRole('entrepreneur', 'investor', 'admin'), (req, res) => res.json({ message: 'Dashboard access granted' }))

module.exports = router
