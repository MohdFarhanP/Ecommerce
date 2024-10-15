const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    brandName:{
        type:String,
        unique:true,
        required:true,
    },
    displayType:{
        type:String,
        required:true,
    },
    bandColor:{
        type:String,
        required:true,
    },
    isDelete:{
        type:Boolean,
        default:false,  
    }

});

module.exports = mongoose.model('Category',categorySchema);