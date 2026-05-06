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
        
    }
}


const deleteProfile = async (req, res) => {
    await investorService.deleteProfile(req.user.id)

    res.status(200).json({
        message: 'Profile deleted successfully'
    })
}


