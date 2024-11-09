
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userName:String,
    email:String,
    password:String,
    googleId:String,
    facebookId:String,
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    isBlocked:{
        type:Boolean,
        default:false,
    },
    walletBalance: { type: Number, default: 0 },

    isFirstPurchase:{type:Boolean,default:true},
    
    referralCode: { type: String, unique: true },
    
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
},
{ timestamps: true });

module.exports = mongoose.model('user',userSchema)