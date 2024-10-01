const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    productName:String,
    productStock:Number,
    productPrice:Number,
    images:[String],
    isDeleted:{
        type:Boolean,
        default:false,
    },
    category:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
    }],
    description:String,
});

module.exports = mongoose.model("Products",productSchema);