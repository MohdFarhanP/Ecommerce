const bcrypt = require('bcrypt');
const User = require("../module/userModel");
const nodemailer = require('nodemailer');
const { template } = require('handlebars');
const path = require('path');
const { emit } = require('process');
require('dotenv').config();
const Products = require('../module/products');
const Category = require('../module/categoryModel');
const Review = require('../module/reviewModel');
const Address = require('../module/addressModel');
const Cart = require('../module/cartModel');
const { error, log } = require('console');
const Order = require('../module/orderModel');
const Wishlist = require('../module/whishlistModel');
const Coupon = require('../module/coupenModel');
const Razorpay = require('razorpay');
const WalletTransaction = require('../module/wlletModel');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});



let transporter;

// Immediately invoked function to set up nodemailer and handlebars
(async () => {
    try {
        const hbs = await import('nodemailer-express-handlebars');

        // Setup nodemailer transport
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const handlebarOptions = {
            viewEngine: {
                extname: '.hbs',
                partialsDir: path.join(__dirname, '../views/partials'),
                layoutsDir: path.join(__dirname, '../views/layouts'),
                defaultLayout: false,
            },
            viewPath: path.join(__dirname, '../views/user'),
            extName: '.hbs',
        };

        // Register handlebars as the template engine for nodemailer
        transporter.use('compile', hbs.default(handlebarOptions));
        console.log("Nodemailer with Handlebars configured successfully");

    } catch (error) {
        console.error('Error configuring nodemailer-express-handlebars:', error);
    }
})();

const homePage = (req, res) => {
    console.log(req.session.userId);

    res.render('user/home');
};
const gestUser = (req, res) => {
    res.redirect('/home')
};
const authPromptPage = (req, res) => {
    res.render('user/authPrompt')
};
const loginPage = (req, res) => {
    res.render('user/login');
};
const loginBtn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const exist = await User.findOne({ email });
        if (!exist) {
            return res.render('user/login', { err: 'User does not exist' });
        }

        const pass = await bcrypt.compare(password, exist.password);
        if (!pass) {
            return res.render('user/login', { err: 'Incorrect password' });
        }

        if (exist.isBlocked) {
            return res.render('user/login', { err: 'You are blocked' });
        }

        req.session.userId = exist._id;
        req.session.loginMethod = 'email';

        return res.redirect("/home");

    } catch (err) {
        console.log("Login error:", err);
        return res.render('user/login', { err: 'An error occurred during login' });
    }
};
const signupPage = (req, res) => {
    res.render('user/signup')
}
const signupBtn = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const exist = await User.findOne({ email });
        if (exist) {
            return res.render('user/signup', { msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            userName,
            email,
            password: hashedPassword,
        });
        await newUser.save();


        req.session.userId = newUser._id;

        const otp = Math.floor(1000 + Math.random() * 9000);
        req.session.otp = otp;
        req.session.email = email;
        req.session.otpTimestamp = Date.now();

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Your OTP for Sign up',
            template: 'email-otp',
            context: {
                otp: req.session.otp,
            },
        };

        // Send email asynchronously and wait for the response
        await transporter.sendMail(mailOptions);
        console.log("OTP email sent");
        const remainTime = 60;
        return res.render('user/otp', { remainTime, id: req.session.userId });

    } catch (error) {
        console.error('Signup error:', error);
        return res.render('user/signup', { msg: 'An error occurred during signup' });
    }
};
const otpPage = (req, res) => {
    res.render('otp')
};
const verifyOtp = async (req, res) => {
    try {
        const userOtp = req.body.otp;
        const otpAge = Date.now() - req.session.otpTimestamp;
        const otpExp = 1 * 60 * 1000;

        if (otpAge > otpExp) {
            return res.render('user/otp', { error: "OTP expired, please request a new one." });
        }

        const remainTime = Math.floor(Math.max(0, otpExp - otpAge) / 1000);
        if (req.session.otp) {
            const existOtp = req.session.otp.toString();
            if (userOtp === existOtp) {

                req.session.userId = req.session.userId;
                return res.render('user/home', { msg: "User created successfully" });
            } else {
                return res.render('user/otp', { error: "Invalid OTP, please try again.", remainTime });
            }
        }
    } catch (error) {
        console.error("Verifying error:", error);
        return res.render('user/otp', { error: 'An error occurred during OTP verification' });
    }
};
const resendOtp = async (req, res) => {
    try {
        const otp = Math.floor(1000 + Math.random() * 9000);
        req.session.otp = otp;
        req.session.otpTimestamp = Date.now();

        console.log("Resend Generated OTP:", otp);

        const id = req.session.userId;
        if (!id) {
            return res.status(400).send("User ID not found in session");
        }

        const mailOptions = {
            from: process.env.EMAIL,
            to: req.session.email,
            subject: 'Your Resend OTP for Sign up',
            template: 'email-otp',
            context: {
                otp: req.session.otp,
            },
        };

        // Send email asynchronously
        await transporter.sendMail(mailOptions);
        console.log("Resend OTP sent");
        const remainTime = 60;
        return res.render('user/otp', { remainTime, id });
    } catch (error) {
        console.log("Error sending OTP email", error);
        return res.render('user/otp', { error: 'An error occurred while resending the OTP' });
    }
};
const ProductList = async (req, res) => {
    const productsPerPage = 5;
    const page = parseInt(req.query.page) || 1;

    try {
        const totalProducts = await Products.countDocuments({ isDeleted: false });
        const totalPages = Math.ceil(totalProducts / productsPerPage);

        const products = await Products.find({ isDeleted: false })
            .populate('offersApplied')
            .skip((page - 1) * productsPerPage)
            .limit(productsPerPage);

        const productsWithDiscounts = products.map(product => {
            let hasDiscount = null;
            let discountLabel = '';

            if (product.offersApplied && product.offersApplied.length > 0) {
                const activeOffer = product.offersApplied[0];

                if (activeOffer.discountType && activeOffer.discountValue) {
                    if (activeOffer.discountType === 'percentage') {
                        hasDiscount = product.productPrice * (1 - activeOffer.discountValue / 100);
                        discountLabel = `${activeOffer.discountValue}% off`;
                    } else if (activeOffer.discountType === 'fixed') {
                        hasDiscount = product.productPrice - activeOffer.discountValue;
                        discountLabel = `₹${activeOffer.discountValue} off`;
                    }
                    hasDiscount = Math.max(hasDiscount, 0);
                }
            }

            return {
                ...product.toObject(),
                finalPrice: hasDiscount ? hasDiscount.toFixed(2) : product.productPrice.toFixed(2),
                hasDiscount: hasDiscount ? hasDiscount.toFixed(2) : null,
                discountLabel,
            };
        });

        res.render('user/ProductList', {
            products: productsWithDiscounts,
            currentPage: page,
            totalPages,
        });
    } catch (err) {
        console.error('Error fetching product list:', err);
    }
};
const filterProducts = async (req, res) => {
    try {
        const { brands = [], displayTypes = [], colors = [], showOutOfStock, sortCriteria } = req.body;
        const minPrice = parseInt(req.body.minPrice, 10) || 0;
        const maxPrice = parseInt(req.body.maxPrice, 10) || Infinity;

        const query = {
            productPrice: { $gte: minPrice, $lte: maxPrice },
            isDeleted: false
        };

        if (!showOutOfStock) {
            query.productStock = { $gt: 0 };
        } else {
            query.productStock = { $gte: 0 };
        }

        let categoryIds = [];
        if (brands.length > 0 || displayTypes.length > 0 || colors.length > 0) {
            const categoryQuery = {};
            if (brands.length > 0) {
                categoryQuery.brandName = { $in: brands };
            }
            if (displayTypes.length > 0) {
                categoryQuery.displayType = { $in: displayTypes };
            }
            if (colors.length > 0) {
                categoryQuery.bandColor = { $in: colors };
            }


            const matchingCategories = await Category.find(categoryQuery).collation({ locale: 'en', strength: 2 });
            categoryIds = matchingCategories.map(category => category._id);
        }

        if (categoryIds.length > 0) {
            query.category = { $in: categoryIds };
        }


        let sortQuery = {};
        let collation = { locale: 'en', strength: 2 };
        switch (sortCriteria) {
            case 'popularity':
                sortQuery = { popularity: -1 };
                break;
            case 'priceLowToHigh':
                sortQuery = { productPrice: 1 };
                break;
            case 'priceHighToLow':
                sortQuery = { productPrice: -1 };
                break;
            case 'averageRating':
                sortQuery = { averageRating: -1 };
                break;
            case 'featured':
                sortQuery = { isFeatured: -1 };
                break;
            case 'newArrivals':
                sortQuery = { createdAt: -1 };
                break;
            case 'aToZ':
                sortQuery = { productName: 1 };
                break;
            case 'zToA':
                sortQuery = { productName: -1 };
                break;
            default:
                sortQuery = {};
                break;
        }

        const filteredProducts = await Products.find(query).populate('category').sort(sortQuery).collation(collation);

        res.json(filteredProducts);

    } catch (err) {
        console.error('Filter Products Error:', err);
        res.status(500).json({ message: 'Error occurred while filtering products' });
    }
};
const search = async (req, res) => {
    try {
        const searchQuery = req.query.q;

        const products = await Products.find({
            $or: [
                { productName: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { "highlights.brand": { $regex: searchQuery, $options: 'i' } },
                { "highlights.model": { $regex: searchQuery, $options: 'i' } }
            ],
            isDeleted: false
        });
        console.log(products);

        res.render('user/ProductList', { products, searchQuery });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).send('Server Error');
    }
};
const productPage = async (req, res) => {
    const getProductRatingSummary = async (ProductId) => {
        const reviews = await Review.find({ productId: ProductId });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
            : 0;

        await Products.findByIdAndUpdate(ProductId, { averageRating: averageRating.toFixed(1) });

        return {
            averageRating: averageRating.toFixed(1),
            totalReviews,
        };
    };

    const incrementProductPopularity = async (ProductId) => {
        await Products.findByIdAndUpdate(ProductId, { $inc: { popularity: 1 } });
    };

    try {
        const currentProductId = req.params.id;

        await incrementProductPopularity(currentProductId);

        const product = await Products.findById(currentProductId).populate('offersApplied');
        const reviews = await Review.find({ productId: currentProductId });
        const priceRange = 0.7 * product.productPrice;

        const ratingSummary = await getProductRatingSummary(currentProductId);

        const relatedProducts = await Products.find({
            productPrice: {
                $gte: product.productPrice - priceRange,
                $lte: product.productPrice + priceRange
            },
            _id: { $ne: currentProductId },
            isDeleted: false
        }).limit(4);

        // Access the discount details from the first offer in offersApplied if it exists
        const firstOffer = Array.isArray(product.offersApplied) && product.offersApplied[0];
        const hasDiscount = firstOffer && product.discountPrice && product.discountPrice < product.productPrice;
        const discountLabel = hasDiscount
            ? (firstOffer.discountType === 'percentage' && firstOffer.discountValue
                ? `${firstOffer.discountValue}% off`
                : firstOffer.discountValue
                    ? `₹${firstOffer.discountValue} off`
                    : '')
            : '';

        res.render('user/singleProduct', {
            product,
            discountedPrice: hasDiscount ? product.discountPrice.toFixed(2) : product.productPrice.toFixed(2),
            discountLabel,
            hasDiscount,
            relatedProducts,
            reviews,
            averageRating: ratingSummary.averageRating,
            totalReviews: ratingSummary.totalReviews,
        });
    } catch (err) {
        console.error('Error fetching single product details:', err);
        res.status(500).json({ error: "An error occurred while fetching the product details" });
    }
};
const review = async (req, res) => {
    try {
        const { customerName, email, rating, comment } = req.body;
        const productid = req.params.id;

        const newReview = await Review({
            productId: productid,
            customerName,
            email,
            rating,
            comment,
        });
        await newReview.save();
        res.redirect(`/singleProduct/${productid}`);
    } catch (err) {

    }
};
const logoutbtn = (req, res) => {
    delete req.session.userId;
    res.redirect('/login');
};
const demoLogin = async (req, res) => {
    try {
        const demoUser = await User.findOne({ email: 'demo@yourapp.com' });

        if (!demoUser) {
            return res.status(400).send('Demo user not available');
        }

        req.session.userId = demoUser._id;
        return res.redirect('/home');
    } catch (err) {
        console.error("Demo login error: ", err);
        return res.status(500).send('Internal Server Error');
    }
};
const blocked = (req, res) => {
    res.render('user/blocked');
};
const userProfile = async (req, res) => {
    try {

        const userId = req.session.userId;

        const user = await User.findById(userId);
        const address = await Address.findOne({ isDefault: true, user: userId });

        res.render('user/userProfile', { user, address });

    } catch (err) {
        console.log('error in userPfofile', err)
    }

};
const passwordUpdate = async (req, res) => {
    try {
        const { id, oldPassword, password } = req.body;

        const user = await User.findById(id);
        if (user) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (isMatch) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                await user.save();
                res.render('user/passwordUpdate', { msg: 'Password changed successfully' });
            } else {
                res.render('user/passwordUpdate', { err: 'passoword not matching ' });
            }
        } else {
            res.render('user/passwordUpdate', { err: 'User not exist ' });
        }
    } catch (err) {
        console.log("Error on password update", err);
        res.status(500).send('Server error');
    }
};
const passwordUpdatePage = async (req, res) => {
    try {
        const userId = req.session.userId;
        res.render('user/passwordUpdate', { userId });
    } catch (err) {
        console.log('on password update page')
    }
}
const addressPage = async (req, res) => {
    try {
        const userId = req.session.userId;
        const addresses = await Address.find({ user: userId });
        res.render('user/address', { addresses });
    } catch (err) {
        console.log('on address page');
        res.status(500).send('Internal Server Error');
    }
};
const addAddress = async (req, res) => {
    try {
        const userId = req.session.userId;

        const { firstName, lastName, email, mobile, addressLine, city, pinCode, country, source } = req.body;

        if (!firstName || !lastName || !email || !mobile || !addressLine || !city || !pinCode || !country) {
            return res.status(400).send('All fields are required.');
        }

        const newAddress = await Address({
            user: userId,
            firstName,
            lastName,
            email,
            mobile,
            addressLine,
            city,
            pinCode,
            country
        });
        await newAddress.save();

        await User.findByIdAndUpdate(userId,
            { $push: { addresses: newAddress._id } }
        );

        if (source === 'checkout') {
            return res.redirect('/checkout')
        } else {
            return res.redirect('/address');
        }

    } catch (err) {

        console.log("on add address", err);
    }
};
const editAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const { firstName, lastName, email, mobile, addressLine, city, pinCode, country, source } = req.body;

        if (!firstName || !lastName || !email || !mobile || !addressLine || !city || !pinCode || !country) {
            return res.status(400).send('All fields are required.');
        }

        await Address.findByIdAndUpdate(addressId,
            {
                firstName,
                lastName,
                email,
                mobile,
                addressLine,
                city,
                pinCode,
                country,
            }
        );

        if (source === 'checkout') {
            res.redirect('/checkout')
        } else {
            res.redirect('/address');
        }

    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).send('Server Error');
    }
};
const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        await Address.findByIdAndDelete(addressId);
        res.redirect('/address');
    } catch (err) {
        console.log(err);
    }
};
const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { addressId } = req.body;

        await Address.updateMany({ user: userId }, { $set: { isDefault: false } });

        await Address.findByIdAndUpdate(addressId, { $set: { isDefault: true } });

        res.json({ success: true });

    } catch (err) {

        console.error(err);
        res.json({ success: false, error: err.message });

    }
};
const orders = async (req, res) => {
    const userId = req.session.userId;
    const currentPage = parseInt(req.query.page) || 1;
    const limit = 3;
    try {

        const totalOrders = await Order.countDocuments({ userId });


        const orders = await Order.find({ userId })
            .populate({
                path: 'products.productId',
                select: 'productName images productPrice',
            })
            .populate('shippingAddress')
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * limit)
            .limit(limit)
            .exec();

        const totalPages = Math.ceil(totalOrders / limit);

        res.render('user/orders', {
            orders,
            currentPage,
            totalPages
        });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).send('Error fetching orders');
    }
};
const orderDetails = async (req, res) => {
    try {
        const { orderId, productId } = req.params;

        const order = await Order.findOne({ _id: orderId })
            .populate({
                path: 'products.productId',
                select: 'productName images productPrice'
            })
            .populate('shippingAddress')
            .exec();

        const product = order.products.find(p => p.productId._id.toString() === productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.render('user/orderDetails', { order, product });
    } catch (err) {
        console.error('Error fetching product details:', err);
        res.status(500).send('Error fetching product details');
    }
};
const cancelProduct = async (req, res) => {
    try {
        const { orderId, productId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }

        const productToCancel = order.products.find(product => product.productId.toString() === productId);
        if (!productToCancel) {
            return res.status(404).send('Product not found in the order');
        }

        if (productToCancel.status === 'Cancelled') {
            return res.status(400).send('Product is already canceled');
        }

        const uptOrder = await Order.updateOne(
            { _id: orderId, "products.productId": productId, 'products.status': { $in: ['Pending', 'Confirmed'] } },
            { $set: { "products.$.status": 'Cancelled' } }
        );
       
        await Products.updateOne(
            { _id: productId },
            { $inc: { productStock: productToCancel.quantity } }
        );

        if (order.paymentMethod !== 'COD') {
            const refundAmount = productToCancel.price;

            console.log(order.userId);

            const user = await User.findById(order.userId);
            user.walletBalance += refundAmount;
            await user.save();

            const prod = await Products.findOne({ _id: productId });

            await WalletTransaction.create({
                userId: order.userId,
                amount: refundAmount,
                transactionType: 'Credit',
                description: `Refund for canceled product ${prod.productName}`
            });
        }

        const updatedOrder = await Order.findById(orderId);
        const allProductsCancelled = updatedOrder.products.every(product => product.status === 'Cancelled');

        if (allProductsCancelled) {
            updatedOrder.status = 'Cancelled';
            await updatedOrder.save();
        }

        res.redirect('/orders');

    } catch (err) {
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
        res.status(500).send('Error canceling product');
    }
};
const returnProduct = async (req, res) => {
    const { orderId, productId } = req.body;

    try {
        const updatedOrder = await Order.updateOne(
            { _id: orderId, 'products.productId': productId, 'products.status': 'Delivered' },
            { $set: { 'products.$.status': 'Returned' } }
        );

        if (updatedOrder.modifiedCount > 0) {
            res.redirect('/orders');
        } else {
            res.status(400).send('Return not allowed before delivery.');
        }
    } catch (error) {
        console.error('Error returning product:', error);
        res.status(500).send('Could not return the product');
    }
};
const placeOrder = async (req, res) => {

    const userId = req.session.userId;
    const { shippingAddressId, products, totalAmount, paymentMethod, discount, couponCode, couponDiscount } = req.body;

    try {
        if (paymentMethod === 'Wallet') {

            const user = await User.findById(userId);

            if (user.walletBalance >= totalAmount) {

                user.walletBalance -= totalAmount;
                await user.save();
                const shippingAddress = await Address.findById(shippingAddressId);

                const newOrder = new Order({
                    userId,
                    products,
                    shippingAddress: {
                        firstName: shippingAddress.firstName,
                        lastName: shippingAddress.lastName,
                        email: shippingAddress.email,
                        mobile: shippingAddress.mobile,
                        addressLine: shippingAddress.addressLine,
                        city: shippingAddress.city,
                        pinCode: shippingAddress.pinCode,
                        country: shippingAddress.country,
                    },
                    totalAmount,
                    paymentMethod,
                    paymentStatus: 'Paid',
                    status: 'Confirmed',
                    deliveryDate: new Date(new Date().setDate(new Date().getDate() + 5)),
                    discount,
                    couponCode,
                    couponDiscount
                });

                await newOrder.save();

                await WalletTransaction.create({
                    userId: userId,
                    amount: totalAmount,
                    transactionType: 'Debit',
                    description: `Payment for order ${newOrder.products}`
                });

                await Cart.findOneAndDelete({ user: userId });
                delete req.session.appliedCouponCode;

                res.redirect(`/orderSuccess/${newOrder._id}`);

            } else {

                res.status(400).send("Insufficient Wallet Balance");
            }
        } else {

            const randomDays = Math.floor(Math.random() * 8) + 3;
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + randomDays);

            const shippingAddress = await Address.findById(shippingAddressId);

            const newOrder = new Order({
                userId,
                products,
                shippingAddress:{
                    firstName: shippingAddress.firstName,
                    lastName: shippingAddress.lastName,
                    email: shippingAddress.email,
                    mobile: shippingAddress.mobile,
                    addressLine: shippingAddress.addressLine,
                    city: shippingAddress.city,
                    pinCode: shippingAddress.pinCode,
                    country: shippingAddress.country,
                },
                totalAmount,
                paymentMethod: paymentMethod || "COD",
                paymentStatus: 'Pending',
                status: 'Confirmed',
                deliveryDate,
                discount,
                couponCode,
                couponDiscount
            });
            await newOrder.save();

            await Cart.findOneAndDelete({ user: userId });
            delete req.session.appliedCouponCode;
            res.redirect(`/orderSuccess/${newOrder._id}`);
        }
    } catch (err) {
        console.log(err);

    }
};
const createRazorpayOrder = async (req, res) => {
    const { amount } = req.body;

    try {
        const order = await razorpayInstance.orders.create({
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            payment_capture: 1 // Auto capture payment
        });

        res.json({ success: true, order });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.json({ success: false, error: error.message });
    }
};
const verifyRazorpayPayment = async (req, res) => {
    const userId = req.session.userId;
    try {
        const { order_id, payment_id, signature, shippingAddressId, paymentMethod, totalAmount, products, couponCode, couponDiscount, discount } = req.body;

        const crypto = require('crypto');
        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(order_id + "|" + payment_id)
            .digest('hex');
           
            const shippingAddress = await Address.findById(shippingAddressId);
            
        if (generatedSignature === signature) {
            // Payment is verified, save the order
            const newOrder = new Order({
                userId: req.session.userId,
                products: products,
                shippingAddress:{
                    firstName: shippingAddress.firstName,
                    lastName: shippingAddress.lastName,
                    email: shippingAddress.email,
                    mobile: shippingAddress.mobile,
                    addressLine: shippingAddress.addressLine,
                    city: shippingAddress.city,
                    pinCode: shippingAddress.pinCode,
                    country: shippingAddress.country,
                },
                totalAmount,
                paymentMethod,
                paymentStatus: 'Paid',
                status: 'Confirmed',
                deliveryDate: new Date(new Date().setDate(new Date().getDate() + 5)),
                couponCode,
                couponDiscount,
                discount
            });

            await newOrder.save();
            console.log('order saved ');

            await Cart.findOneAndDelete({ user: userId });
            console.log("cart item deleted ");

            delete req.session.appliedCouponCode;
            
            res.json({ success: true, orderId: newOrder._id });
        } else {
            res.json({ success: false, message: "Payment verification failed" });
        }
    } catch (err) {
        console.log("razorpay verification error: ", err)
    }
};
const orderSuccess = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const order = await Order.findById(orderId).populate('products.productId').populate('shippingAddress').lean();

        if (!order) {
            return res.status(404).send('Order not found');
        }

        res.render('user/orderSuccess', {
            order
        });
    } catch (err) {
        console.error('Error loading order success page:', err);
        res.status(500).send('Server error');
    }
};
const cart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = 2;
        const skip = (page - 1) * limit;

        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.render('user/cart', { cartItems: [], message: 'Your cart is empty.' });
        }

        const totalItems = cart.items.length;
        const totalPages = Math.ceil(totalItems / limit);

        const paginatedItems = cart.items.slice(skip, skip + limit).map(item => {
            const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.productPrice;
            const itemTotal = price * item.quantity;
            return {
                product: item.product,
                quantity: item.quantity,
                itemTotal,
                price,
            };
        });

        const totalPrice = paginatedItems.reduce((acc, item) => acc + item.itemTotal, 0);

        const grandTotal = req.session.discountedTotal || totalPrice;

        const coupons = await Coupon.find({
            expiryDate: { $gte: new Date() },
            usageLimit: { $gt: 0 }
        });

        const appliedCouponCode = req.session.appliedCouponCode || null;

        res.render('user/cart', {
            cartItems: paginatedItems,
            totalPrice,
            grandTotal,
            currentPage: page,
            totalPages,
            coupons,
            appliedCouponCode
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
const removeCartItem = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.params.id;

        const cart = await Cart.findOne({ user: userId });
        const itemToRemove = cart.items.find(item => item.product.toString() === productId);

        if (!itemToRemove) {
            return res.redirect('/cart');
        }

        await Cart.updateOne(
            { user: userId },
            { $pull: { items: { product: productId } } }
        );

        const product = await Products.findById(productId);
        product.productStock += itemToRemove.quantity;
        await product.save();

        res.redirect('/cart');
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.render('error', { message: 'Error removing product from cart' });
    }
};
const addToCart = async (req, res) => {
    const { productId, quantity, } = req.body;
    const userId = req.session.userId;

    try {
        const product = await Products.findById(productId)
            .populate('category offersApplied');

        if (!product || product.isDeleted || product.productStock < quantity) {
            const relatedProducts = await Products.find({ category: product.category }).limit(5).lean();
            const reviews = await Review.find({ product: productId }).lean();
            const totalRating = reviews.length;
            const averageRating = totalRating > 0 ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalRating).toFixed(1) : 0;

            return res.render('user/singleProduct', {
                msg: 'Product is unavailable or out of stock',
                product,
                relatedProducts,
                reviews,
                totalRating,
                averageRating
            });
        }

        // Determine final price to use in cart
        const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.productPrice;

        // Check if quantity exceeds stock or maxQtyPerPerson
        if (quantity > product.maxQtyPerPerson || quantity > product.productStock) {
            const relatedProducts = await Products.find({ category: product.category }).limit(5).lean();
            const reviews = await Review.find({ product: productId }).lean();
            const totalRating = reviews.length;
            const averageRating = totalRating > 0 ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalRating).toFixed(1) : 0;

            return res.render('user/singleProduct', {
                msg: `Quantity exceeds limit. Max per person: ${product.maxQtyPerPerson}, Available stock: ${product.productStock}`,
                product,
                relatedProducts,
                reviews,
                totalRating,
                averageRating
            });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingItem = cart.items.find(item => item.product.toString() === productId);

        if (existingItem) {
            existingItem.quantity += Number(quantity);
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: finalPrice,  // Use final calculated price
            });
        }

        await cart.save();
        product.productStock -= quantity;
        await product.save();

        res.redirect('/cart');

    } catch (err) {
        console.error('Error adding product to cart:', err);
        res.status(500).send('Internal Server Error');
    }
};
const updateCartQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        const product = await Products.findById(productId);

        if (!cart || !product) {
            return res.json({ success: false, message: 'Cart or product not found' });
        }

        if (quantity > product.maxQtyPerPerson) {
            return res.json({ success: false, message: `You can only add up to ${product.maxQtyPerPerson} units of this product.` });
        }

        const itemIndex = cart.items.findIndex(item => item.product.equals(productId));

        if (itemIndex > -1) {
            const oldQuantity = cart.items[itemIndex].quantity;
            const quantityDifference = quantity - oldQuantity;

            if (quantityDifference > 0) {
                if (product.productStock < quantityDifference) {
                    return res.json({ success: false, message: 'Not enough stock available' });
                }
                product.productStock -= quantityDifference;
            } else {
                product.productStock += Math.abs(quantityDifference);
            }

            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            await product.save();

            const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.productPrice;
            const updatedItemPrice = effectivePrice * quantity;

            const cartTotalPrice = cart.items.reduce((total, item) => {
                const itemProduct = item.product;

                const itemEffectivePrice = itemProduct.discountPrice > 0 ? itemProduct.discountPrice : itemProduct.productPrice; // Use stored discount price or original price
                return total + (itemEffectivePrice * item.quantity);
            }, 0);

            return res.json({
                success: true,
                message: 'Cart quantity updated',
                updatedItemPrice,
                cartTotalPrice
            });
        }

        return res.json({ success: false, message: 'Product not found in cart' });
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.json({ success: false, message: 'Error updating cart quantity' });
    }
};
const checkoutbtn = (req, res) => {
    res.redirect('/checkout');
}
const checkout = async (req, res) => {
    try {
        const userId = req.session.userId;

        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            return res.status(404).send('No cart found for this user.');
        }

        const cartItems = cart.items.map(item => {
            // Check if the product has a discount price; if not, use the regular price
            const productPrice = item.product.discountPrice || item.product.productPrice;

            return {
                product: item.product,
                quantity: item.quantity,
                itemTotal: item.quantity * productPrice // Calculate total using the effective price
            };
        });

        const subTotal = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);
        const shippingCharge = 100;
        const deliveryCharge = 50;
        const grandTotal = subTotal + shippingCharge + deliveryCharge;

        // Access the applied coupon code from the session
        const appliedCouponCode = req.session.appliedCouponCode || null;
        let discountAmount = 0;

        if (appliedCouponCode) {
            const coupon = await Coupon.findOne({ code: appliedCouponCode });

            if (coupon) {

                if (coupon.discountType === 'percentage') {
                    discountAmount = (subTotal * coupon.discountValue) / 100;
                } else if (coupon.discountType === 'fixed') {
                    discountAmount = coupon.discountValue;
                }
            }
        }

        const finalTotal = grandTotal - discountAmount;

        const userAddresses = await Address.find({ user: userId });
        const user = await User.findOne({ _id: userId });

        res.render('user/checkout', {
            cartItems,
            subTotal,
            shippingCharge,
            grandTotal: finalTotal,
            appliedCouponCode,
            discountAmount,
            userAddresses,
            deliveryCharge,
            razorpayKey: process.env.RAZORPAY_KEY_ID,
            userEmail: user.email
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
const editUserProfile = async (req, res) => {
    try {
        const { id, userName, email, mobile, country, addressId } = req.body;
        console.log(req.body);

        const user = await User.findByIdAndUpdate(id,
            {
                userName,
                email
            },
            { new: true }
        );

        const address = await Address.findByIdAndUpdate(addressId,
            {
                mobile,
                country
            },
            { new: true }
        );

        res.render('user/userProfile', { user, address });
    } catch (err) {
        console.log('error occured', err)
    }
};
const whishlist = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/login');
        }

        const whishlist = await Wishlist.findOne({ userId: userId, }).populate('products');
        const products = whishlist ? whishlist.products : [];
        res.render('user/whishList', { products });

    } catch (error) {

        console.log("Whishlist Error:", error);
    }
};
const addWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Please log in first' });
        }

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }


        let wishlist = await Wishlist.findOne({ userId: userId });

        if (!wishlist) {
            wishlist = new Wishlist({ userId: userId, products: [] });
        }


        if (wishlist.products.includes(productId)) {
            return res.status(400).json({ success: false, message: 'Product already in wishlist' });
        }

        wishlist.products.push(productId);
        await wishlist.save();

        return res.status(200).json({ success: true, message: 'Product added to wishlist successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error });
    }
};
const removeWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { productId } = req.body;

        console.log('userid :', userId, "productid :", productId);

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Please log in first' });
        }

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const wishlist = await Wishlist.findOne({ userId: userId });

        if (!wishlist) {
            return res.status(400).json({ success: false, message: 'Wishlist not found' });
        }

        const initialLength = wishlist.products.length;
        wishlist.products = wishlist.products.filter(item => item.toString() !== productId);

        if (initialLength === wishlist.products.length) {
            return res.status(400).json({ success: false, message: 'Product not found in wishlist' });
        }

        await wishlist.save();

        return res.status(200).json({ success: true, message: 'Product removed from wishlist successfully' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return res.status(500).json({ success: false, message: 'Server error', error });
    }
};
const couponApply = async (req, res) => {
    const userId = req.session.userId;
    const { couponCode } = req.body;

    try {
        const cart = await getCart(userId);
        if (!cart) {
            return res.status(400).json({ success: false, message: 'Cart not found' });
        }

        const couponCheck = await checkCouponApplicability(cart, couponCode);
        if (!couponCheck.valid) {
            return res.status(400).json({ success: false, message: couponCheck.message });
        }

        const finalTotal = applyCoupon(cart, couponCheck.discountValue, couponCheck.discountType);

        req.session.discountedTotal = finalTotal;
        req.session.appliedCouponCode = couponCode;
        return res.json({ success: true, finalTotal, message: 'Coupon applied successfully!' });

    } catch (error) {
        return res.status(500).json({ success: false, appliedCouponCode: couponCode, message: 'Error applying coupon' });
    }
};
async function getCart(userId) {
    try {
        const cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'productName category productPrice',
        }).exec();

        return cart;
    } catch (error) {
        console.error('Error fetching cart:', error);
        return null;
    }
};
async function checkCouponApplicability(cart, couponCode) {
    try {
        const coupon = await Coupon.findOne({ code: couponCode });

        if (!coupon) {
            return { valid: false, message: 'Invalid coupon code' };
        }


        if (new Date() > coupon.expirationDate) {
            return { valid: false, message: 'Coupon has expired' };
        }

        const appliesToAllProducts = coupon.applicableProducts.length === 0;
        const appliesToAllCategories = coupon.applicableCategories.length === 0;
        console.log(appliesToAllProducts, appliesToAllCategories);

        // Check if the coupon applies to products or categories in the cart
        let applicable = false;
        for (const item of cart.items) {

            const product = item.product;

            const isProductApplicable = appliesToAllProducts || coupon.applicableProducts.includes(product._id);
            const isCategoryApplicable = appliesToAllCategories || coupon.applicableCategories.includes(product.category);


            if (isProductApplicable || isCategoryApplicable) {
                applicable = true;
                break;
            }
        }

        if (!applicable) {
            return { valid: false, message: 'Coupon is not applicable to your cart' };
        }

        return { valid: true, discountValue: coupon.discountValue, discountType: coupon.discountType };

    } catch (error) {
        console.error('Error checking coupon:', error);
        return { valid: false, message: 'Error processing the coupon' };
    }
};
function applyCoupon(cart, discountValue, discountType) {
    console.log(discountValue, discountType);

    let total = cart.items.reduce((sum, item) => {
        return sum + (item.quantity * item.product.productPrice);
    }, 0);

    if (discountType === 'percentage') {
        total = total - (total * (discountValue / 100));
    } else if (discountType === 'fixed') {
        total = total - discountValue;
    }

    total = Math.max(0, total);

    return total;
};
const removeCoupon = async (req, res) => {
    try {
        const userId = req.session.userId;

        const cart = await getCart(userId);
        if (!cart) {
            return res.status(400).json({ success: false, message: 'Cart not found' });
        }

        const totalPrice = cart.items.reduce((acc, item) => acc + (item.quantity * item.product.productPrice), 0);
        const deliveryCharge = 50;
        const grandTotal = totalPrice + deliveryCharge;

        req.session.discountedTotal = null;
        req.session.appliedCouponCode = null;

        return res.json({ success: true, grandTotal });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error removing coupon' });
    }
};
const walletpage = async (req, res) => {
    try {
        const userId = req.session.userId;

        const transactions = await WalletTransaction.find({ userId });
        console.log(transactions)
        const user = await User.findById(userId)
        res.render('user/wallet', { transactions, user });
    } catch (err) {
        console.log(err)
    }

};
module.exports = {
    homePage,
    gestUser,
    authPromptPage,
    loginPage,
    loginBtn,
    signupPage,
    signupBtn,
    otpPage,
    verifyOtp,
    resendOtp,
    ProductList,
    filterProducts,
    search,
    productPage,
    review,
    logoutbtn,
    demoLogin,
    blocked,
    userProfile,
    passwordUpdate,
    orders,
    cart,
    checkout,
    editUserProfile,
    passwordUpdatePage,
    addressPage,
    addAddress,
    setDefaultAddress,
    editAddress,
    deleteAddress,
    addToCart,
    removeCartItem,
    updateCartQuantity,
    checkoutbtn,
    placeOrder,
    cancelProduct,
    orderDetails,
    orderSuccess,
    whishlist,
    addWishlist,
    removeWishlist,
    couponApply,
    removeCoupon,
    createRazorpayOrder,
    verifyRazorpayPayment,
    walletpage,
    returnProduct
}