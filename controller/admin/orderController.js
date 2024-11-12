
const Order = require('../../model/orderModel');



// Function to retrieve and display orders based on filters
const orders = async (req, res) => {
    const { filter } = req.query;

    try {
        let query = Order.find()
            .populate('userId', 'userName')
            .populate('shippingAddress', 'addressLine city state postalCode country')
            .populate('products.productId', 'productName');

        if (filter === '1') {
            query = query.sort({ createdAt: -1 });
        } else if (filter === '2') {
            query = query.sort({ 'userId.userName': 1 });
        }

        const orders = await query.exec();

        res.render('admin/order', {
            orders,
            activePage: 'orders',
            filter
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
// Function to cancel an order and delete it
const cancelOrder = async (req, res) => {
    const { orderId } = req.body;

    try {
        const order = await Order.findById(orderId);


        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await Order.findByIdAndDelete(orderId);
        res.redirect('/ordersList');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

module.exports = {
    orders,
    cancelOrder
};