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

    document.querySelector('#editAddress form').action = `/editAddress/${id}?_method=PUT`;
}


document.addEventListener('DOMContentLoaded', function () {

    // Edit Address validation 
    const form = document.getElementById('editAddressForm');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const mobile = document.getElementById('mobile');
    const addressLine = document.getElementById('addressLine');
    const city = document.getElementById('city');
    const pinCode = document.getElementById('pinCode');
    const country = document.getElementById('country');

    // Helper function to show error
    function showError(input, message) {
        const errorElement = input.nextElementSibling;
        errorElement.textContent = message;
        input.classList.add('is-invalid');
    }

    // Helper function to show success
    function showSuccess(input) {
        const errorElement = input.nextElementSibling;
        errorElement.textContent = '';
        input.classList.remove('is-invalid');
    }

    // Validate functions
    function validateNotEmpty(input, fieldName) {
        if (input.value.trim() === '') {
            showError(input, `${fieldName} is required.`);
            return false;
        } else {
            showSuccess(input);
            return true;
        }
    }

    function validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
            showError(input, 'Please enter a valid email address.');
            return false;
        } else {
            showSuccess(input);
            return true;
        }
    }

    function validateMobile(input) {
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(input.value.trim())) {
            showError(input, 'Please enter a valid 10-digit mobile number.');
            return false;
        } else {
            showSuccess(input);
            return true;
        }
    }

    function validatePinCode(input) {
        const pinCodeRegex = /^[0-9]{5,6}$/;
        if (!pinCodeRegex.test(input.value.trim())) {
            showError(input, 'Please enter a valid 5 or 6-digit pin code.');
            return false;
        } else {
            showSuccess(input);
            return true;
        }
    }

    // Event listeners for inline validation
    firstName.addEventListener('input', () => validateNotEmpty(firstName, 'First Name'));
    lastName.addEventListener('input', () => validateNotEmpty(lastName, 'Last Name'));
    email.addEventListener('input', () => validateEmail(email));
    mobile.addEventListener('input', () => validateMobile(mobile));
    addressLine.addEventListener('input', () => validateNotEmpty(addressLine, 'Address'));
    city.addEventListener('input', () => validateNotEmpty(city, 'City'));
    pinCode.addEventListener('input', () => validatePinCode(pinCode));
    country.addEventListener('change', () => validateNotEmpty(country, 'Country'));

    // Form submission validation
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const isValid =
            validateNotEmpty(firstName, 'First Name') &&
            validateNotEmpty(lastName, 'Last Name') &&
            validateEmail(email) &&
            validateMobile(mobile) &&
            validateNotEmpty(addressLine, 'Address') &&
            validateNotEmpty(city, 'City') &&
            validatePinCode(pinCode) &&
            validateNotEmpty(country, 'Country');

        if (isValid) {
            form.submit();
        }
    });

    // Add Address Form Validation 
    const addAddressForm = document.querySelector('form[action="/addAddress"]');
    const addFirstName = addAddressForm.querySelector('input[name="firstName"]');
    const addLastName = addAddressForm.querySelector('input[name="lastName"]');
    const addEmail = addAddressForm.querySelector('input[name="email"]');
    const addMobile = addAddressForm.querySelector('input[name="mobile"]');
    const addAddressLine = addAddressForm.querySelector('input[name="addressLine"]');
    const addCity = addAddressForm.querySelector('input[name="city"]');
    const addPinCode = addAddressForm.querySelector('input[name="pinCode"]');
    const addCountry = addAddressForm.querySelector('select[name="country"]');

    // Event listeners for inline validation
    addFirstName.addEventListener('input', () => validateNotEmpty(addFirstName, 'First Name'));
    addLastName.addEventListener('input', () => validateNotEmpty(addLastName, 'Last Name'));
    addEmail.addEventListener('input', () => validateEmail(addEmail));
    addMobile.addEventListener('input', () => validateMobile(addMobile));
    addAddressLine.addEventListener('input', () => validateNotEmpty(addAddressLine, 'Address'));
    addCity.addEventListener('input', () => validateNotEmpty(addCity, 'City'));
    addPinCode.addEventListener('input', () => validatePinCode(addPinCode));
    addCountry.addEventListener('change', () => validateNotEmpty(addCountry, 'Country'));

    // Form submission validation for Add Address
    addAddressForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const isFormValid =
            validateNotEmpty(addFirstName, 'First Name') &&
            validateNotEmpty(addLastName, 'Last Name') &&
            validateEmail(addEmail) &&
            validateMobile(addMobile) &&
            validateNotEmpty(addAddressLine, 'Address') &&
            validateNotEmpty(addCity, 'City') &&
            validatePinCode(addPinCode) &&
            validateNotEmpty(addCountry, 'Country');

        if (isFormValid) {
            addAddressForm.submit();
        }
    });

});


document.getElementById('checkoutForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const selectedAddressId = document.getElementById('selectedAddress').value;
    if (!selectedAddressId) {
        showError('Please select a shipping address.');
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
   
    const totalAmount = document.querySelector('input[name="totalAmount"]').value;
    console.log(totalAmount);

    if (selectedPayment === 'COD' && totalAmount > 10000) {
        showError('Cash on Delivery is not available for orders above ₹10000.');
        return; // Stop form submission
    }

    if (selectedPayment === 'Razorpay') {
        // Call backend to create a Razorpay order


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

async function verifyRazorpayPayment(response, selectedAddressId, paymentMethod, totalAmount, products, couponCode, couponDiscount, discount) {
    console.log(selectedAddressId);

    const verificationData = {
        order_id: response.razorpay_order_id,
        payment_id: response.razorpay_payment_id,
        signature: response.razorpay_signature,
        selectedAddressId: selectedAddressId,
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
            showError(verificationResult.message);
    }
}

function showError(message) {
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(errorToast);
    toast.show();
    setTimeout(() => {
        toast.hide();
    }, 3000);
}