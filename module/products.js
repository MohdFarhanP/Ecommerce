const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    productName:String,
    productStock:{
        type:Number,
        default:0,
    },
    productPrice:Number,
    discountPrice:{
        type:Number,
        default:0,
    },
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
        default: function() {
            if (typeof this.productStock === 'number' && !isNaN(this.productStock)) {
                return Math.min(Math.floor(this.productStock / 5), 10);
            }
            return 0;
        }
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
    offersApplied: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
    }],
});

module.exports = mongoose.model("Products",productSchema);