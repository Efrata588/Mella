const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh'
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
})

const sendEmail = (to, subject, text) =>
    transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text })

const generateTokens = (userId, role) => ({
    accessToken: jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' }),
    refreshToken: jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: '7d' })
})

// POST /register
const Register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, phoneNumber, role } = req.body

        if (password !== confirmPassword)
            return res.status(400).json({ 
        error: 'Passwords do not match' 
    })

        if (!/^(\+2519\d{8}|09\d{8})$/.test(phoneNumber))
            return res.status(400).json({ 
        error: 'Invalid phone number' 
    })

        if (await User.findOne({ 
            email: email.toLowerCase() 
        }))
            return res.status(400).json({ 
                error: 'Email already exists' 
            })

        if (await User.findOne({ phoneNumber }))
            return res.status(400).json({ 
        error: 'Phone number already exists' 
    })

        const hashPassword = await bcrypt.hash(password, 10)

        const verificationToken = crypto
            .randomBytes(32)
            .toString('hex')
        const hashedVerificationToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex')

        const user = await User.create({
            firstName, lastName,
            email: email.toLowerCase(),
            password: hashPassword,
            phoneNumber, role,
            emailVerificationToken: hashedVerificationToken,
            emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000 // 24h
        })

        const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`
        // await sendEmail(
        //     user.email, 
        //     'Verify your email', 
        //     `Click to verify your account:\n\n${verifyUrl}\n\nExpires in 24 hours.`)

        return res.status(201).json({
            message: 'Account created. Please verify your email.',
            user: { 
                id: user._id, 
                firstName: user.firstName, 
                email: user.email, 
                role: user.role }
        })
    } catch (error) { next(error) }
}

// GET /verify-email/:token
const VerifyEmail = async (req, res, next) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex')
            
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() }
        })

        if (!user) return res.status(400).json({ error: 'Invalid or expired verification link' })

        user.isVerified = true
        user.emailVerificationToken = undefined
        user.emailVerificationExpire = undefined
        await user.save({ validateBeforeSave: false })

        return res.status(200).json({ message: 'Email verified successfully' })
    } catch (error) { next(error) }
}

// POST /login
const Login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password +loginAttempts +lockUntil +refreshToken')

        if (!user) return res.status(401).json({ error: 'Invalid credentials' })

        if (user.isBlocked) return res.status(403).json({ error: 'Account is blocked' })

        // Check lock
        if (user.lockUntil && user.lockUntil > Date.now())
            return res.status(423).json({ 
                error: `Account locked. Try again after ${new Date(user.lockUntil).toISOString()}` 
            })

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            user.loginAttempts += 1
            if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS)
                user.loginAttempts = 0
            }
            await user.save({ validateBeforeSave: false })
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Reset on success
        user.loginAttempts = 0
        user.lockUntil = undefined

        const { accessToken, refreshToken } = generateTokens(user._id, user.role)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: { id: user._id, 
                email: user.email, 
                firstName: user.firstName, 
                role: user.role }
        })
    } catch (error) { next(error) }
}

// POST /refresh-token
const RefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' })

        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
        const user = await User.findById(decoded.userId).select('+refreshToken')

        if (!user || user.refreshToken !== refreshToken)
            return res.status(403).json({ error: 'Invalid refresh token' })

        const tokens = generateTokens(user._id, user.role)
        user.refreshToken = tokens.refreshToken
        await user.save({ validateBeforeSave: false })

        return res.status(200).json(tokens)
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')
            return res.status(403).json({ error: 'Invalid or expired refresh token' })
        next(error)
    }
}

// POST /logout
const Logout = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.userId, { refreshToken: undefined })
        return res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) { next(error) }
}

// POST /forgot-password
const ForgetPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email.toLowerCase() })
        if (!user) return res.status(404).json({ error: 'No account with that email' })

        const resetToken = crypto.randomBytes(32).toString('hex')
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000 // 15 min
        await user.save({ validateBeforeSave: false })

        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`
        await sendEmail(user.email, 'Password Reset Request', `Reset your password:\n\n${resetUrl}\n\nExpires in 15 minutes.`)

        return res.status(200).json({ message: 'Password reset email sent' })
    } catch (error) { next(error) }
}

// GET /verify-reset-token/:token
const VerifyResetCode = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
        const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } })
        if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' })
        return res.status(200).json({ message: 'Token valid' })
    } catch (error) { next(error) }
}

// POST /reset-password/:token
const ResetPassword = async (req, res, next) => {
    try {
        const { password, confirmPassword } = req.body
        if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' })

        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
        const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } })
        if (!user) return res.status(400).json({ error: 'Invalid or expired token' })

        user.password = await bcrypt.hash(password, 10)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        user.loginAttempts = 0
        user.lockUntil = undefined
        await user.save()

        return res.status(200).json({ message: 'Password reset successful' })
    } catch (error) { next(error) }
}

module.exports = { Register, VerifyEmail, Login, RefreshToken, Logout, ForgetPassword, VerifyResetCode, ResetPassword }
