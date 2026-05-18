const InvestorProfile = require('../models/InvestorProfile')

// Get all profiles that are waiting for review
const getPendingProfiles = async () => {
    return await InvestorProfile.find({ verificationStatus: 'pending' })
        .populate('user', 'firstName lastName email phoneNumber')
}

// Approve a profile by ID
const approveProfile = async (id) => {
    return await InvestorProfile.findByIdAndUpdate(
        id,
        { verificationStatus: 'approved' },
        { new: true }
    )
}

// Reject a profile by ID
const rejectProfile = async (id) => {
    return await InvestorProfile.findByIdAndUpdate(
        id,
        { verificationStatus: 'rejected' },
        { new: true }
    )
}

// Get any single profile by ID
const getProfileById = async (id) => {
    return await InvestorProfile.findById(id)
        .populate('user', 'firstName lastName email phoneNumber')
}

module.exports = {
    getPendingProfiles,
    approveProfile,
    rejectProfile,
    getProfileById
}