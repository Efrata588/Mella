const mongoose = require('mongoose')

const investorProfileSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    investorType:{
        type: String,
        enum: ['Private Equity', 'Corporate Investor', 'Angel Investor'],
        required: true
    },
    bio:{
        type: String,
        maxlength: 1000
    },
    industriesInterested:[
        {
            type: String
        }
    ],
    investmentRange:{
        min:{
            type: Number
        },
        max:{
            type: Number
        }
    },

    preferredStages:[
        {
            type: String,
            enum: ['Seed', 'Series A', 'Series B', 'Growth']
        }
    ],
    linkedinUrl:{
        type: String
    },
    website:{
        type: String
    },
    location:{
        type: String
    },
    profileImage:{
        type: String
    },
    verificationStatus:{
        type: String,
        enum: ['pending', 'approved', 'rejected'],
    }
},
{
    timestamps: true
}

)

module.exports = mongoose.model('InvestorProfile', investorProfileSchema)