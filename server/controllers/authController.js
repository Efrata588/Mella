const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const Register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, phoneNumber, role } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !phoneNumber || !role) {
            return res.status(400).json({ error: "Please enter all required fields." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        // Ethiopian Phone Regex
        const phoneRegex = /^(\+2519\d{8}|09\d{8})$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ error: 'Invalid phone number' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) return res.status(400).json({ error: "Email already exists" });

        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) return res.status(400).json({ error: "Phone number already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const createdUser = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashPassword,
            phoneNumber,
            role
        });

        const token = JWT_SECRET ? jwt.sign({ userId: createdUser._id }, JWT_SECRET, { expiresIn: '1h' }) : null;

        return res.status(201).json({
            message: 'Account created successfully',
            token,
            user: {
                id: createdUser._id,
                firstName: createdUser.firstName,
                lastName: createdUser.lastName,
                email: createdUser.email,
                role: createdUser.role
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ error: "Please enter all fields." });
        if (!JWT_SECRET) return res.status(500).json({ error: "JWT secret is not configured" });

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            message: "Login Successful",
            token,
            user: {
                email: user.email,
                firstName: user.firstName,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const ForgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) return res.status(404).json({ error: "User not found" });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 Mins
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const message = `You requested a password reset. Click the link to proceed: \n\n ${resetUrl} \n\n This expires in 15 mins.`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            text: message
        });

        res.status(200).json({ message: 'Reset email sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const VerifyResetCode = async (req, res) => {
    try {
        const { token } = req.params;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // FIXED: Added await here
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

        return res.status(200).json({ message: 'Token verified' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const ResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { Register, Login, ForgetPassword, VerifyResetCode, ResetPassword };