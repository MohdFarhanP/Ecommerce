const User = require('../module/userModel')

const checkSession = (req,res,next)=>{
    if(req.session.userId){
        next();
    }else{
        res.redirect("/user/login");
    }
};

const isLogin = (req,res,next)=>{
    if(req.session.userId){
        res.redirect('/user/home');
    }else{
        next();
    }
};




module.exports = {
    isLogin,
    checkSession,
}