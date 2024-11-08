const bcrypt = require('bcrypt')
const Admin = require('../module/adminModel');
const User = require('../module/userModel');
const Category = require('../module/categoryModel');
const Products = require('../module/products');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const Order = require('../module/orderModel')
const fs = require('fs');
const Coupon = require('../module/coupenModel');
const Ledger = require('../module/ledgerModel');
const Offer = require('../module/offerModel');
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake.vfs;
const ExcelJS = require('exceljs');
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
        res.redirect("/dashboard");
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
            totalPages,
            totalCategories
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
        const existingCategory = await Category.findOne({ _id: id });
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

        res.render('admin/products', { products, categories, currentPage: page, totalPages, totalProducts });

    } catch (err) {
        console.log("product listing error", { err });
    }
};
const addProduct = async (req, res) => {

    let errors = '';
    const { productName, productStock, productPrice, description, category, highlights } = req.body;


    try {

        const existingProduct = await Products.findOne({ productName: productName });
        if (existingProduct) {
            return res.status(400).json({ errors: "Product with the same name already exists." });
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
            },
            maxQtyPerPerson: Math.min(Math.floor(productStock / 3), 10)
        });

        await newProduct.save();
        res.status(200).json({ redirectUrl: '/products' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
const editProduct = async (req, res) => {

    const { productName, productStock, productPrice, id, categories, description, highlights } = req.body;

    try {

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
        product.maxQtyPerPerson = Math.min(Math.floor(productStock / 3), 10);
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
            totalOrders
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
            totalProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
const editInventory = async (req, res) => {
    const { id, productName, productStock, productPrice, isFeatured } = req.body;
    try {
        const updateProducut = await Products.findByIdAndUpdate(id, {
            productName,
            productStock,
            productPrice,
            isFeatured,
            maxQtyPerPerson: Math.min(Math.floor(productStock / 3), 10)
        }, { new: true }
        );

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
        await Products.findByIdAndUpdate(id, {
            productStock,
            maxQtyPerPerson: Math.min(Math.floor(productStock / 3), 10),
        });
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
const offer = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const totalOffers = await Offer.countDocuments();

        const totalPages = Math.ceil(totalOffers / limit);

        const offers = await Offer.find()
            .skip(skip)
            .limit(limit)
            .populate('applicableProducts', 'productName')
            .populate('applicableCategories', 'brandName');

        const products = await Products.find({ isDeleted: false });
        const categories = await Category.find({ isDelete: false });
        console.log(offers);

        res.render('admin/offer', {
            offers,
            products,
            categories,
            currentPage: page,
            totalPages,
            totalOffers
        });
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

            const productPrice = Number(product.productPrice);
            if (isNaN(productPrice)) {
                console.error(`Product ID ${product._id} has an invalid price: ${product.productPrice}`);
                continue;
            }

            if (discountType === 'percentage') {
                discountPrice = productPrice - (productPrice * (numericDiscountValue / 100));
            } else if (discountType === 'fixed') {
                discountPrice = productPrice - numericDiscountValue;
            } else {
                console.error(`Invalid discount type for product ID ${product._id}`);
                continue;
            }

            discountPrice = Math.max(discountPrice, 0);

            console.log(`Updated discount price for product ID: ${product._id} to ${discountPrice}`);

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
const salesReport = async (req, res) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        console.log(startDate, endDate);

        let matchQuery = {};

        // Define date range based on filter type
        if (filterType === 'daily') {
            matchQuery.createdAt = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
        } else if (filterType === 'weekly') {
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            matchQuery.createdAt = { $gte: startOfWeek };
        } else if (filterType === 'monthly') {
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            matchQuery.createdAt = { $gte: startOfMonth };
        } else if (filterType === 'custom' && startDate && endDate) {
            matchQuery.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const salesData = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    totalSales: { $sum: '$totalAmount' },
                    totalDiscount: { $sum: '$discount' },
                    totalCouponDiscount: { $sum: '$couponDiscount' },
                    orderCount: { $sum: 1 },
                    totalItemsSold: { $sum: { $sum: '$products.quantity' } } // Adjusted to sum quantities
                }
            },
            { $sort: { _id: -1 } } // Sort by date descending
        ]);

        // Calculate overall totals
        const overallTotals = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalAmount' },
                    totalDiscount: { $sum: '$discount' },
                    totalCouponDiscount: { $sum: '$couponDiscount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        // Get the first element for totals
        const totals = overallTotals.length > 0 ? overallTotals[0] : { totalSales: 0, totalDiscount: 0, totalCouponDiscount: 0, totalOrders: 0 };

        res.render('admin/sales', {
            salesReport: salesData,
            totalSales: totals.totalSales,
            totalOrders: totals.totalOrders,
            totalDiscount: totals.totalDiscount,
            currentPage: 1, // Adjust based on your pagination logic
            filterType,
            startDate,
            endDate,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
};
const downloadSalesReportPdf = async (req, res) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        const salesReportData = await getSalesReportData(filterType, startDate, endDate);

        // Log sales report data to inspect the values
        console.log('Sales Report Data:', salesReportData);

        const logoPath = path.join(__dirname, '..', 'public', 'image', 'admin', 'WATCH.png');
        const imageBuffer = fs.readFileSync(logoPath);
        const logoBase64 = imageBuffer.toString('base64');
        const logoDataUrl = `data:image/png;base64,${logoBase64}`;

        const docDefinition = {
            content: [
                // Logo and Site Details
                {
                    stack: [
                        { image: logoDataUrl, width: 100, margin: [0, 0, 0, 10] },
                        { text: 'watchly', style: 'siteName' },
                        { text: 'Email: watchlysupport@gmail.com', style: 'siteEmail' },
                        { text: 'Website: www.WATCHLY.com', style: 'siteUrl' }
                    ],
                    alignment: 'left',
                    margin: [0, 0, 0, 20]
                },
                {
                    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 1, lineColor: '#D3D3D3' }],
                    margin: [0, 0, 0, 20]
                },
                { text: 'Sales Report', style: 'header' },
                { text: `Reporting Period: ${startDate} to ${endDate}`, style: 'subheader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*', '*', '*'],
                        body: [
                            [
                                { text: 'Date', style: 'tableHeader' },
                                { text: 'Total Sales Revenue', style: 'tableHeader' },
                                { text: 'Discount Applied', style: 'tableHeader' },
                                { text: 'Net Sales', style: 'tableHeader' },
                                { text: 'Number of Orders', style: 'tableHeader' },
                                { text: 'Total Items Sold', style: 'tableHeader' }
                            ],
                            ...salesReportData.map(data => [
                                { text: data._id || 'N/A', style: 'tableCell' },
                                { text: `₹${data.totalSales || 0}`, style: 'tableCell' },
                                { text: `₹${data.totalDiscount || 0}`, style: 'tableCell' },
                                { text: `₹${(data.totalSales || 0) - (data.totalDiscount || 0)}`, style: 'tableCell' },
                                { text: data.orderCount?.toString() || '0', style: 'tableCell' },
                                { text: data.totalItemsSold?.toString() || '0', style: 'tableCell' }
                            ])
                        ]
                    },
                    layout: {
                        fillColor: function (rowIndex) { return rowIndex % 2 === 0 ? '#F3F3F3' : null; }
                    }
                },
                { text: 'For any inquiries, please contact us at support@myecommercesite.com or visit our website at www.myecommercesite.com.', style: 'contactInfo', margin: [0, 10, 0, 10] }
            ],
            styles: {
                header: { fontSize: 20, bold: true, alignment: 'center', margin: [0, 10, 0, 20] },
                subheader: { fontSize: 12, alignment: 'center', margin: [0, 0, 0, 20] },
                tableHeader: { fontSize: 12, bold: true, color: 'black', fillColor: '#D3D3D3', alignment: 'center' },
                tableCell: { fontSize: 10, alignment: 'center', margin: [0, 5, 0, 5] },
                contactInfo: { fontSize: 8, alignment: 'center', color: 'grey', margin: [0, 10, 0, 0] },
                siteName: { fontSize: 12, bold: true, margin: [0, 0, 0, 2] },
                siteEmail: { fontSize: 10, margin: [0, 0, 0, 1] },
                siteUrl: { fontSize: 10, margin: [0, 0, 0, 5] }
            },
            footer: function (currentPage, pageCount) {
                return { columns: [{ text: `Page ${currentPage} of ${pageCount}`, alignment: 'left', fontSize: 8, margin: [10, 10, 0, 0] }] };
            }
        };

        const pdfDoc = pdfMake.createPdf(docDefinition);
        const filePath = 'C:/Users/hp/Downloads/SalesReport.pdf';

        pdfDoc.getBuffer((buffer) => {
            fs.writeFileSync(filePath, buffer);
            res.download(filePath, 'SalesReport.pdf', (err) => {
                if (err) { console.error('Download error:', err); }
                fs.unlinkSync(filePath);
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Could not generate PDF');
    }
};
const downloadSalesReportExcel = async (req, res) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        const salesReportData = await getSalesReportData(filterType, startDate, endDate);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Site Details
        worksheet.mergeCells('A1:D2'); // Merge cells for the site name
        worksheet.getCell('A1').value = 'WATCHLY'; // Site name
        worksheet.getCell('A3').value = 'Email: watchlysupport@gmail.com'; // Site email
        worksheet.getCell('A4').value = 'Website: www.WATCHLY.com'; // Website URL

        // Style site details
        worksheet.getCell('A1').font = { bold: true, size: 14 }; // Site name bold and larger
        worksheet.getCell('A3').font = { size: 12 }; // Email style
        worksheet.getCell('A4').font = { size: 12 }; // Website style

        // Sales Report Heading
        worksheet.mergeCells('A6:D6'); // Merge cells for the heading
        worksheet.getCell('A6').value = 'Sales Report'; // Sales report heading
        worksheet.getCell('A6').font = { bold: true, size: 16 }; // Heading style
        worksheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' }; // Center alignment

        // Adding a little bit of space after the heading
        worksheet.getCell('A7').value = ''; // Empty row for spacing

        // Add column headers starting from row 8
        worksheet.addRow(['Total Sales', 'Order Count', 'Total Discount', 'Coupon Discount']);
        worksheet.getRow(8).font = { bold: true }; // Make header row bold

        // Set the widths of the columns
        worksheet.columns = [
            { header: 'Total Sales', key: 'totalSales', width: 15 },
            { header: 'Order Count', key: 'orderCount', width: 15 },
            { header: 'Total Discount', key: 'totalDiscount', width: 20 },
            { header: 'Coupon Discount', key: 'totalCouponDiscount', width: 20 }
        ];

        // Add rows with sales data starting from row 9
        salesReportData.forEach(data => {
            worksheet.addRow({
                totalSales: data.totalSales,
                orderCount: data.orderCount,
                totalDiscount: data.totalDiscount,
                totalCouponDiscount: data.totalCouponDiscount
            });
        });

        // File path
        const filePath = 'C:/Users/hp/Downloads/salesReport.xlsx';

        // Write to file and send download response
        await workbook.xlsx.writeFile(filePath);
        res.download(filePath, 'salesReport.xlsx', err => {
            if (err) {
                console.error(err);
            }
            fs.unlinkSync(filePath); // Delete file after download
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Could not generate Excel file');
    }
};
const getSalesReportData = async (filterType, startDate, endDate) => {
    let matchQuery = {};

    // Define the date range based on filterType
    if (filterType === 'daily') {
        matchQuery.createdAt = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    } else if (filterType === 'weekly') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        matchQuery.createdAt = { $gte: startOfWeek };
    } else if (filterType === 'monthly') {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        matchQuery.createdAt = { $gte: startOfMonth };
    } else if (filterType === 'custom' && startDate && endDate) {
        matchQuery.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    return await Order.aggregate([
        { $match: matchQuery },  // Match based on the given filter
        { $unwind: "$products" },  // Unwind the products array to handle each product separately
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
                totalSales: { $sum: '$totalAmount' },
                totalDiscount: { $sum: '$discount' },
                totalCouponDiscount: { $sum: '$couponDiscount' },
                orderCount: { $sum: 1 },
                totalItemsSold: { $sum: '$products.quantity' }  // Sum the quantity of products
            }
        },
        { $sort: { _id: -1 } } // Sort by date in descending order
    ]);
    
};
const dashboard = (req, res) => {
    res.render('admin/dashboard');
};
const getCategorySalesData = async (req, res) => {
    try {
        const categorySales = await Products.aggregate([
            {
                $match: { isDeleted: false } // Only count active products
            },
            {
                $unwind: "$category" // Decompose array of categories for products with multiple categories
            },
            {
                $group: {
                    _id: "$category", // Group by category ID
                    totalSales: { $sum: "$popularity" } // Replace with a relevant field for sales
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                $unwind: "$categoryDetails"
            },
            {
                $project: {
                    categoryName: "$categoryDetails.brandName",
                    totalSales: 1
                }
            }
        ]);

        res.json(categorySales);
    } catch (error) {
        console.error("Error fetching category sales data:", error);
        res.status(500).json({ error: "Server error" });
    }
};
const getTopSellingProducts = async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { $unwind: "$products" },  // Deconstruct products array in each order
            { $match: { "paymentStatus": "Paid" } },  // Count only orders that have been paid
            {
                $group: {
                    _id: "$products.productId",  // Group by product ID
                    totalOrders: { $sum: "$products.quantity" }  // Sum up the quantity ordered
                }
            },
            { $sort: { totalOrders: -1 } },  // Sort by order count
            { $limit: 10 },  // Limit to top 10 products
            {
                $lookup: {  // Join with Products collection to get product details
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },  // Deconstruct product details array
            {
                $project: {
                    productName: "$productDetails.productName",
                    totalOrders: 1,
                    productPrice: "$productDetails.productPrice",
                }
            }
        ]);

        res.json(topProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch top-selling products" });
    }
};
const getTopSellingCategories = async (req, res) => {
    try {
        const topCategories = await Order.aggregate([
            { $unwind: "$products" },  // Unwind products in each order
            { $match: { paymentStatus: "Paid" } },  // Only count paid orders
            {
                $lookup: {  // Join with Products collection to get category details
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            { $unwind: "$productDetails.category" },  // Unwind categories within each product
            {
                $group: {
                    _id: "$productDetails.category",  // Group by category ID
                    totalOrders: { $sum: "$products.quantity" }  // Sum quantities for each category
                }
            },
            { $sort: { totalOrders: -1 } },
            { $limit: 10 },
            {
                $lookup: {  // Join with Category collection to get category names
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $project: {
                    categoryName: "$categoryDetails.brandName",  // Assuming "brandName" represents category name
                    totalOrders: 1
                }
            }
        ]);

        res.json(topCategories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch top-selling categories" });
    }
};
const getTopSellingBrands = async (req, res) => {
    try {
        const topBrands = await Order.aggregate([
            { $unwind: "$products" },
            { $match: { paymentStatus: "Paid" } },  // Only count paid orders
            {
                $lookup: {  // Join with Products to get category/brand info
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            { $unwind: "$productDetails.category" },
            {
                $lookup: {  // Join with Category to get brand name
                    from: "categories",
                    localField: "productDetails.category",
                    foreignField: "_id",
                    as: "brandDetails"
                }
            },
            { $unwind: "$brandDetails" },
            {
                $group: {
                    _id: "$brandDetails.brandName",  // Group by brand name
                    totalOrders: { $sum: "$products.quantity" }  // Sum quantities for each brand
                }
            },
            { $sort: { totalOrders: -1 } },
            { $limit: 10 },
            {
                $project: {
                    brandName: "$_id",
                    totalOrders: 1
                }
            }
        ]);

        res.json(topBrands);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch top-selling brands" });
    }
};
const getledger = async (req, res) => {
    try {
        const entries = await Ledger.find().populate('orderId'); // Populate order details if needed
        res.render('admin/ledger', { entries });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching ledger entries');
    }
};
const getSingleOrder = async (req, res) => {
    const { orderId } = req.params; // Extract orderId from request parameters

    try {
        // Fetch the order by ID and populate necessary fields
        const order = await Order.findById(orderId)
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
                select: 'productName price images', // Include price if needed
            });

        // Check if the order exists
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Send the order details back as JSON
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching order details' });
    }
};

module.exports = {
    loadLogin,
    getledger,
    getSingleOrder,
    getTopSellingBrands,
    getTopSellingCategories,
    getTopSellingProducts,
    loginBtn,
    usersPage,
    dashboard,
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
    salesReport,
    getSalesReportData,
    downloadSalesReportPdf,
    downloadSalesReportExcel,
    getCategorySalesData


}