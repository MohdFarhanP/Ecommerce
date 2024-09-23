const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userName:String,
    email:String,
    password:String,
    verified:Boolean
});

module.exports = mongoose.model('user',userSchema)