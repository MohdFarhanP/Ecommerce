const express = require('express');
const passport = require('passport');
const { route } = require('./admin');
const router = express.Router();

router.get('/google',passport.authenticate('google',{scope:["profile",'email']}));

router.get('/google/callback',passport.authenticate('google',{
    failureRedirect:'/user/login',
 }), (req,res)=>{
    res.redirect('/user/home');
 });

 router.get('/facebook',passport.authenticate('facebook',{scope:['email']}));

 router.get('/facebook/callback',passport.authenticate('facebook',{
    failureRedirect:'/user/login',
 }), (req,res)=>{
    res.redirect('/user/home');
 });


 module.exports = router;