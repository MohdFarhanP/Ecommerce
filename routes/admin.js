const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const adminAuth = require('../middleware/adminAuth');

// Routes that don't require admin to be logged in
router.get('/adminLogin', adminAuth.isLogin, adminController.loadLogin);
router.post('/loginbtn', adminController.loginBtn);
router.post('/logout', adminController.logoutBtn); // Logout might not need middleware, but you can add if required

// Routes that require admin to be logged in
router.get('/users', adminAuth.checkSession, adminController.usersPage);
router.post('/unblock/:id', adminAuth.checkSession, adminController.unblockUser);
router.post('/block/:id', adminAuth.checkSession, adminController.blockUser);
router.get('/category', adminAuth.checkSession, adminController.categoryPage);
router.post('/addCategory', adminAuth.checkSession, adminController.addCategory);
router.post('/editCategory', adminAuth.checkSession, adminController.editCategory);
router.post('/deleteCategory', adminAuth.checkSession, adminController.deleteCategory);
router.post('/activeCategory', adminAuth.checkSession, adminController.activeCategory);
router.get('/products', adminAuth.checkSession, adminController.productPage);
router.post('/addProduct', adminAuth.checkSession, adminController.upload.array("images", 3), adminController.addProduct);
router.post('/editProduct', adminAuth.checkSession, adminController.upload.any("images", 3), adminController.editProduct);
router.post('/deleteProduct', adminAuth.checkSession, adminController.deleteProduct);
router.post('/activeProduct', adminAuth.checkSession, adminController.activeProduct);
router.get('/ordersList', adminAuth.checkSession, adminController.orders);
router.post('/changeOrderStatus', adminAuth.checkSession, adminController.changeOrderStatus);
router.post('/cancelOrder', adminAuth.checkSession, adminController.cancelOrder);
router.get('/inventory', adminAuth.checkSession, adminController.inventory);
router.post('/editInventory', adminAuth.checkSession, adminController.editInventory);
router.post('/deleteInventory', adminAuth.checkSession, adminController.deleteInventory);
router.post('/updateStock', adminAuth.checkSession, adminController.updateStock);
router.get('/coupon',adminAuth.checkSession,adminController.coupon);
router.post('/createCoupon',adminController.upload.none(),adminAuth.checkSession,adminController.createCoupon);
router.post('/deleteCoupon/:id',adminAuth.checkSession,adminController.deleteCoupon);
router.get('/offer',adminAuth.checkSession,adminController.offer);
router.post('/createOffer',adminController.upload.none(),adminAuth.checkSession,adminController.createOffer);
router.post('/editOffer',adminController.upload.none(),adminAuth.checkSession,adminController.editOffer);
router.post('/deleteOffer',adminAuth.checkSession,adminController.deleteOffer)




module.exports = router;
