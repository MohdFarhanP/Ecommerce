const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController')
const adminAuth = require('../middleware/adminAuth');


router.get('/adminLogin', adminAuth.isLogin, adminController.loadLogin);
router.post('/loginbtn', adminController.loginBtn);
router.post('/logout', adminController.logoutBtn)
router.get('/users', adminController.usersPage);
router.post('/unblock/:id', adminController.unblockUser);
router.post('/block/:id', adminController.blockUser);
router.get('/category', adminController.categoryPage);
router.post('/addCategory', adminController.addCategory);
router.post('/editCategory', adminController.editCategory);
router.post('/deleteCategory', adminController.deleteCategory);
router.post('/activeCategory', adminController.activeCategory)
router.get('/products', adminController.productPage);
router.post('/addProduct', adminController.upload.array("images", 3), adminController.addProduct);
router.post('/editProduct', adminController.upload.any("images", 3), adminController.editProduct);
router.post('/deleteProduct', adminController.deleteProduct);
router.post('/activeProduct', adminController.activeProduct)
router.get('/orders', adminController.orders);
router.post('/changeOrderStatus', adminController.changeOrderStatus);
router.post('/cancelOrder', adminController.cancelOrder);
router.get('/inventory', adminController.inventry);
router.post('/editInventory', adminController.editInventry);
router.post('/deleteInventory', adminController.deleteInventory);
router.post('/updateStock', adminController.updateStock)

module.exports = router;