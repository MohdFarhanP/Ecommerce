const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const userAuth = require('../middleware/userAuth');



// Public routes (no session required)
router.get('/login', userAuth.isLogin, userController.loginPage); 
router.post('/login', userAuth.isLogin, userController.loginBtn);  
router.get('/signup', userAuth.isLogin, userController.signupPage); 
router.post('/sent-otp', userAuth.isLogin, userController.signupBtn);
router.get('/otp', userAuth.isLogin, userController.otpPage);
router.post('/verifyOtp', userAuth.isLogin, userController.verifyOtp);
router.post('/resendOtp', userController.resendOtp);
router.post('/demoLogin', userController.demoLogin);

// Protected routes (session required)
router.get('/home', userAuth.checkSession, userController.homePage);
router.get('/ProductList', userAuth.checkSession, userController.ProductList);
router.post('/filterProducts', userAuth.checkSession, userController.filterProducts);
router.get('/singleProduct/:id', userAuth.checkSession, userController.productPage);
router.post('/singleProduct/:id/review', userAuth.checkSession, userController.review);
router.get('/logOut', userAuth.checkSession, userController.logoutbtn);

// User profile and settings (session required)
router.get('/userProfile', userAuth.checkSession, userController.userProfile);
router.post('/userEdit', userAuth.checkSession, userController.editUserProfile);
router.get('/passwordUpdate', userAuth.checkSession, userController.passwordUpdatePage);
router.post('/passwordUpdate',userAuth.checkSession,userController.passwordUpdate)
router.get('/address', userAuth.checkSession, userController.addressPage);
router.post('/addAddress',userAuth.checkSession,userController.addAddress);
router.post('/editAddress/:id',userAuth.checkSession,userController.editAddress);
router.post('/deleteAddress/:id',userAuth.checkSession,userController.deleteAddress)
router.post('/setDefaultAddress',userAuth.checkSession,userController.setDefaultAddress)
router.get('/orders', userAuth.checkSession, userController.orders);

// Shopping and checkout (session required)
router.get('/cart', userAuth.checkSession, userController.cart);
router.post('/addToCart',userAuth.checkSession,userController.addToCart)
router.get('/checkout', userAuth.checkSession, userController.checkout);

// Blocked page for users who are blocked
router.get('/blocked', userController.blocked);

module.exports = router;