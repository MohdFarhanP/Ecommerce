const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const userAuth = require('../middleware/userAuth');



router.get('/home',userAuth.checkSession,userController.homePage);
router.get('/login',userAuth.isLogin,userController.loginPage);
router.post('/login',userAuth.isLogin,userController.loginBtn); 
router.get('/signup',userAuth.isLogin,userController.signupPage);
router.post('/sent-otp',userAuth.isLogin,userController.signupBtn);
router.get('/otp',userAuth.isLogin,userController.otpPage);
router.post('/verifyOtp',userAuth.isLogin,userController.verifyOtp);
router.post('/resendOtp',userAuth.isLogin,userController.resendOtp);
router.get('/ProductList',userAuth.checkSession,userController.ProductList);
router.post('/filterProducts',userAuth.checkSession,userController.filterProducts);
router.get('/singleProduct/:id',userAuth.checkSession,userController.productPage);
router.post('/singleProduct/:id/review',userAuth.checkSession,userController.review);
router.get('/logOut',userAuth.checkSession,userController.logoutbtn);
router.post('/demoLogin',userController.demoLogin)
module.exports = router;