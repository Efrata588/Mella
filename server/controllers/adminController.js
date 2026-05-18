const adminService = require('../services/adminService')

// GET /admin/pending
const getPendingProfiles = async (req, res) => {
    try {
        const profiles = await adminService.getPendingProfiles()

        if (!profiles || profiles.length === 0) {
            return res.status(404).json({ message: 'No pending profiles found' })
        }

        res.status(200).json({
            success: true,
            count: profiles.length,
            data: profiles
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// PATCH /admin/approve/:id
const approveProfile = async (req, res) => {
    try {
        const profile = await adminService.approveProfile(req.params.id)

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' })
        }

        res.status(200).json({
            success: true,
            message: 'Profile approved successfully',
            data: profile
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// PATCH /admin/reject/:id
const rejectProfile = async (req, res) => {
    try {
        const profile = await adminService.rejectProfile(req.params.id)

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' })
        }

        res.status(200).json({
            success: true,
            message: 'Profile rejected successfully',
            data: profile
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// GET /admin/profile/:id
const getProfileById = async (req, res) => {
    try {
        const profile = await adminService.getProfileById(req.params.id)

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' })
        }

        res.status(200).json({
            success: true,
            data: profile
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    getPendingProfiles,
    approveProfile,
    rejectProfile,
    getProfileById
}