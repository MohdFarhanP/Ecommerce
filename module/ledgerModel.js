const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' } 
});

module.exports = mongoose.model('Ledger', ledgerSchema);