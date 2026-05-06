const investorService = require('../services/investorService')


const createInvestorProfile = async (req, res) => {

    try {
        const profile = await investorService.createProfile({
            ...req.body,
            user: req.user.id
        })

        res.status(200).json({
            success: true,
            data: profile
        })
    } catch (error) {
        res.statsu(500).josn({
            message: error.message
        })
    }
}


const getOwnProfile = async (req, res) => {
    try {
        const profile = await investorService.getOwnProfile(req.user.id)

        res.status(200).json({
            profile
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const updateProfile = async (req, res) => {
    try {
        const updated = await investorService.updateProfile(
            req.user.id, 
            req.body
        )

        res.status(200).josn({
            updated
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


const deleteProfile = async (req, res) => {
    try {
        await investorService.deleteProfile(req.user.id)

        res.status(200).json({
            message: 'Profile deleted successfully'
        })

    }catch(error){
        res.status(500).json({
            message: error.message
        })
    }
}

const getAllProfile = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit 

        const filter = {}

        if(req.query.investorType) {
            filter.investorType = req.query.investorType
        }

        if(req.query.location) {
            filter.location = req.query.location
        }


        const profiles = await investorService.getAllProfile(
            filters,
            skip, 
            limit
        )

        res.status(200).json({
            page, 
            limit,
            data: profiles
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


const getProfileById = async (req, res) => {
    try {
        const profile = await investorService.getProfileById(req.params.id)

        res.status(200).json({
            profile
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

module.exports = {
    createInvestorProfile,
    getOwnProfile,
    updateProfile,
    deleteProfile,
    getAllProfile,
    getProfileById
}