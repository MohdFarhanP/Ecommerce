const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')




router.get('/home',userController.homePage);
router.get('/login',userController.loginPage);
router.post('/login',userController.loginBtn);
router.get('/signup',userController.signupPage);
router.post('/sent-otp',userController.signupBtn);
router.get('/otp',userController.otpPage)


module.exports = router;