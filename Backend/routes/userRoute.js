const express = require('express');
const { signupUser, loginUser, getMe } = require('../controllers/userController');
const googleLogin = require('../controllers/googleAuthController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/registerUser', signupUser);
router.post('/loginUser', loginUser);
router.post('/googleLogin', googleLogin);

// Current user (requires valid JWT)
router.get('/me', authMiddleware, getMe);

module.exports = router;