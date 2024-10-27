const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    discountType: {
        type: String,
        enum: ['fixed', 'percentage'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
    },
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
    }],
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    }],
    expirationDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    description: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Offer', offerSchema);
