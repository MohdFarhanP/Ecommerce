const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const userAuth = require('../middleware/userAuth');



router.get('/home',userAuth.checkSession,userController.homePage);
router.get('/login',userAuth.isLogin,userController.loginPage);
router.post('/login',userController.loginBtn);
router.get('/signup',userAuth.isLogin,userController.signupPage);
router.post('/sent-otp',userController.signupBtn);
router.get('/otp',userAuth.isLogin,userController.otpPage)
router.post('/verifyOtp',userController.verifyOtp)
router.post('/resendOtp',userController.resendOtp)
module.exports = router;