const express = require('express')
const router = express.Router()
const authController = require('../controllers//authController')
const { verifyToke } = require('../middlewares/authMiddleware')


router.post('/register', authController.Register)


module.exports = router