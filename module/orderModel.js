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
            status: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' }
        }
    ],
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },

    totalAmount: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['COD'], default: 'COD' }, 

    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },

    status: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },

    deliveryDate: { type: Date },

    createdAt: { type: Date, default: Date.now }
});
    
module.exports = mongoose.model('Order', orderSchema);
