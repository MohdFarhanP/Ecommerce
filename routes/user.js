const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const userAuth = require('../middleware/userAuth');



router.get('/home',userAuth.checkSession,userController.homePage);
router.get('/login',userAuth.isLogin,userController.loginPage);
router.post('/login',userController.loginBtn);
router.get('/signup',userAuth.isLogin,userController.signupPage);
router.post('/sent-otp',userController.signupBtn);
router.get('/otp',userAuth.isLogin,userController.otpPage);
router.post('/verifyOtp',userController.verifyOtp);
router.post('/resendOtp',userController.resendOtp);
router.get('/ProductList',userController.ProductList);
router.post('/filterProducts',userController.filterProducts);
router.get('/singleProduct/:id',userController.productPage);
router.post('/singleProduct/:id/review', userController.review);
module.exports = router;