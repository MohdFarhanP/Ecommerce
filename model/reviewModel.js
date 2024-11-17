const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products',
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      match: [/.+\@.+\..+/, 'Please enter a valid email address'],
      required: false // Email is now optional
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  });
  
  module.exports = mongoose.model('Review', reviewSchema);