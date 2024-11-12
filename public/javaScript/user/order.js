// retry payment creation and verify 
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
                            const verificationResponse = await fetch('/verifyRazorpayPayment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature
                                })
                            });

                            const verificationData = await verificationResponse.json();
                            if (verificationData.success) {
                                window.location.href = verificationData.redirectUrl;
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
                        theme: { color: '#F37254' }
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
