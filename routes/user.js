const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const userAuth = require('../middleware/userAuth');



// Public routes (no session required)
router.get('/login', userAuth.isLogin, userController.loginPage);
router.post('/login', userAuth.isLogin, userController.loginBtn);
router.get('/signup', userAuth.isLogin, userController.signupPage);
router.post('/sent-otp', userController.signupBtn);
router.get('/otp', userController.otpPage);
router.post('/verifyOtp', userController.verifyOtp);
router.post('/resendOtp', userController.resendOtp);
router.post('/demoLogin', userController.demoLogin);
router.get('/authPrompt', userController.authPromptPage);

// Protected routes (session required)
router.get('/', userController.gestUser)
router.get('/home', userController.homePage);
router.get('/ProductList', userController.ProductList);
router.post('/filterProducts', userController.filterProducts);
router.get('/singleProduct/:id', userController.productPage);
router.post('/singleProduct/:id/review', userAuth.checkSession, userController.review);
router.get('/logOut', userAuth.checkSession, userController.logoutbtn);

// User profile and settings (session required)
router.get('/userProfile', userAuth.checkSession, userController.userProfile);
router.patch('/userEdit', userAuth.checkSession, userController.editUserProfile);
router.get('/passwordUpdate', userAuth.checkSession, userController.passwordUpdatePage);
router.patch('/passwordUpdate', userAuth.checkSession, userController.passwordUpdate)
router.get('/address', userAuth.checkSession, userController.addressPage);
router.post('/addAddress', userAuth.checkSession, userController.addAddress);
router.put('/editAddress/:id', userAuth.checkSession, userController.editAddress);
router.delete('/deleteAddress/:id', userAuth.checkSession, userController.deleteAddress)
router.patch('/setDefaultAddress', userAuth.checkSession, userController.setDefaultAddress)
router.get('/orders', userAuth.checkSession, userController.orders);
router.get('/orderDetails/:orderId/:productId', userAuth.checkSession, userController.orderDetails);
router.get('/downloadInvoice/:orderId', userController.downloadInvoice);
router.post('/placeOrder', userAuth.checkSession, userController.placeOrder);
router.get('/orderSuccess/:orderId', userAuth.checkSession, userController.orderSuccess)
router.patch('/cancelProduct', userAuth.checkSession, userController.cancelProduct);
router.patch('/returnProduct', userAuth.checkSession, userController.returnProduct);
// Shopping and checkout (session required)
router.get('/cart', userAuth.checkSession, userController.cart);
router.post('/addToCart', userAuth.checkSession, userController.addToCart);
router.delete('/removeCartItem/:id', userAuth.checkSession, userController.removeCartItem);
router.patch('/updateCartQuantity', userAuth.checkSession, userController.updateCartQuantity)
router.get('/checkout', userAuth.checkSession, userController.checkout);
router.get("/whishList", userAuth.checkSession, userController.whishlist);
router.post("/wishlistAdd", userAuth.checkSession, userController.addWishlist);
router.delete("/wishlistRemove", userAuth.checkSession, userController.removeWishlist);
router.post("/applyCoupon", userAuth.checkSession, userController.couponApply);
router.patch('/removeCoupon', userAuth.checkSession, userController.removeCoupon);
router.post('/create-razorpay-order', userAuth.checkSession, userController.createRazorpayOrder);
router.post('/verify-razorpay-payment', userAuth.checkSession, userController.verifyRazorpayPayment);
router.get('/wallet', userAuth.checkSession, userController.walletpage);

// Blocked page for users who are blocked
router.get('/blocked', userController.blocked);

module.exports = router;