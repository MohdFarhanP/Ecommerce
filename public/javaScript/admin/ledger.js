// for seeing the orders on the ledger
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.order-link').forEach(link => {
        link.addEventListener('click', async (event) => {
            const orderId = event.target.dataset.orderId;

            try {
                const response = await fetch(`/order/${orderId}`);
                const order = await response.json();

                const modalContent = `
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Total Amount:</strong> ${order.totalAmount}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Products:</strong></p>
                    <ul>
                        ${order.products.map(product => `
                            <li>
                                <img src="${product.productId.images[0]}" alt="${product.productId.productName}" style="width: 50px; height: 50px; margin-right: 10px;">
                                ${product.productId.productName} - Quantity: ${product.quantity}
                            </li>
                        `).join('')}
                    </ul>
                `;

                document.getElementById('modalOrderDetails').innerHTML = modalContent;

                // Show the modal using Bootstrap's modal methods
                const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
                modal.show();
            } catch (error) {
                console.error('Error fetching order details:', error);
            }
        });
    });
});
