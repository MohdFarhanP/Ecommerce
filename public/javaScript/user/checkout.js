let phone

function getProductsFromDOM() {
    const products = [];
    document.querySelectorAll('[name^="products"]').forEach((input) => {
        const match = input.name.match(/products\[(\d+)\]\[(\w+)\]/);
        if (match) {
            const index = match[1];
            const key = match[2];
            if (!products[index]) products[index] = {};
            products[index][key] = input.value;
        }
    });
    return products;
}


// selecting the defult address 

function selectCard(selectedCard) {
    const cards = document.querySelectorAll('.address-card');
    cards.forEach(card => card.classList.remove('selected'));
    selectedCard.classList.add('selected');
    // get addressId and phone number
    const addressId = selectedCard.getAttribute('data-address-id');
    document.getElementById('selectedAddress').value = addressId;
    const phoneNumber = selectedCard.getAttribute('data-phone');
    phone = phoneNumber;

}
// edit address
function populateEditModal(id, firstName, lastName, email, mobile, addressLine, city, pinCode, country) {
    document.querySelector('#editAddress input[name="firstName"]').value = firstName;
    document.querySelector('#editAddress input[name="lastName"]').value = lastName;
    document.querySelector('#editAddress input[name="email"]').value = email;
    document.querySelector('#editAddress input[name="mobile"]').value = mobile;
    document.querySelector('#editAddress input[name="addressLine"]').value = addressLine;
    document.querySelector('#editAddress input[name="city"]').value = city;
    document.querySelector('#editAddress input[name="pinCode"]').value = pinCode;

    const countrySelect = document.querySelector('#editAddress select[name="country"]');
    for (let i = 0; i < countrySelect.options.length; i++) {
        if (countrySelect.options[i].text === country) {
            countrySelect.selectedIndex = i;
            break;
        }
    }

    document.querySelector('#editAddress form').action = `/editAddress/${id}`;
}


document.getElementById('checkoutForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const selectedAddressId = document.getElementById('selectedAddress').value;
    if (!selectedAddressId) {
        alert('Please select a shipping address.');
        return;
    }

    const userEmail = document.getElementById('userEmail').value;
    const razorpayKey = document.getElementById('razorpayKey').value;
    const products = getProductsFromDOM();
    const couponCode = document.getElementById('couponCode')?.value || null;
    const couponDiscount = parseFloat(document.getElementById('couponDiscount')?.value) || 0;
    const discount = parseFloat(document.getElementById('discount')?.value) || 0;


    const selectedPayment = document.querySelector('input[name="paymentOption"]:checked').value;
    document.getElementById('selectedPaymentMethod').value = selectedPayment;

    if (selectedPayment === 'Razorpay') {
        // Call backend to create a Razorpay order
        const totalAmount = document.querySelector('input[name="totalAmount"]').value;
        console.log(totalAmount);

        const response = await fetch('/create-razorpay-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: totalAmount })
        });

        const orderData = await response.json();

        if (orderData.success) {
            // Initialize Razorpay payment
            const options = {
                key: razorpayKey,
                amount: orderData.order.amount,
                currency: "INR",
                order_id: orderData.order.id,
                handler: function (response) {
                    // Pass Razorpay response to backend for verification
                    verifyRazorpayPayment(response, selectedAddressId, selectedPayment, totalAmount, products, couponCode, couponDiscount, discount);
                },
                prefill: {
                    email: userEmail,
                    contact: phone,
                },
                theme: { color: "#F37254" }
            };

            const razorpay = new Razorpay(options);
            razorpay.open();
        }
    } else {
        // For COD or Wallet, proceed with form submission
        this.submit();
    }
});

async function verifyRazorpayPayment(response, shippingAddressId, paymentMethod, totalAmount, products, couponCode, couponDiscount, discount) {
    const verificationData = {
        order_id: response.razorpay_order_id,
        payment_id: response.razorpay_payment_id,
        signature: response.razorpay_signature,
        selectedAddressId: shippingAddressId,
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        products: products,
        couponCode: couponCode,
        couponDiscount: couponDiscount,
        discount: discount

    };

    const verificationResponse = await fetch('/verify-razorpay-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData)
    });

    const verificationResult = await verificationResponse.json();
    if (verificationResult.success) {
        window.location.href = `/orderSuccess/${verificationResult.orderId}`;
    } else {
        if (!verificationResult.success)
            alert(verificationResult.message);
    }
}
