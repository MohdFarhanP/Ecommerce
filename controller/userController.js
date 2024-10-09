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
const categoryModel = require('../module/categoryModel');
const Address = require('../module/addressModel');
const Cart = require('../module/cartModel');
const { error } = require('console');

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

        // If everything is fine, set the session userId
        req.session.userId = exist._id;
        return res.redirect('/user/home');
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

        // Store userId in session for OTP verification
        req.session.userId = newUser._id; // Moved here

        // Generate OTP
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
    res.render('user/otp')
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
                // Successfully verified OTP
                req.session.userId = req.session.userId; // Already set during signup
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
    try {

        const products = await Products.find({isDeleted:false});

        res.render('user/ProductList', { products });
    } catch (err) {
        console.log(err);
    }

};
const filterProducts = async (req, res) => {
    try {

        const { brands, displayTypes, colors } = req.body;
        const minPrice = parseInt(req.body.minPrice, 10);
        const maxPrice = parseInt(req.body.maxPrice, 10);


        const query = {
            productPrice: { $gte: minPrice, $lte: maxPrice },
            isDeleted: false
        };

        let categoryIds = [];
        if (brands.length > 0 || displayTypes.length > 0 || colors.length > 0) {
            const categoryQuary = {};
            if (brands.length > 0) {
                categoryQuary.brandName = { $in: brands };
            }

            if (displayTypes.length > 0) {
                categoryQuary.displayType = { $in: displayTypes };
            }

            if (colors.length > 0) {
                categoryQuary.bandColor = { $in: colors };
            }

            const matchingCategories = await Category.find(categoryQuary);
            categoryIds = matchingCategories.map(category => category._id);
        }

        if (categoryIds.length > 0) {
            query.category = { $in: categoryIds };
        }


        const filteredProducts = await Products.find(query).populate('category');

        res.json(filteredProducts);

    } catch (err) {
        console.log(err);
    }
};
const productPage = async (req, res) => {
    try {

        const currentProductId = req.params.id;
      
        const product = await Products.findById(currentProductId);
        
        const reviews = await Review.find({productId:currentProductId});
       
        const priceRange = 0.7 * product.productPrice;
        
        

        const getProductRatingSummary = async (ProductId) => {
            const reviews = await Review.find({ productId:ProductId });
            const totalReviews = reviews?.length || 0;
            const averageRating = totalReviews > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews : 0 ;

            return {
                averageRating: averageRating.toFixed(1),
                totalReviews,
            };
        };
        const ratingSummary = await getProductRatingSummary(currentProductId);

        const relatedProducts = await Products.find({

            productPrice: {
                $gte: product.productPrice - priceRange,
                $lte: product.productPrice + priceRange
            },
            _id: { $ne: currentProductId },
            isDeleted: false
        }).limit(4);

        res.render('user/singleProduct', {
            product,
            relatedProducts,
            reviews,
            averageRating: ratingSummary.averageRating,
            totalReviews: ratingSummary.totalReviews,
        });
    } catch (err) {
        console.log('fetching related products:', err);
        res.status(500).json({ error: "An error occured while fetching related products" });
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
        res.redirect(`/user/singleProduct/${productid}`);
    } catch (err) {

    }
};
const logoutbtn = (req,res) =>{

    res.redirect('/user/login');

};
const demoLogin = async (req,res)=>{
    try {
        const demoUser = await User.findOne({ email: 'demo@yourapp.com' });

        if (!demoUser) {
            return res.status(400).send('Demo user not available');
        }

        req.session.userId = demoUser._id;

        return res.redirect('/user/home');
    } catch (err) {
        console.error("Demo login error: ", err);
        return res.status(500).send('Internal Server Error');
    }
};
const blocked =  (req, res) => {
    res.render('user/blocked');
};
const userProfile = async(req,res) =>{
    try{

        const userId = req.session.userId;
        const user = await User.findById(userId);
        const address = await Address.findOne({isDefault:true,user:userId});
        // if(!address) return res.json('No seledted address for this user ') 
        res.render('user/userProfile',{user,address});

    }catch(err){
        console.log('error in userPfofile',err)
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
                return res.json({ error: 'Wrong password' });
            }
        } else {
            res.json({ error: 'User does not exist' });
        }
    } catch (err) {
        console.log("Error on password update", err);
        res.status(500).send('Server error');
    }
};
const passwordUpdatePage = async(req,res)=>{
    try{
        const userId =req.session.userId;
        res.render('user/passwordUpdate',{userId});
    }catch(err){
        console.log('on password update page')
    }
}
const addressPage = async (req,res)=>{
    try{ 
        const userId = req.session.userId;
        const addresses = await Address.find({user:userId});
        res.render('user/address',{addresses});
    }catch(err){
        console.log('on address page');
        res.status(500).send('Internal Server Error');
    }
};
const addAddress = async (req,res)=>{
    try{
        const userId = req.session.userId;
    
        const {firstName,lastName,email,mobile,addressLine,city,pinCode,country} =req.body;
       
        if (!firstName || !lastName || !email || !mobile || !addressLine || !city || !pinCode || !country) {
            return res.status(400).send('All fields are required.');
        }
        
        const newAddress = await Address({
            user:userId,
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
            {$push:{addresses:newAddress._id}}
        );
        
        res.redirect('/user/address');
    
    }catch(err){
        
        console.log("on add address",err);
    }
};
const editAddress = async (req,res)=>{
    try{
        const addressId = req.params.id;
    const {firstName,lastName,email,mobile,addressLine,city,pinCode,country} = req.body;

    if (!firstName || !lastName || !email || !mobile || !addressLine || !city || !pinCode || !country) {
        return res.status(400).send('All fields are required.');
    }

    await Address.findByIdAndUpdate(addressId,
        {firstName,
            lastName,
            email,
            mobile,
            addressLine,
            city,
            pinCode,
            country,
        }
    );
    res.redirect('/user/address');
    }catch(err){
        console.error('Error updating address:', err);
        res.status(500).send('Server Error');
    } 
};
const deleteAddress = async (req,res)=>{
    try{
        const addressId = req.params.id;
        await Address.findByIdAndDelete(addressId);
        res.redirect('/user/address');
    }catch(err){
        console.log(err);
    }
};
const setDefaultAddress = async (req,res)=>{
    try{
        const userId = req.session.userId;
        const {addressId} = req.body;

        await Address.updateMany( { user:userId }, { $set: { isDefault: false }});

        await Address.findByIdAndUpdate( addressId, {$set: { isDefault: true }});

        res.json({ success: true });

    }catch(err){

        console.error(err);
        res.json({ success: false, error: err.message });
        
    }
};
const orders = (req,res)=>{
    res.render('user/orders');
};
const cart = async(req,res)=>{
    try{
        const userId = req.session.userId;
        const cart = await Cart.findOne({user:userId}).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.render('user/cart', { cartItems: [], message: 'Your cart is empty.' });
        }
        const cartItems = cart.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
        }));
        res.render('user/cart',{cartItems});
    }catch(err){
        console.log(err)
    }
};
const addToCart = async (req,res)=>{
    const {productId,quantity} = req.body;
    const userId = req.session.userId;
    try{
        const product = await Products.findById(productId);
        
        if (!product || product.isDeleted || product.productStock < quantity) {
            return res.render('user/singleProduct',{msg:'Product is unavailable or out of stock'});
        }
        let cart = await Cart.findOne({user:userId}) 
        if(!cart){
            cart = await new Cart({user:userId, items:[]});
        }

        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
            const qty = Number(quantity)
            existingItem.quantity += qty;       
            if (existingItem.quantity > product.productStock) {
                return res.render('user/singleProduct',{msg:'Not enough stock available'});
            }
        } else {

            cart.items.push({ product: productId, quantity });
        }

        await cart.save();

        res.redirect('/user/cart');

    }catch(err){

        console.log(err)
    }
};
const checkout = (req,res)=>{
    res.render('user/checkout');
};
const editUserProfile = async (req,res)=>{
    try{
        const {id,userName,email} = req.body;
        const user = await User.findByIdAndUpdate(id,
            {
                userName,
                email
            },
            {new:true}
        );
        
        res.render('user/userProfile',{user});
    }catch(err){
        console.log('error occured',err )
    }
};


module.exports = {
    homePage,
    loginPage,
    loginBtn,
    signupPage,
    signupBtn,
    otpPage,
    verifyOtp,
    resendOtp,
    ProductList,
    filterProducts,
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
    addToCart

}