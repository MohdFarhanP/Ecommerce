const { registerHelper } = require('hbs');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userName:String,
    email:String,
    password:String,
    googleId:String,
    facebookId:String,
    isBlocked:{
        type:Boolean,
        default:false,
    },
},
{ timestamps: true });

module.exports = mongoose.model('user',userSchema)