const passport = require('passport');
const User = require('../module/userModel');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const existUser = await User.findOne({ googleId: profile.id });
            if (existUser) {
                return done(null, existUser);
            } else {
                const newUser = await new User({
                    googleId: profile.id,
                    userName: profile.displayName,
                    email: profile.emails[0].value
                });
                const savedUser = await newUser.save();
                return done(null, savedUser);
            }
        } catch (error) {
            return done(error, null);

        }
    }));

    //facebook

    passport.use(new FacebookStrategy({
        clientID:process.env.FACEBOOK_APP_ID,
        clientSecret:process.env.FACEBOOK_APP_SECRET,
        callbackURL:'/auth/facebook/callback',
        profileFields:["id","displayName","email"], 

    },
    async(accessToken,refreshToken,profile,done)=>{
        try{
            const existUser = await User.findOne({facebookId:profile.id});
            if(existUser){
                return done(null,existUser);
            }else{
                const newUser = await new User({
                    facebookId:profile.id,
                    userName:profile.displayName,
                    email:profile.emails ? profile.emails[0].value : 'No Public email'
                });
                const savedUser = await newUser.save();
                return done(null,savedUser);
            }
        }catch(err){
            return done(err,null)
        }
    }));

    passport.serializeUser ((user,done)=>{
        done(null,user.id);
    });

    passport.deserializeUser( async (id,done)=>{
        try{
        const user = await User.findById(id);
        done(null,user);
        }catch(err){
            done(err,null)
        }
    });


    module.exports = passport;