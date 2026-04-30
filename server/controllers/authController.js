const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const nodemailer = require('nodemailer')


require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET


//Registration 
const Register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, phoneNumber, role } = req.body

        if (!firstName || !lastName || !email || !password || !confirmPassword || !phoneNumber || !role ) {
            return res.status(400).json({
                error: "Please enter all the required feilds."
            })
        }

        if (password !== confirmPassword){
            return res.status(400).json({
                error: "Password does not match"
            })
        }

        const phone = /^(\+2519\d{8}|09\d{8})$/

        if(!phone.test(phoneNumber)){
            return res.status(400).json({
                error: 'Invalid phone number'
            })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser){
            return res.status(400).json({
                error: "Email already exists"
            })
        }

        const existinPhone = await User.findOne({ phoneNumber })
        if(existinPhone){
            return res.status(400).json({
                error:"Phone number already exists"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const createdUser = await User.create({
            firstName,
            lastName,
            email: email,
            password: hashPassword,
            phoneNumber,
            role
        })

         if (!JWT_SECRET) {
            return res.status(201).json({
                message: 'Account created successfully',
                user: {
                    id: createdUser._id,
                    firstName: createdUser.firstName,
                    lastName: createdUser.lastName,
                    email: createdUser.email,
                    phoneNumber: createdUser.phoneNumber
                }
            });
        }

        const token = jwt.sign({ userId: createdUser._id }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(201).json({
            message: 'Account created successfully',
            token,
            user: {
                id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
                phoneNumber: createdUser.phoneNumber,
                role: createdUser.role
            }
        });



    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

const Login = async (req, res) => {
    try {
        const { email, password } = req.body

        if(!email || !password){
            return res.status(400).json({
                error: "Please enter all the required feilds."
            })
        }
        
        if(!JWT_SECRET){
            return res.status(500).json({
                error: "JWT secret is not configured"
            })
        }

        const user = await User
            .findOne({ email: email.toLowerCase() })
            .select('+password')

        if(!user){
            return res.status(400).json({
                error: "Invalid email name or password"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password) 

        if(!isMatch){
            return res.status(400).json({
                error: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            {
                userId: user._id
            },
            JWT_SECRET,
            {
                expiresIn: '1h'
            }
        )

        return res.status(200).json({
            message: "Login Successfully",
            token,
            user:{
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                role: user.role
            }
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

const ForgetPassword = async (req, res) => {
    try {
        
        const { email } = req.body

        const user = await User.findOne({ email })

        if (!user){
            return res.status(404).json({
                error: "User not found"
            })
        }

        const resetToken = crypto.randomBytes(32).toString('hex')

        const hashToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex')

        user.resetPasswordToken = hashToken

        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000

        await user.save({ validateBeforeSave: false })
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`

        const treasporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        const message = `

            You requested a password reset. 

            Click this link to  reset you password:

            ${resetUrl}

            This link expires in 15 minutes.
        
        `
        await treasporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            text: message
        })


        res.status(200).json({
            message: 'Reset email sent'
        })


    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

const VerifyResetCode = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

const ResetPassword = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

module.exports = { Register, Login, ForgetPassword, VerifyResetCode, ResetPassword }