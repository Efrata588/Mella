const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    firstName:{
        type: String, 
        required: true
    },

    lastName:{
        type: String,
        required: true
    },

    email:{
        type:String,
        required: true,
        unique: true,
        lowercase:true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },

    password:{
        type: String,
        required: true,
        minlength: 6
    },

    phoneNumber:{
        type: String,
        required: true,
        unique: true
    },

    role:{
        type: String,
        enum: ['entrepreneur', 'investor', 'admin'],
        default: 'entrepreneur'
    },

    isVerified:{
        type: Boolean,
        default: false
    },

    verificationStatus:{
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    isBlocked:{
        type: Boolean,
        default: false
    },

    documentUrl: {
        type: String
    },

    trustScore: {
        type: Number,
        default: 0
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    emailVerificationToken: String,
    emailVerificationExpire: Date,

    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    refreshToken: String

}, { timestamps: true })


module.exports = mongoose.model('User', userSchema)