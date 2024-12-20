
const Address = require('../../model/addressModel');
const Cart = require('../../model/cartModel');
const Order = require('../../model/orderModel');
const Ledger = require('../../model/ledgerModel');
require('dotenv').config();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// create razorpay order
const createRazorpayOrder = async (req, res) => {
    const { totalAmount, products, shippingAddressId, couponCode, couponDiscount, discount } = req.body;
    try {
        const options = {
            amount: totalAmount * 100, 
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpayInstance.orders.create(options);

        const newOrder = await Order.create({
            userId: req.session.userId,
            products,
            shippingAddress: await Address.findById(shippingAddressId),
            totalAmount,
            paymentMethod: 'Razorpay',
            paymentStatus: 'Failed',
            couponCode,
            couponDiscount,
            discount,
            razorpayOrderId: order.id 
        });

        res.json({ orderId: order.id, key: process.env.RAZORPAY_KEY_ID, amount: options.amount });
    } catch (error) {
        console.log('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Failed to create Razorpay order' });
    }
};
// verifying the initial and retry payments 
const verifyRazorpayPayment = async (req, res) => {
    const userId = req.session.userId;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    try {
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (generatedSignature === razorpay_signature) {
            await Order.updateOne(
                { razorpayOrderId: razorpay_order_id },
                { paymentStatus: 'Paid', status: 'Confirmed' }
            );

            await Ledger.create({
                description: `Payment received for order ${order._id}`,
                amount: order.totalAmount,
                type: 'debit',
                orderId: order._id
            });

            await Cart.findOneAndDelete({ user: userId });
            delete req.session.appliedCouponCode;

            res.json({ success: true, redirectUrl: `/orderSuccess/${order._id}` });
        } else {
            await Order.updateOne(
                { razorpayOrderId: razorpay_order_id },
                { paymentStatus: 'Failed' }
            );
            res.json({ success: false, redirectUrl: '/orders' }); // Redirect to orders page for retry
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
};
// order create retry payments
const retryPayment = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        console.log("orderid", orderId)
        const order = await Order.findById(orderId);
        console.log(order)
        if (order && order.paymentStatus === 'Failed' || order.paymentStatus === 'Pending') {
            res.json({
                success: true,
                orderId: order.razorpayOrderId,
                amount: order.totalAmount * 100, 
                key: process.env.RAZORPAY_KEY_ID
            });
        } else {
            res.json({ success: false, message: 'Order not eligible for retry.' });
        }
    } catch (error) {
        console.error('Error fetching retry payment details:', error);
        res.status(500).json({ success: false, message: 'Error fetching retry payment details' });
    }
};



module.exports = {
    createRazorpayOrder,
    verifyRazorpayPayment,
    retryPayment,

};