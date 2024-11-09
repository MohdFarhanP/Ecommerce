const express = require('express');
const router = express.Router();
const userAuth = require('../middleware/userAuth');
const authController = require('../controller/user/authController');
const userController = require('../controller/user/userController');
const productController = require('../controller/user/productController');
const orderController = require('../controller/user/orderController');
const cartController = require('../controller/user/cartController')
const wishlistController = require('../controller/user/wishlistController');
const couponController = require('../controller/user/couponController');
const paymentController = require('../controller/user/paymentController');




router.get('/login', userAuth.isLogin, authController.loginPage);
router.post('/login', userAuth.isLogin, authController.loginBtn);
router.get('/signup', userAuth.isLogin, authController.signupPage);
router.post('/sent-otp', authController.signupBtn);
router.get('/otp', authController.otpPage);
router.post('/verifyOtp', authController.verifyOtp);
router.post('/resendOtp', authController.resendOtp);
router.post('/demoLogin', authController.demoLogin);
router.get('/authPrompt', authController.authPromptPage);
router.get('/logOut', userAuth.checkSession, authController.logoutBtn);
router.get('/blocked', authController.blocked);



router.get('/', productController.gestUser)
router.get('/home', productController.homePage);
router.get('/ProductList', productController.productList);
router.post('/filterProducts', productController.filterProducts);
router.get('/singleProduct/:id', productController.productPage);
router.post('/singleProduct/:id/review', userAuth.checkSession, productController.review);



router.get('/userProfile', userAuth.checkSession, userController.userProfile);
router.patch('/userEdit', userAuth.checkSession, userController.editUserProfile);
router.get('/passwordUpdate', userAuth.checkSession, userController.passwordUpdatePage);
router.patch('/passwordUpdate', userAuth.checkSession, userController.passwordUpdate)
router.get('/address', userAuth.checkSession, userController.addressPage);
router.post('/addAddress', userAuth.checkSession, userController.addAddress);
router.put('/editAddress/:id', userAuth.checkSession, userController.editAddress);
router.delete('/deleteAddress/:id', userAuth.checkSession, userController.deleteAddress)
router.patch('/setDefaultAddress', userAuth.checkSession, userController.setDefaultAddress)
router.get('/wallet', userAuth.checkSession, userController.walletPage);



router.get('/orders', userAuth.checkSession, orderController.orders);
router.get('/orderDetails/:orderId/:productId', userAuth.checkSession, orderController.orderDetails);
router.get('/downloadInvoice/:orderId', orderController.downloadInvoice);
router.post('/placeOrder', userAuth.checkSession, orderController.placeOrder);
router.get('/orderSuccess/:orderId', userAuth.checkSession, orderController.orderSuccess)
router.patch('/cancelProduct', userAuth.checkSession, orderController.cancelProduct);
router.patch('/returnProduct', userAuth.checkSession, orderController.returnProduct);
router.get('/checkout', userAuth.checkSession, orderController.checkout);



router.get('/cart', userAuth.checkSession, cartController.cart);
router.post('/addToCart', userAuth.checkSession, cartController.addToCart);
router.delete('/removeCartItem/:id', userAuth.checkSession, cartController.removeCartItem);
router.patch('/updateCartQuantity', userAuth.checkSession, cartController.updateCartQuantity)



router.get("/whishList", userAuth.checkSession, wishlistController.wishlist);
router.post("/wishlistAdd", userAuth.checkSession, wishlistController.addWishlist);
router.delete("/wishlistRemove", userAuth.checkSession, wishlistController.removeWishlist);



router.post("/applyCoupon", userAuth.checkSession, couponController.couponApply);
router.patch('/removeCoupon', userAuth.checkSession, couponController.removeCoupon);



router.post('/createRazorpayOrder', userAuth.checkSession, paymentController.createRazorpayOrder);
router.post('/verifyRazorpayPayment', userAuth.checkSession, paymentController.verifyRazorpayPayment);
router.get('/retryPayment/:orderId', userAuth.checkSession,paymentController.retryPayment);





module.exports = router;