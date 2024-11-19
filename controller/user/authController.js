const bcrypt = require('bcrypt');
const User = require("../../model/userModel");
const nodemailer = require('nodemailer');
const path = require('path');
const WalletTransaction = require('../../model/wlletModel');
require('dotenv').config();

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
                partialsDir: path.join(__dirname, '../../views/partials'),
                layoutsDir: path.join(__dirname, '../views/layouts'),
                defaultLayout: false,
            },
            viewPath: path.join(__dirname, '../../views/user'),
            extName: '.hbs',
        };

        // Register handlebars as the template engine for nodemailer
        transporter.use('compile', hbs.default(handlebarOptions));
        console.log("Nodemailer with Handlebars configured successfully");

    } catch (error) {
        console.error('Error configuring nodemailer-express-handlebars:', error);
    }
})();

// Renders the authentication prompt page
const authPromptPage = (req, res) => {
    res.render('user/authPrompt')
};
// Renders the login page for users 
const loginPage = (req, res) => {
    res.render('user/login');
};
// login verification 
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
// Renders the signup page for new users to register
const signupPage = (req, res) => {
    res.render('user/signup')
};
// signup  validating 
const signupBtn = async (req, res) => {
    try {
        const { userName, email, password, referralCode } = req.body;

        const exist = await User.findOne({ email });
        if (exist) {
            return res.render('user/signup', { msg: 'User already exists' });
        }

        req.session.userSignupData = {
            userName,
            email,
            password,
            referralCode,
        };


        let referredByUser = null;
        if (referralCode) {
            referredByUser = await User.findOne({ referralCode });
            if (!referredByUser) {
                return res.render('user/signup', { msg: 'Invalid referral code' });
            }
            req.session.appliedReferralCode = referralCode;
        }

        const otp = Math.floor(1000 + Math.random() * 9000);
        req.session.otp = otp;
        req.session.otpTimestamp = Date.now();
        
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Your OTP for Sign up',
            template: '/email-otp',
            context: {
                otp: req.session.otp,
                userName,
            },
        };

        await transporter.sendMail(mailOptions);

        req.session.referredByUser = referredByUser ? referredByUser._id : null;

        const remainTime = 60;
        res.render('user/otp', { remainTime, id: req.session.userId });

    } catch (error) {
        console.error('Signup error:', error);
        return res.redirect('/signup');
    }
};
const otpPage = (req, res) => {
    res.render('user/otp')
};
// Verifies the OTP 
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

                const { userName, email, password, referralCode } = req.session.userSignupData;

                const hashedPassword = await bcrypt.hash(password, 10);
                const generateReferralCode = () => `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

                let referredByUser = req.session.referredByUser ? await User.findById(req.session.referredByUser) : null;

                const newUser = new User({
                    userName,
                    email,
                    password: hashedPassword,
                    referralCode: generateReferralCode(),
                    referredBy: referredByUser ? referredByUser._id : null,
                });

                await newUser.save();

                if (referredByUser) {
                    const walletTransaction = new WalletTransaction({
                        userId: referredByUser._id,
                        amount: 50,
                        transactionType: 'Credit',
                        description: 'Referral bonus for new signup',
                    });
                    await walletTransaction.save();
                    referredByUser.walletBalance += 50;
                    await referredByUser.save();
                }

                req.session.userId = newUser._id;
                return res.render('user/home');  

            } else {
                return res.render('user/otp', { error: "Invalid OTP, please try again.", remainTime });
            }
        }
    } catch (error) {
        console.error("Verifying error:", error);
        return res.render('user/otp', { error: 'An error occurred during OTP verification' });
    }
};
//function for resending OTP
const resendOtp = async (req, res) => {
    try {
        const otp = Math.floor(1000 + Math.random() * 9000);
        req.session.otp = otp;
        req.session.otpTimestamp = Date.now();


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
        const remainTime = 60;
        return res.render('user/otp', { remainTime, id });
    } catch (error) {
        console.log("Error sending OTP email", error);
        return res.render('user/otp', { error: 'An error occurred while resending the OTP' });
    }
};
//user logout and clears the session
const logoutBtn = (req, res) => {
    delete req.session.userId;
    res.redirect('/login');
};
//demo login function
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
// page for blocked users
const blocked = (req, res) => {
    res.render('user/blocked');
};


module.exports = {
    authPromptPage,
    loginPage,
    loginBtn,
    signupPage,
    signupBtn,
    otpPage,
    verifyOtp,
    resendOtp,
    demoLogin,
    blocked,
    logoutBtn
};