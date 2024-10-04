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

    res.render('user/home');
}
const loginPage = (req, res) => {
    res.render('user/login');
}
const loginBtn = async (req, res) => {
    try{
        const { email, password } = req.body;
    const exist = await User.findOne({ email, });
    if (!exist) {
        return res.render('user/login', { err: 'user not exist' });
    } else {
        const pass = await bcrypt.compare(password,exist.password);
        if (!pass) return res.render('user/login', { err: 'incorrect password' });
        if (exist.isBlocked) {
            return res.render('user/login', { err: 'you are blocked' })
        }
        else {
            req.session.user = true;
            return res.redirect('/user/home');
        }
    }
    }catch(err){
        console.log("login erro ",err)}
    
}
const signupPage = (req, res) => {
    res.render('user/signup')
}
const signupBtn = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const exist = await User.findOne({ userName, email });
        if (!exist) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await new User({
                userName,
                email,
                password: hashedPassword,
            });
            await newUser.save();

            // email sending

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
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("Error sending OTP emil", error);
                } else {
                    console.log("OTP email send:", info.response);
                    res.redirect('/user/otp')
                }
            });

        } else {
            return res.render('user/signup', { msg: 'user already exists' });
        }
    } catch (error) {
        console.error('signup error:', error)
    }
}
const otpPage = (req, res) => {
    res.render('user/otp')
}

const verifyOtp = async (req, res) => {
    try {
        const userOtp = req.body.otp;
        const otpAge = Date.now() - req.session.otpTimestamp;
        const otpExp = 1 * 60 * 1000;

        if (otpAge > otpExp) {
            return res.render('user/otp', { error: "OTP expired please requast a new one." });
        }

        if (userOtp === req.session.otp.toString()) {
            return res.render('user/login', { msg: "User created successfully" });
        } else {
            return res.render('user/otp', { error: "Invalid OTP please try again" });
        }
    } catch (error) {
        console.error("verifing error", error);
    }
}

const resendOtp = (req, res) => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    req.session.otp = otp;
    req.session.otpTimestamp = Date.now();

    console.log("Resend Generated OTP:", otp);
    console.log("Session OTP (after setting):", req.session.otp);

    const mailOptions = {
        from: process.env.EMAIL,
        to: req.session.email,
        subject: 'Your Resend OTP for Sign up',
        template: 'email-otp',
        context: {
            otp: req.session.otp,
        },
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error sending OTP emil", error);
        } else {
            console.log("Resend OTP send:", info.response);
            res.render('user/otp')
        }

    });
}
const ProductList = async (req, res) => {
    try {

        const products = await Products.find({isDeleted:false});

        res.render('user/ProductList', { products });
    } catch (err) {
        console.log(err);
    }

}
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
}
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
}
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
}
const logoutbtn = (req,res) =>{
    req.session.user = null;
    res.redirect('/user/login')

}
const demoLogin = async (req,res)=>{
    try {
        const demoUser = await User.findOne({ email: 'demo@yourapp.com' });

        if (!demoUser) {
            return res.status(400).send('Demo user not available');
        }

        req.session.user = { id: demoUser._id, email: demoUser.email };

        return res.redirect('/user/home');
    } catch (err) {
        console.error("Demo login error: ", err);
        return res.status(500).send('Internal Server Error');
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
}