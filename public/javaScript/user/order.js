// Frontend code
document.addEventListener('DOMContentLoaded', () => {
    const retryButtons = document.querySelectorAll('#retryPaymentButton');

    retryButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const orderId = e.target.dataset.orderId;
            try {
                const response = await fetch(`/retryPayment/${orderId}`);
                const data = await response.json();
                
                if (data.success) {
                    const options = {
                        key: data.key,
                        amount: data.amount,
                        currency: 'INR',
                        order_id: data.orderId,
                        name: 'Watchly',
                        description: 'Thank you for ordering',
                        handler: async function (response) {
                            const paymentDetails = {
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature,
                                orderId: orderId
                            };

                            const verificationResponse = await fetch('/verifyPayment', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(paymentDetails)
                            });

                            const verificationData = await verificationResponse.json();
                            if (verificationData.success) {
                                window.location.href = `/orderSuccess/${data.orderId}`;
                            } else {
                                alert('Payment verification failed. Please try again.');
                                window.location.href = `/orders`;
                            }
                        },
                        prefill: {
                            name: 'User Name',
                            email: 'user@example.com',
                            contact: '1234567890'
                        },
                        notes: {
                            address: 'Your Store Address'
                        },
                        theme: {
                            color: '#F37254'
                        }
                    };

                    const razorpay = new Razorpay(options);
                    razorpay.open();
                } else {
                    alert('Failed to fetch payment details. Please try again.');
                }
            } catch (error) {
                console.error('Error initiating retry payment:', error);
                alert('Something went wrong. Please try again later.');
            }
        });
    });
});

// Backend code for verifyPayment
const verifyPayment = async (req, res) => {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        if (generatedSignature === razorpaySignature) {
            order.paymentStatus = 'Paid';
            order.status = 'Confirmed';
            await order.save();
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, message: 'Error verifying payment' });
    }
};
