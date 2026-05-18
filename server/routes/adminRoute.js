const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const { verifyToken } = require('../middlewares/authMiddleware')
const isAdmin = require('../middlewares/adminMiddleware')    // 👈 swap this

router.get('/pending', verifyToken, isAdmin, adminController.getPendingProfiles)
router.get('/profile/:id', verifyToken, isAdmin, adminController.getProfileById)
router.patch('/approve/:id', verifyToken, isAdmin, adminController.approveProfile)
router.patch('/reject/:id', verifyToken, isAdmin, adminController.rejectProfile)

module.exports = router