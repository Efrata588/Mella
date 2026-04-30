const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { error } = require('node:console')

require('dotenv').config()

const JWT_SECTETE = process.env.JWT_SECTETE

//Registration 
const Register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, phoneNumber, role } = req.body

        if (!firstName, !lastName, !eamil, !password, !confirmPassword, !phoneNumber, !role ) {
            return res.status(400).json({
                error: "Please enter all the required feilds."
            })
        }

        if (password !== confirmPassword){
            return res.status(400).json({
                error: "Password does not match"
            })
        }

        const phone = /^(\+2519\d{8} | 09\d{d})$/

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
        const hashPassword = await bcrypt.hash(password)

        const name = firstName + " " + lastName
        const createdUser = await User.create({
            name,
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
                    name: createdUser.name,
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


module.exports = { Register }