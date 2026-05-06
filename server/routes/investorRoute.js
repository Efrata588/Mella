const express = require('express')

const router = express.Router()

const investorController = require('../controllers/investorProfile.controller')

const authMiddleware = require('../middlewares/auth.middleware')

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
  investorController.getAllProfile
)

router.get(
  '/:id',
  investorController.getProfileById
)

module.exports = router