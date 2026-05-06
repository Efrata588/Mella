const express = require('express')

const router = express.Router()

const investorController = require('../controllers/investorProfile.controller')

const authMiddleware = require('../middlewares/auth.middleware')

const authorizeRoles = require('../middlewares/role.middleware')



router.post(
  '/',
  authMiddleware,
  investorController.createInvestorProfile
)



router.get(
  '/me',
  authMiddleware,
  investorController.getOwnProfile
)



router.put(
  '/me',
  authMiddleware,
  investorController.updateProfile
)


router.delete(
  '/me',
  authMiddleware,
  investorController.deleteProfile
)

router.get(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  investorController.getAllProfiles
)



router.patch(
  '/verify/:id',
  authMiddleware,
  authorizeRoles('admin'),
  investorController.verifyInvestor
)


router.get(
  '/:id',
  investorController.getProfileById
)

module.exports = router