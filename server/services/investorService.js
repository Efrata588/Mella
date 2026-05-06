const InvestorProfile = require('../models/user')

const createProfile = async (data) => {
    return await InvestorProfile.create(data)
}

const getOwnProfile = async (userId) =>{
    return await InvestorProfile.findOne({
        user: userId
    })
}

const updateProfile = async(userId, data) => {
    return await InvestorProfile.findOneAndUpdate(
        {
            user: userId
        },
        data, 
        { new: true }
    )
}
const deleteProfile = async(userId) => {
    return await InvestorPrifile.findOneAndDelete({
        user: userId
    })
}
const getAllProfile = async (filter, skip, limit) => {
    return await InvestorProfile.find(filter)
        .skip(skip)
        .limit(limit)
}
const getProfileById = async(id) => {
    return await InvestorProfile.findById(id)
}


module.exports ={
    createProfile,
    getOwnProfile,
    updateProfile,
    deleteProfile,
    getAllProfile,
    getProfileById
}