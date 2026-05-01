const express = require('express')
const router = express.Router()
const authController = require('../controllers//authController')
const { verifyToke } = require('../middlewares/authMiddleware')


router.post('/register', authController.Register)
router.post('/login', authController.Login)
router.post('/forgot-password',ForgetPassword)
router.get('/verify-reset-code/:token',VerifyResetCode)
router.post('/reset-password/:token',ResetPassword)


module.exports = router