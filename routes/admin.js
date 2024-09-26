const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController')
const adminAuth = require('../middleware/adminAuth');


router.get('/login',adminController.loadLogin);
router.post('/login',adminController.loginBtn);
router.get('/users',adminController.usersPage);
router.post('/unblock/:id',adminController.unblockUser);
router.post('/block/:id',adminController.blockUser);
router.get('/category',adminController.categoryPage);
router.post('/addCategory',adminController.addCategory)
router.post('/editCategory',adminController.editCategory)
module.exports = router;