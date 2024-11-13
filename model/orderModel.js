const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            status: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Returned', 'Cancelled'], default: 'Pending' }
        }
    ],
    shippingAddress: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        mobile: { type: String, required: true },
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        pinCode: { type: String, required: true },
        country: { type: String, required: true },
    },

    totalAmount: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['COD','Razorpay','Wallet'], default: 'COD' }, 

    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },

    status: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },

    deliveryDate: { type: Date },

    createdAt: { type: Date, default: Date.now },
    
    discount: { type: Number, default: 0 },
    
    couponCode: { type: String },
    
    couponDiscount: { type: Number, default: 0 },
    
    razorpayOrderId: { type: String, unique: true },
});
    
module.exports = mongoose.model('Order', orderSchema);
