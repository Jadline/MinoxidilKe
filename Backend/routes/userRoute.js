const express = require('express')
const{signupUser,loginUser} = require('../controllers/userController')
const googleLogin = require('../controllers/googleAuthController')

const router = express.Router()

router.route('/registerUser').post(signupUser)
router.route('/loginUser').post(loginUser)
router.route('/googleLogin').post(googleLogin)


module.exports = router;