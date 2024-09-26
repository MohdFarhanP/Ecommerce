const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    brandName:String,
    displayType:String,
    bandColor:String,

});

module.exports = mongoose.model('Category',categorySchema);