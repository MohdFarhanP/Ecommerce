
const Coupon = require('../../model/coupenModel');
const Products = require('../../model/products');
const Category = require('../../model/categoryModel');


const coupon = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const totalCoupons = await Coupon.countDocuments();

        const Coupons = await Coupon.find()
            .populate('applicableProducts', 'productName')
            .populate('applicableCategories', 'brandName')
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalCoupons / limit);

        const products = await Products.find({ isDeleted: false });
        const categories = await Category.find({ isDelete: false });

        res.render('admin/coupon', {
            Coupons,
            products,
            categories,
            currentPage: page,
            totalPages,
            totalCoupons
        });
    } catch (error) {
        console.log('Error:', error);
    }
};
const createCoupon = async (req, res) => {
    const { code, discountType, discountValue, minimumCartValue, usageLimit, expiryDate, description } = req.body;
    const products = req.body.products || [];
    const categories = req.body.categories || [];
    console.log(req.body)

    try {

        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: `Coupon code '${code}' already exists.` });
        }
        const applicableProducts = products.length === 0 ? [] : products;
        const applicableCategories = categories.length === 0 ? [] : categories;

        const newCoupon = new Coupon({
            code,
            discountType,
            discountValue,
            minimumCartValue,
            usageLimit,
            expiryDate,
            description,
            applicableProducts,
            applicableCategories
        });

        await newCoupon.save();

        return res.json({ success: true, message: 'Coupon created successfully' });

    } catch (error) {
        console.error("Creating error: ", error.message);
        return res.status(500).json({ success: false, message: 'An error occurred while creating the coupon. Please try again later.' });
    }
};
const deleteCoupon = async (req, res) => {
    const couponId = req.params.id;
    try {
        await Coupon.findByIdAndDelete(couponId);
        console.log('deleted');
        res.redirect('/coupon')
    } catch (err) {
        console.log('deleting error : ', err)
    }
};


module.exports = {
    coupon,
    createCoupon,
    deleteCoupon
};