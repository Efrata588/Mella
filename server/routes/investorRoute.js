const express = require('express')

const router = express.Router()

const investorController = require('../controllers/investorController')
const { verifyToken } = require('../middlewares/authMiddleware')
const authorizeRoles = require('../middlewares/roleMiddleware')



router.post('/', verifyToken, investorController.createInvestorProfile)
router.get('/me', verifyToken, investorController.getOwnProfile)
router.put('/me', verifyToken, investorController.updateProfile)
router.delete('/me', verifyToken, investorController.deleteProfile)
router.get('/', verifyToken, authorizeRoles('admin'), investorController.getAllProfile)
router.patch('/verify/:id', verifyToken, authorizeRoles('admin'), investorController.verifyInvestor)


router.get(
  '/:id',
  investorController.getProfileById
)

module.exports = router