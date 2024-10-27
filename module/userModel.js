const { registerHelper } = require('hbs');
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
},
{ timestamps: true });

module.exports = mongoose.model('user',userSchema)