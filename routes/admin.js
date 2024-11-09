const express = require('express');
const router = express.Router();

const multerConfig = require('../config/multer')
const adminAuth = require('../middleware/adminAuth');
const usercontroller = require('../controller/admin/userController');
const categoryController = require('../controller/admin/categoryController');
const productController = require('../controller/admin/productController');
const orderController = require('../controller/admin/orderController');
const inventoryController = require('../controller/admin/inventryController');
const couponController = require('../controller/admin/couponController');
const offerController = require('../controller/admin/offerController');
const salesReportController = require('../controller/admin/salesReportController');
const dashboardController = require('../controller/admin/dashboardController');
const ledgerController = require('../controller/admin/ledgerController');





router.get('/adminLogin', adminAuth.isLogin, usercontroller.loadLogin);
router.post('/loginbtn', usercontroller.loginBtn);
router.post('/logout', usercontroller.logoutBtn);

router.get('/users', adminAuth.checkSession, usercontroller.usersPage);
router.patch('/unblock/:id', adminAuth.checkSession, usercontroller.unblockUser);
router.patch('/block/:id', adminAuth.checkSession, usercontroller.blockUser);



router.get('/category', adminAuth.checkSession, categoryController.categoryPage);
router.post('/addCategory', adminAuth.checkSession, categoryController.addCategory);
router.put('/editCategory', adminAuth.checkSession, categoryController.editCategory);
router.patch('/deleteCategory', adminAuth.checkSession, categoryController.deleteCategory);
router.patch('/activeCategory', adminAuth.checkSession, categoryController.activeCategory);



router.get('/products', adminAuth.checkSession, productController.productPage);
router.post('/addProduct', adminAuth.checkSession, multerConfig.upload.array("images", 3), productController.addProduct);
router.put('/editProduct', adminAuth.checkSession, multerConfig.upload.any("images", 3), productController.editProduct);
router.patch('/deleteProduct', adminAuth.checkSession, productController.deleteProduct);
router.patch('/activeProduct', adminAuth.checkSession, productController.activeProduct);



router.get('/ordersList', adminAuth.checkSession, orderController.orders);
router.patch('/changeOrderStatus', adminAuth.checkSession, orderController.changeOrderStatus);
router.delete('/cancelOrder', adminAuth.checkSession, orderController.cancelOrder);



router.get('/inventory', adminAuth.checkSession, inventoryController.inventory);
router.put('/editInventory', adminAuth.checkSession, inventoryController.editInventory);
router.patch('/deleteInventory', adminAuth.checkSession, inventoryController.deleteInventory);
router.patch('/updateStock', adminAuth.checkSession, inventoryController.updateStock);



router.get('/coupon', adminAuth.checkSession, couponController.coupon);
router.post('/createCoupon', multerConfig.upload.none(), adminAuth.checkSession, couponController.createCoupon);
router.delete('/deleteCoupon/:id', adminAuth.checkSession, couponController.deleteCoupon);



router.get('/offer', adminAuth.checkSession, offerController.offer);
router.post('/createOffer', multerConfig.upload.none(), adminAuth.checkSession, offerController.createOffer);
router.patch('/editOffer', multerConfig.upload.none(), adminAuth.checkSession, offerController.editOffer);
router.delete('/deleteOffer', adminAuth.checkSession, offerController.deleteOffer);



router.get('/salesReport', salesReportController.salesReport);
router.get('/salesReport/download/pdf', adminAuth.checkSession, salesReportController.downloadSalesReportPdf);
router.get('/salesReport/download/excel', adminAuth.checkSession, adminAuth.checkSession, salesReportController.downloadSalesReportExcel);



router.get('/dashboard',adminAuth.checkSession,dashboardController.dashboard);
router.get('/category-sales', adminAuth.checkSession,dashboardController.getCategorySalesData);
router.get('/dashboard/top-selling-products',adminAuth.checkSession, dashboardController.getTopSellingProducts);
router.get('/dashboard/top-selling-categories',adminAuth.checkSession, dashboardController.getTopSellingCategories);
router.get('/dashboard/top-selling-brands',adminAuth.checkSession, dashboardController.getTopSellingBrands);



router.get('/ledger',adminAuth.checkSession,ledgerController.getledger);
router.get('/order/:orderId',adminAuth.checkSession,ledgerController.getSingleOrder);




module.exports = router;
