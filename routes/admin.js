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
router.patch('/unblock/:id', adminAuth.checkSession, adminController.unblockUser);
router.patch('/block/:id', adminAuth.checkSession, adminController.blockUser);
router.get('/dashboard',adminAuth.checkSession,adminController.dashboard)
router.get('/category', adminAuth.checkSession, adminController.categoryPage);
router.post('/addCategory', adminAuth.checkSession, adminController.addCategory);
router.put('/editCategory', adminAuth.checkSession, adminController.editCategory);
router.patch('/deleteCategory', adminAuth.checkSession, adminController.deleteCategory);
router.patch('/activeCategory', adminAuth.checkSession, adminController.activeCategory);
router.get('/products', adminAuth.checkSession, adminController.productPage);
router.post('/addProduct', adminAuth.checkSession, adminController.upload.array("images", 3), adminController.addProduct);
router.put('/editProduct', adminAuth.checkSession, adminController.upload.any("images", 3), adminController.editProduct);
router.patch('/deleteProduct', adminAuth.checkSession, adminController.deleteProduct);
router.patch('/activeProduct', adminAuth.checkSession, adminController.activeProduct);
router.get('/ordersList', adminAuth.checkSession, adminController.orders);
router.get('/order/:orderId',adminAuth.checkSession,adminController.getSingleOrder)
router.patch('/changeOrderStatus', adminAuth.checkSession, adminController.changeOrderStatus);
router.delete('/cancelOrder', adminAuth.checkSession, adminController.cancelOrder);
router.get('/inventory', adminAuth.checkSession, adminController.inventory);
router.put('/editInventory', adminAuth.checkSession, adminController.editInventory);
router.patch('/deleteInventory', adminAuth.checkSession, adminController.deleteInventory);
router.patch('/updateStock', adminAuth.checkSession, adminController.updateStock);
router.get('/coupon', adminAuth.checkSession, adminController.coupon);
router.post('/createCoupon', adminController.upload.none(), adminAuth.checkSession, adminController.createCoupon);
router.delete('/deleteCoupon/:id', adminAuth.checkSession, adminController.deleteCoupon);
router.get('/offer', adminAuth.checkSession, adminController.offer);
router.post('/createOffer', adminController.upload.none(), adminAuth.checkSession, adminController.createOffer);
router.patch('/editOffer', adminController.upload.none(), adminAuth.checkSession, adminController.editOffer);
router.delete('/deleteOffer', adminAuth.checkSession, adminController.deleteOffer);
router.get('/salesReport', adminController.salesReport);
router.get('/salesReport/download/pdf', adminAuth.checkSession, adminController.downloadSalesReportPdf);
router.get('/salesReport/download/excel', adminAuth.checkSession, adminAuth.checkSession, adminController.downloadSalesReportExcel);
router.get('/category-sales', adminAuth.checkSession,adminController.getCategorySalesData);
router.get('/dashboard/top-selling-products',adminAuth.checkSession, adminController.getTopSellingProducts);
router.get('/dashboard/top-selling-categories',adminAuth.checkSession, adminController.getTopSellingCategories);
router.get('/dashboard/top-selling-brands',adminAuth.checkSession, adminController.getTopSellingBrands);
router.get('/ledger',adminAuth.checkSession,adminController.getledger);



module.exports = router;
