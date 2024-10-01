const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    brandName:{
        type:String,
        unique:true,
    },
    displayType:{
        type:String,
        unique:true,
    },
    bandColor:{
        type:String,
        unique:true,
    },
    isDelete:{
        type:Boolean,
        default:false,
    }

});

module.exports = mongoose.model('Category',categorySchema);