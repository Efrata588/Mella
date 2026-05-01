const { body, validationResult } = require('express-validator')

const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array().map(e => e.msg) })
    next()
}

const registerRules = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').notEmpty().withMessage('Confirm password is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('role').isIn(['entrepreneur', 'investor', 'admin']).withMessage('Invalid role'),
    validate
]

const loginRules = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
]

const forgotPasswordRules = [
    body('email').isEmail().withMessage('Valid email is required'),
    validate
]

const resetPasswordRules = [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').notEmpty().withMessage('Confirm password is required'),
    validate
]

module.exports = { registerRules, loginRules, forgotPasswordRules, resetPasswordRules }
