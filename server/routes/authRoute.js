const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.Register);
router.post('/login', authController.Login);
router.post('/forgot-password', authController.ForgetPassword);
router.get('/verify-reset-code/:token', authController.VerifyResetCode);
router.post('/reset-password/:token', authController.ResetPassword);

module.exports = router;