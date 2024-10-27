const bcrypt = require('bcrypt')
const Admin = require('../module/adminModel');
const saltRound = 10;
const User = require('../module/userModel');
const Category = require('../module/categoryModel');
const Products = require('../module/products');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const Order = require('../module/orderModel')
const fs = require('fs');
const Coupon = require('../module/coupenModel');
const { log } = require('console');
const Offer = require('../module/offerModel');
const { body, validationResult } = require('express-validator');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const loadLogin = (req, res) => {
    res.render('admin/login');
};
const loginBtn = async (req, res) => {
    try {
        const { password, email } = req.body;

        const adminExist = await Admin.findOne({ email });
        if (!adminExist) {
            return res.render("admin/login", { msg: 'admin not found' });
        }

        const isMatch = await bcrypt.compare(password, adminExist.password);
        if (!isMatch) {
            return res.render('admin/login', { msg: 'password is incorrect' });
        }
        req.session.admin = true;
        res.redirect("/users");
    } catch (error) {
        console.error(error)
    }
};
const logoutBtn = async (req, res) => {
    req.session.admin = null;
    res.redirect('/login');
}
const usersPage = async (req, res) => {
    try {

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 7) || 7;
        const skip = (page - 1) * limit;
        const totalUsers = await User.countDocuments();

        const users = await User.find({})
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalUsers / limit);

        res.render('admin/users', {
            data: users,
            currentPage: page,
            totalPages: totalPages,
            totalUsers: totalUsers
        });

    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching Users');
    }
};
const blockUser = async (req, res) => {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, { isBlocked: true });
    res.redirect('/users'); unblockUser
};
const unblockUser = async (req, res) => {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, { isBlocked: false });
    res.redirect('/users');
};
const categoryPage = async (req, res) => {
    const limit = 7;
    const page = parseInt(req.query.page) || 1;

    try {
        const totalCategories = await Category.countDocuments();
        const categories = await Category.find({})
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        const totalPages = Math.ceil(totalCategories / limit);

        res.render('admin/category', {
            category: categories,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Server Error");
    }
};
const addCategory = async (req, res) => {
    const { brandName, displayType, bandColor } = req.body;

    try {
        const existingCategory = await Category.findOne({ brandName, displayType, bandColor });

        if (existingCategory) {
            return res.status(400).json({
                errorMessage: 'Category with the same Brand, Display Type, and Band Color already exists.'
            });
        }

        const newCategory = new Category({
            brandName,
            displayType,
            bandColor
        });

        await newCategory.save();
        return res.status(200).json({ message: "Category added successfully" });
    } catch (err) {
        console.log("Adding error", err);
        return res.status(500).json({
            errorMessage: 'Server error occurred while adding category.'
        });
    }
};
const editCategory = async (req, res) => {
    try {
        const { brandName, displayType, bandColor, id } = req.body;

        if (!brandName || !displayType || !bandColor) {
            return res.json({ error: 'All fields are required' });
        }
        const existingCategory = await Category.findOne({_id:id});
        if (existingCategory) {

            return res.json({ error: 'Brand name already exists. Please choose a different one.' });
        }

        await Category.findByIdAndUpdate(id, { brandName, displayType, bandColor });
        res.json({ success: true });

    } catch (err) {
        console.error('Error on the edit category:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;
        await Category.findByIdAndUpdate(id,
            { isDelete: true }
        );
        res.redirect('/category');
    } catch (err) {
        console.log('error on deleting category');
    }
};
const activeCategory = async (req, res) => {
    try {
        const { id } = req.body;
        await Category.findByIdAndUpdate(id,
            { isDelete: false }
        );
        res.redirect('/category');
    } catch (err) {
        console.log('error on deleting category');
    }
}
const productPage = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const products = await Products.find().skip(skip).limit(limit);
        const totalProducts = await Products.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
        const categories = await Category.find();

        res.render('admin/products', { products, categories, currentPage: page, totalPages });

    } catch (err) {
        console.log("product listing error", { err });
    }
};
const addProduct = async (req, res) => {
    const errors = [];

    // Validate required fields
    const { productName, productStock, productPrice, description, category, highlights } = req.body;
    console.log(req.file)

    if (!productName) errors.push("Product name is required.");
    if (!productStock) errors.push("Product stock is required.");
    if (!productPrice) errors.push("Product price is required.");
    if (!description) errors.push("Description is required.");
    if (!category) errors.push("Category is required.");
    if (!highlights.brand) errors.push("Brand is required ");
    if (!highlights.model) errors.push("Model is required ");
    if (!highlights.caseMaterial) errors.push("caseMaterial is required ");
    if (!highlights.dialColor) errors.push("dialColor is required");
    if (!highlights.waterResistance) errors.push("waterResistance ");
    if (!highlights.movementType) errors.push("movementType is required");
    if (!highlights.caseMaterial) errors.push("caseMaterial is required ");
    if (!highlights.bandMaterial) errors.push("bandMaterial is required ");
    if (!highlights.features) errors.push("features is required");
    if (!highlights.warranty) errors.push("warranty is required");


    if (!req.files || req.files.length !== 3) {
        errors.push('Please upload at least 3 images.');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }


    try {

        const existingProduct = await Products.findOne({ productName: productName });
        if (existingProduct) {
            return res.status(400).json({ errors: ["Product with the same name already exists."] });
        }

        const images = [];
        for (const file of req.files) {
            const newImgName = `${Date.now()}-${file.originalname}`;
            await sharp(file.buffer)
                .resize(500, 500)
                .toFile(`./uploads/${newImgName}`);
            images.push(newImgName);
        }

        const newProduct = new Products({
            productName,
            productStock,
            productPrice,
            images,
            category,
            description,
            highlights: {
                brand: highlights.brand,
                model: highlights.model,
                caseMaterial: highlights.caseMaterial,
                dialColor: highlights.dialColor,
                waterResistance: highlights.waterResistance,
                movementType: highlights.movementType,
                bandMaterial: highlights.bandMaterial,
                features: highlights.features.split(','),
                warranty: highlights.warranty
            }
        });

        await newProduct.save();
        res.status(200).json({ redirectUrl: '/products' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
const editProduct = async (req, res) => {
    try {
        const { productName, productStock, productPrice, id, categories, description, highlights } = req.body;
        const product = await Products.findById(id);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Update basic product details
        product.productName = productName;
        product.productStock = productStock;
        product.productPrice = productPrice;
        product.description = description;
        product.category = categories;

        console.log(req.files)
        // Replace images if new files are uploaded
        if (req.files && req.files.length > 0) {
            for (const [index, file] of req.files.entries()) {
                const oldImage = product.images[index];
                const newImageName = `${Date.now()}-${file.originalname}`;

                // Resize and save the new image
                await sharp(file.buffer)
                    .resize(500, 500)
                    .toFile(path.join(__dirname, '../uploads/', newImageName));

                // Replace the old image with the new one
                if (product.images[index]) {
                    product.images[index] = newImageName;
                } else {
                    product.images.push(newImageName);
                }

                // Delete the old image file if it exists
                if (oldImage) {
                    const oldImagePath = path.join(__dirname, '../uploads/', oldImage);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            }
        }

        // Ensure there are no more than 3 images
        if (product.images.length > 3) {
            product.images = product.images.slice(0, 3);
        }

        // Update highlights if provided
        if (highlights) {
            const { brand, model, caseMaterial, dialColor, waterResistance, movementType, bandMaterial, features, warranty } = highlights;
            product.highlights = {
                brand: brand || product.highlights.brand,
                model: model || product.highlights.model,
                caseMaterial: caseMaterial || product.highlights.caseMaterial,
                dialColor: dialColor || product.highlights.dialColor,
                waterResistance: waterResistance || product.highlights.waterResistance,
                movementType: movementType || product.highlights.movementType,
                bandMaterial: bandMaterial || product.highlights.bandMaterial,
                features: Array.isArray(features) ? features : product.highlights.features,
                warranty: warranty || product.highlights.warranty
            };
        }

        // Save the updated product to the database
        await product.save();
        res.redirect('/products');
    } catch (err) {
        console.error('Error on the edit products', err);
        res.status(500).send('Internal Server Error');
    }
};
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await Products.findByIdAndUpdate(id, { isDeleted: true });
        res.redirect('/products');
    } catch (err) {
        console.log('error on deleting product');
    }

};
const activeProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await Products.findByIdAndUpdate(id, { isDeleted: false });
        res.redirect('/products');
    } catch (err) {
        console.log('error on deleting product');
    }
};
const orders = async (req, res) => {
    const limit = 4;
    const page = parseInt(req.query.page) || 1;

    try {
        const totalOrders = await Order.countDocuments();
        const orders = await Order.find()
            .populate({
                path: 'userId',
                select: 'userName email',
            })
            .populate({
                path: 'shippingAddress',
                select: 'addressLine city state postalCode country',
            })
            .populate({
                path: 'products.productId',
                select: 'productName',
            })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        const totalPages = Math.ceil(totalOrders / limit);

        res.render('admin/order', {
            orders,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
const changeOrderStatus = async (req, res) => {
    const { orderId, status } = req.body;

    try {
        await Order.findByIdAndUpdate(orderId, { status });
        res.redirect('/ordersList');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
const cancelOrder = async (req, res) => {
    const { orderId } = req.body;

    try {
        const order = await Order.findById(orderId);


        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await Order.findByIdAndDelete(orderId);
        res.redirect('/ordersList');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
const inventory = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 7;

    try {
        const totalProducts = await Products.countDocuments();
        const products = await Products.find({ isDeleted: false })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        const totalPages = Math.ceil(totalProducts / limit)

        res.render('admin/inventory', {
            products,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
const editInventory = async (req, res) => {
    const { id, productName, productStock, productPrice, isFeatured } = req.body;
    try {
        await Products.findByIdAndUpdate(id, { productName, productStock, productPrice, isFeatured });
        res.redirect('/inventory');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
const deleteInventory = async (req, res) => {
    const { id } = req.body;
    try {
        await Products.findByIdAndUpdate(id, { isDeleted: true });
        res.redirect('/inventory');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
const updateStock = async (req, res) => {
    const { id, productStock } = req.body;
    try {
        await Products.findByIdAndUpdate(id, { productStock });
        res.redirect('/inventory');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
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
            totalPages
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
const offer = async (req, res) => {
    try {
        const offers = await Offer.find()
            .populate('applicableProducts', 'productName')
            .populate('applicableCategories', 'brandName');

        const products = await Products.find({ isDeleted: false });
        const categories = await Category.find({ isDelete: false });

        res.render('admin/offer', { offers, products, categories });

    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).send('Internal Server Error');
    }
};
const createOffer = async (req, res) => {
    const { discountType, discountValue, applicableProducts, applicableCategories, expirationDate, isActive, description } = req.body;

    if (!discountType || !discountValue || !expirationDate || !description) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Ensure discountValue is a number
    const numericDiscountValue = Number(discountValue);
    if (isNaN(numericDiscountValue)) {
        return res.status(400).json({ message: 'Invalid discount value' });
    }

    try {
        const offer = new Offer({
            discountType,
            discountValue: numericDiscountValue,
            description,
            applicableProducts: applicableProducts || [],
            applicableCategories: applicableCategories || [],
            expirationDate,
            isActive: isActive === 'on'
        });

        await offer.save();

        // Find and update discountPrice for applicable products
        let productsToUpdate = [];

        if (applicableProducts && applicableProducts.length > 0) {
            productsToUpdate = await Products.find({ _id: { $in: applicableProducts } });
        }

        if (applicableCategories && applicableCategories.length > 0) {
            const productsInCategory = await Products.find({ category: { $in: applicableCategories } });
            productsToUpdate.push(...productsInCategory);
        }

        for (const product of productsToUpdate) {
            let discountPrice;

            // Ensure product.price is a number
            const productPrice = Number(product.productPrice);
            if (isNaN(productPrice)) {
                console.error(`Product ID ${product._id} has an invalid price: ${product.productPrice}`);
                continue; // Skip this product
            }

            // Calculate discountPrice based on discountType
            if (discountType === 'percentage') {
                discountPrice = productPrice - (productPrice * (numericDiscountValue / 100));
            } else if (discountType === 'fixed') {
                discountPrice = productPrice - numericDiscountValue;
            } else {
                console.error(`Invalid discount type for product ID ${product._id}`);
                continue; // Skip this product
            }

            // Ensure discountPrice doesn't go negative
            discountPrice = Math.max(discountPrice, 0);

            console.log(`Updated discount price for product ID: ${product._id} to ${discountPrice}`);

            // Update the product with the new discountPrice
            await Products.updateOne(
                { _id: product._id },
                {
                    $set: { discountPrice, },
                    $addToSet: { offersApplied: offer._id },
                },
                { upsert: true } 
            );

        }

        res.status(201).json({ message: 'Offer created successfully', offer });
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const editOffer = async (req, res) => {
    try {
        const { offerId, discountType, discountValue, expirationDate, isActive, description } = req.body;

        let offer = await Offer.findById(offerId);

        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        // Update the offer fields
        offer.discountType = discountType;
        offer.discountValue = discountValue;
        offer.expirationDate = expirationDate;
        offer.description = description;
        offer.isActive = isActive === 'true';

        await offer.save();

        // Find all products linked to this offer
        const productsToUpdate = await Products.find({ offersApplied: offerId });

        for (const product of productsToUpdate) {
            let discountPrice = product.price; // Default to the original price

            if (offer.isActive) {
                if (discountType === 'percentage') {
                    discountPrice = product.price - (product.price * (discountValue / 100));
                } else if (discountType === 'fixed') {
                    discountPrice = product.price - discountValue;
                }

                discountPrice = Math.max(discountPrice, 0); // Ensure price doesn't go negative
            }

            await Products.updateOne(
                { _id: product._id },
                {
                    $set: { discountPrice: offer.isActive ? discountPrice : null }
                }
            );
        }

        res.status(200).json({ success: true, message: 'Offer updated successfully' });
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ success: false, message: 'Server error, please try again later' });
    }
};
const deleteOffer = async (req, res) => {
    try {
        const { offerId } = req.body;

        // Delete the offer
        const deletedOffer = await Offer.findByIdAndDelete(offerId);
        if (!deletedOffer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        // Remove the offerId from the offersApplied field of products
        await Products.updateMany(
            { offersApplied: offerId },
            { $pull: { offersApplied: offerId } }
        );

        res.redirect('/offer');
    } catch (err) {
        console.error('Error deleting offer:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    loadLogin,
    loginBtn,
    usersPage,
    categoryPage,
    addCategory,
    editCategory,
    deleteCategory,
    activeCategory,
    productPage,
    addProduct,
    upload,
    blockUser,
    unblockUser,
    editProduct,
    deleteProduct,
    logoutBtn,
    orders,
    changeOrderStatus,
    cancelOrder,
    inventory,
    editInventory,
    deleteInventory,
    updateStock,
    activeProduct,
    coupon,
    createCoupon,
    deleteCoupon,
    offer,
    createOffer,
    editOffer,
    deleteOffer,



}