const bcrypt = require('bcrypt');
const User = require("../module/userModel");
const nodemailer = require('nodemailer');
const { template } = require('handlebars');
const path = require('path');
const { emit } = require('process');
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
    const { email,password } = req.body;
    const exist = await User.findOne({email,});
    if(!exist)
        {
            return res.render('user/login',{err:'user not exist'});
    }else{
        const pass = await bcrypt.compare(password,exist.password);
        if(!pass) return res.render('user/login',{err:'incorrect password'});
        if(exist.isBlocked){
            return res.render('user/login',{err:'you are blocked'})
        }
        else{
            req.session.user = true;
            return res.redirect('/user/home');
        }
    }
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
    try{
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
}catch(error){
    console.error("verifing error",error);
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
module.exports = {
    homePage,
    loginPage,
    loginBtn,
    signupPage,
    signupBtn,
    otpPage,
    verifyOtp,
    resendOtp
}