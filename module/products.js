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
    highlights: { 
        brand: String,
        model: String,
        caseMaterial: String,
        dialColor: String,
        waterResistance: String,
        movementType: String,
        bandMaterial: String,
        features: [String], 
        warranty: String,
    },
    maxQtyPerPerson: {
        type: Number,
        default: 5 
    },
    createdAt: {
        type: Date,
        default: Date.now, 
    },
    isFeatured: {
        type: Boolean,
        default: false, 
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    popularity: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model("Products",productSchema);