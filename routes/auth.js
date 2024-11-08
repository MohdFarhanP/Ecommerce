const express = require('express');
const passport = require('passport');
const router = express.Router();
const Users = require('../module/userModel')

router.get('/google', passport.authenticate('google', { scope: ["profile", 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
}), async (req, res) => {
  const user = await Users.findOne({ googleId: req.user.googleId })
  if (user && user.isBlocked) {
    return res.render('user/login', { err: "You are Blocked by admin" });
  }
  req.session.userId = user._id;
  req.session.loginMethod = 'google'
  res.redirect('/home');
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/login',
}), async (req, res) => {
  const user = await Users.findOne({ facebookId: req.user.facebookId })

  if (user && user.isBlocked) {
    return res.render('user/login', { err: 'You are Blocked by admin' });
  }

  req.session.userId = user._id;
  req.session.loginMethod = 'facebook'
  res.redirect('/home');
});


module.exports = router;