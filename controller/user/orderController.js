

const User = require("../../model/userModel");
const path = require('path');
const Products = require('../../model/products');
const Address = require('../../model/addressModel');
const Cart = require('../../model/cartModel');
const Order = require('../../model/orderModel');
const Coupon = require('../../model/coupenModel');
const easyinvoice = require('easyinvoice');
const fs = require('fs');
const WalletTransaction = require('../../model/wlletModel');
const Ledger = require('../../model/ledgerModel');
require('dotenv').config();



// controller for getting the orders
const orders = async (req, res) => {
    const userId = req.session.userId;
    const currentPage = parseInt(req.query.page) || 1;
    const limit = 3;
    try {

        const totalOrders = await Order.countDocuments({ userId });


        const orders = await Order.find({ userId })
            .populate({
                path: 'products.productId',
                select: 'productName images productPrice',
            })
            .populate('shippingAddress')
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * limit)
            .limit(limit)
            .exec();

        const totalPages = Math.ceil(totalOrders / limit);

        res.render('user/orders', {
            orders,
            currentPage,
            totalPages,
            activePage: "orders",
        });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).send('Error fetching orders');
    }
};
// specific orderDetails 
const orderDetails = async (req, res) => {
    try {
        const { orderId, productId } = req.params;

        const order = await Order.findOne({ _id: orderId })
            .populate({
                path: 'products.productId',
                select: 'productName images productPrice'
            })
            .populate('shippingAddress')
            .exec();

        const product = order.products.find(p => p.productId._id.toString() === productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.render('user/orderDetails', { order, product });
    } catch (err) {
        console.error('Error fetching product details:', err);
        res.status(500).send('Error fetching product details');
    }
};
// controller for cancel products
const cancelProduct = async (req, res) => {
    try {
        const { orderId, productId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }

        const productToCancel = order.products.find(product => product.productId.toString() === productId);
        if (!productToCancel) {
            return res.status(404).send('Product not found in the order');
        }

        if (productToCancel.status === 'Cancelled') {
            return res.status(400).send('Product is already canceled');
        }

        // Update product status to 'Cancelled'
        const uptOrder = await Order.updateOne(
            { _id: orderId, "products.productId": productId, 'products.status': { $in: ['Pending', 'Confirmed'] } },
            { $set: { "products.$.status": 'Cancelled' } }
        );

        // Update stock and maximum quantity
        const product = await Products.findById(productId);
        const newStock = product.productStock + productToCancel.quantity;
        const newMaxQty = Math.min(Math.floor(newStock / 3), 10);
        await Products.updateOne(
            { _id: productId },
            {
                $inc: { productStock: productToCancel.quantity },
                $set: { maxQtyPerPerson: newMaxQty },
            }
        );

        // Handle refund for non-COD payments
        if (order.paymentMethod !== 'COD') {
            const refundAmount = productToCancel.price;

            const user = await User.findById(order.userId);
            user.walletBalance += refundAmount;
            await user.save();

            const prod = await Products.findOne({ _id: productId });

            await WalletTransaction.create({
                userId: order.userId,
                amount: refundAmount,
                transactionType: 'Credit',
                description: `Refund for canceled product ${prod.productName}`
            });
        }

        // Create ledger entry for the canceled product
        const ledgerEntryDescription = `Product canceled from order ${orderId} - ${product.productName}`;
        const ledgerAmount = productToCancel.price; // You can adjust this based on how you want to track it
        await Ledger.create({
            description: ledgerEntryDescription,
            amount: ledgerAmount,
            type: 'credit', // Assuming credit for the cancellation
            orderId: orderId // Reference to the order if needed
        });

        // Check if all products are canceled
        const updatedOrder = await Order.findById(orderId);
        const allProductsCancelled = updatedOrder.products.every(product => product.status === 'Cancelled');

        if (allProductsCancelled) {
            updatedOrder.status = 'Cancelled';
            await updatedOrder.save();
        }

        res.redirect('/orders');

    } catch (err) {
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
        res.status(500).send('Error canceling product');
    }
};
// controller for return products
const returnProduct = async (req, res) => {
    const { orderId, productId } = req.body;

    try {
        const updatedOrder = await Order.updateOne(
            { _id: orderId, 'products.productId': productId, 'products.status': 'Delivered' },
            { $set: { 'products.$.status': 'Returned' } }
        );

        if (updatedOrder.modifiedCount > 0) {

            const productToReturn = await Products.findById(productId);
            const refundAmount = productToReturn.productPrice;

            await Products.updateOne(
                { _id: productId },
                { $inc: { productStock: 1 }, $set: { maxQtyPerPerson: Math.min(Math.floor((productToReturn.productStock + 1) / 3), 10) } } // Adjust maxQtyPerPerson if needed
            );


            const order = await Order.findById(orderId);
            if (order.paymentMethod !== 'COD') {
                const user = await User.findById(order.userId);
                user.walletBalance += refundAmount;
                console.log(user.walletBalance, order.userId);
                await user.save();

                await WalletTransaction.create({
                    userId: order.userId,
                    amount: refundAmount,
                    transactionType: 'Credit',
                    description: `Refund for returned product ${productToReturn.productName} from order ${orderId}`
                });
            }
            const product = order.products.find(
                item => item.productId.toString() === productToReturnId.toString()
            );

            if (product) {
                product.status = "Returned";
                await order.save();
            }


            await Ledger.create({
                description: `Product returned from order ${orderId} - ${productToReturn.productName}`,
                amount: refundAmount,
                type: 'credit',
                orderId: orderId
            });

            res.redirect('/orders');
        } else {
            res.status(400).send('Return not allowed before delivery.');
        }
    } catch (error) {
        console.error('Error returning product:', error);
        res.status(500).send('Could not return the product');
    }
};
// controller for palce order by COD and Wallet
const placeOrder = async (req, res) => {

    const userId = req.session.userId;
    const { shippingAddressId, products, totalAmount, paymentMethod, discount, couponCode, couponDiscount } = req.body;

    try {
        if (paymentMethod === 'Wallet') {

            const user = await User.findById(userId);

            if (user.walletBalance >= totalAmount) {

                user.walletBalance -= totalAmount;
                await user.save();
                const shippingAddress = await Address.findById(shippingAddressId);

                const newOrder = new Order({
                    userId,
                    products,
                    shippingAddress: {
                        firstName: shippingAddress.firstName,
                        lastName: shippingAddress.lastName,
                        email: shippingAddress.email,
                        mobile: shippingAddress.mobile,
                        addressLine: shippingAddress.addressLine,
                        city: shippingAddress.city,
                        pinCode: shippingAddress.pinCode,
                        country: shippingAddress.country,
                    },
                    totalAmount,
                    paymentMethod,
                    paymentStatus: 'Paid',
                    status: 'Confirmed',
                    deliveryDate: new Date(new Date().setDate(new Date().getDate() + 5)),
                    discount,
                    couponCode,
                    couponDiscount
                });

                await newOrder.save();

                await WalletTransaction.create({
                    userId: userId,
                    amount: totalAmount,
                    transactionType: 'Debit',
                    description: `Payment for order `
                });


                await Ledger.create({
                    description: `Payment received for order ${newOrder._id}`,
                    amount: totalAmount,
                    type: 'debit',
                    orderId: newOrder._id
                });

                await Cart.findOneAndDelete({ user: userId });
                delete req.session.appliedCouponCode;

                res.redirect(`/orderSuccess/${newOrder._id}`);

            } else {

                res.status(400).send("Insufficient Wallet Balance");
            }
        } else {

            const randomDays = Math.floor(Math.random() * 8) + 3;
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + randomDays);

            const shippingAddress = await Address.findById(shippingAddressId);

            const newOrder = new Order({
                userId,
                products,
                shippingAddress: {
                    firstName: shippingAddress.firstName,
                    lastName: shippingAddress.lastName,
                    email: shippingAddress.email,
                    mobile: shippingAddress.mobile,
                    addressLine: shippingAddress.addressLine,
                    city: shippingAddress.city,
                    pinCode: shippingAddress.pinCode,
                    country: shippingAddress.country,
                },
                totalAmount,
                paymentMethod: paymentMethod || "COD",
                paymentStatus: 'Pending',
                status: 'Confirmed',
                deliveryDate,
                discount,
                couponCode,
                couponDiscount
            });
            await newOrder.save();

            await Cart.findOneAndDelete({ user: userId });
            delete req.session.appliedCouponCode;

            await Ledger.create({
                description: `Order placed (COD) ${newOrder._id}`,
                amount: totalAmount,
                type: 'credit',
                orderId: newOrder._id
            });
            res.redirect(`/orderSuccess/${newOrder._id}`);
        }
    } catch (err) {
        console.log(err);

    }
};
// order success page
const orderSuccess = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const order = await Order.findById(orderId).populate('products.productId').populate('shippingAddress').lean();

        if (!order) {
            return res.status(404).send('Order not found');
        }

        res.render('user/orderSuccess', {
            order
        });
    } catch (err) {
        console.error('Error loading order success page:', err);
        res.status(500).send('Server error');
    }
};
// controller for download invoice
const downloadInvoice = async (req, res) => {
    try {
        console.log('Order ID:', req.params.orderId);
        const tmpDir = './tmp';
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir);
        }


        const order = await Order.findById(req.params.orderId).populate('products.productId');
        if (!order) {
            return res.status(404).send('Order not found');
        }

        const logoPath = path.join(__dirname, '../../', 'public', 'image', 'user', 'WATCH.png');


        const data = {
            client: {
                company: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
                address: order.shippingAddress.addressLine,
                zip: order.shippingAddress.pinCode,
                city: order.shippingAddress.city,
                country: order.shippingAddress.country
            },
            sender: {
                company: "WATCHLY",
                address: "Bangelore,Karnataka",
                zip: "4587631",
                city: "Bangelre city",
                country: "India"
            },
            images: {
                logo: fs.readFileSync(logoPath, 'base64'),
            },
            information: {
                number: order._id.toString(),
                date: new Date(order.createdAt).toLocaleDateString(),
                "due-date": new Date(order.deliveryDate).toLocaleDateString()
            },
            products: order.products.map(item => ({
                quantity: item.quantity,
                description: item.productId.productName,
                "tax-rate": 0,
                price: item.price
            })),
            bottomNotice: "Thank you for shopping with WATCHLY!",
            settings: {
                currency: "INR",
            },
        };


        easyinvoice.createInvoice(data, (result) => {
            if (result.pdf) {
                const filePath = path.join(tmpDir, `invoice_${req.params.orderId}.pdf`);
                fs.writeFileSync(filePath, result.pdf, 'base64');


                res.download(filePath, 'invoice.pdf', (err) => {
                    if (err) {
                        console.error('Error downloading invoice:', err);
                        return res.status(500).send('Error downloading invoice');
                    }
                    fs.unlinkSync(filePath);
                });
            } else {
                console.error('Invoice creation failed:', result);
                res.status(500).send('Error generating invoice');
            }
        });
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).send('Error generating invoice');
    }
};
// checkout page 
const checkout = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);

        let cartItems = [];
        let subTotal = 0;

        if (req.body.buy) {
            const productId = req.body.productId;
            const quantity = parseInt(req.body.quantity, 10) || 1;

            const product = await Products.findById(productId);
            if (!product) {
                return res.status(404).send('Product not found');
            }

            const productPrice = product.discountPrice || product.productPrice;
            const itemTotal = quantity * productPrice;

            cartItems = [{ product, quantity, itemTotal }];
            subTotal = itemTotal;
        } else {

            const cart = await Cart.findOne({ user: userId }).populate('items.product');
            if (!cart || cart.items.length === 0) {
                return res.redirect('/cart');
            }


            cartItems = cart.items.map(item => {
                const productPrice = item.product.discountPrice || item.product.productPrice;
                return {
                    product: item.product,
                    quantity: item.quantity,
                    itemTotal: item.quantity * productPrice
                };
            });

            subTotal = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);
        }


        const shippingCharge = 100;
        const deliveryCharge = 50;
        let grandTotal = subTotal + shippingCharge + deliveryCharge;

        const appliedCouponCode = req.session.appliedCouponCode || null;
        let couponDiscountAmount = 0;

        if (appliedCouponCode) {
            const coupon = await Coupon.findOne({ code: appliedCouponCode });
            if (coupon) {
                couponDiscountAmount = coupon.discountType === 'percentage'
                    ? (subTotal * coupon.discountValue) / 100
                    : coupon.discountValue;
            }
        }

        let referralDiscountAmount = 0;
        let appliedReferralCode = req.session.appliedReferralCode || null;

        if (user.isFirstPurchase && appliedReferralCode) {
            referralDiscountAmount = 30;
        }

        let finalTotal = grandTotal - couponDiscountAmount - referralDiscountAmount;
        finalTotal = Math.max(0, finalTotal);

        const userAddresses = await Address.find({ user: userId });

        res.render('user/checkout', {
            cartItems,
            subTotal,
            shippingCharge,
            grandTotal: finalTotal,
            appliedCouponCode,
            couponDiscountAmount,
            appliedReferralCode,
            referralDiscountAmount,
            userAddresses,
            deliveryCharge,
            razorpayKey: process.env.RAZORPAY_KEY_ID,
            userEmail: user.email
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};




module.exports = {
    orders,
    orderDetails,
    cancelProduct,
    returnProduct,
    placeOrder,
    orderSuccess,
    downloadInvoice,
    checkout
};

