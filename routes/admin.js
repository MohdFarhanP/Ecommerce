const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController')
const adminAuth = require('../middleware/adminAuth');


router.get('/login',adminController.loadLogin);
router.post('/loginbtn',adminController.loginBtn);
router.post('/logout',adminController.logoutBtn)
router.get('/users',adminAuth.checkSession,adminController.usersPage);
router.post('/unblock/:id',adminAuth.checkSession,adminController.unblockUser);
router.post('/block/:id',adminAuth.checkSession,adminController.blockUser);
router.get('/category',adminAuth.checkSession,adminController.categoryPage);
router.post('/addCategory',adminAuth.checkSession,adminController.addCategory);
router.post('/editCategory',adminAuth.checkSession,adminController.editCategory);
router.post('/deleteCategory',adminAuth.checkSession,adminController.deleteCategory);
router.get('/products',adminController.productPage);
router.post('/addProduct',adminAuth.checkSession,adminController.upload.array("images",3),adminController.addProduct);
router.post('/editProduct',adminAuth.checkSession,adminController.upload.array("images",3),adminController.editProduct);
router.post('/deleteProduct',adminAuth.checkSession,adminController.deleteProduct);
router.get('/orders',adminController.orders)


module.exports = router;