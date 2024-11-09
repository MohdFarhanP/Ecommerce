const Ledger = require('../../model/ledgerModel');
const Order = require('../../model/orderModel')

const getledger = async (req, res) => {
    try {
        const entries = await Ledger.find().populate('orderId'); // Populate order details if needed
        res.render('admin/ledger', { entries });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching ledger entries');
    }
};
const getSingleOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
     
        const order = await Order.findById(orderId)
            .populate({
                path: 'userId',
                select: 'userName email',
            })
            .populate({
                path: 'shippingAddress',
                select: 'addressLine city state postalCode country',
            })
            .populate({
                path: 'products.productId',
                select: 'productName price images', 
            });


        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

       
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching order details' });
    }
};

module.exports = {
    getledger,
    getSingleOrder
}