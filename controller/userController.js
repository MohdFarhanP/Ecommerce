const bcrypt = require('bcrypt');
const User = require("../module/userModel");
const nodemailer = require('nodemailer');
const { template } = require('handlebars');
require('dotenv').config();

const homePage = (req, res) => {
    res.render('user/home');
}
const loginPage = (req, res) => {
    res.render('user/login');
}
const loginBtn = (req, res) => {
    const { userName } = req.body;
}
const signupPage = (req, res) => {
    res.render('user/signup')
}
const signupBtn = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        console.log(userName,email,password)
        const exist = await User.findOne({ userName, email });
        if (!exist) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await new User({
                userName,
                email,
                password:hashedPassword,
                verified:false,
            });
            await newUser.save();

            return res.render("user/login", { msg: "User created successfully" });
        } else {
            return res.render('user/signup', { msg: 'user already exists' });
        }
    } catch (error) {
        console.error('signup error:', error)
    }
}
const otpPage = async (req,res) =>{
    res.render('user/otp')
}

const sendOTPVerificationEmail = async (email)=>{
    try{
        
        const otp = Math.floor(1000 + Math.random()*9000);
        req.session.otp = otp;
        req.session.email = email;
        req.session.otpTimestamp = Date.now();

        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.EMAIL,
                pass:process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from:process.env.EMAIL,
            to:email,
            subject:'Your OTP for Sign up',
            template:'user/email-otp',
            context:{
                otp:req.session.otp,
            },
        };
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                 console.log("Error sending OTP emil",error);
            }else{
                console.log("OTP email send:",info.response);
            }

        });
    }
    catch(error){
        console.log("error on setuping otp send emil",error);
    }
}

module.exports = {
    homePage,
    loginPage,
    loginBtn,
    signupPage,
    signupBtn,
    otpPage
}