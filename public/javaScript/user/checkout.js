
let phone
// get the products
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

    const addressId = selectedCard.getAttribute('data-address-id');
    document.getElementById('selectedAddress').value = addressId;
    const phoneNumber = selectedCard.getAttribute('data-phone');
    phone = phoneNumber;

}
// Edit address
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

    // function to show error
    function showError(input, message) {
        const errorElement = input.nextElementSibling;
        errorElement.textContent = message;
        input.classList.add('is-invalid');
    }

    // function to show success
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


// checkout form
document.getElementById('checkoutForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const selectedAddressId = document.getElementById('selectedAddress').value;
    if (!selectedAddressId) {
        alert('Please select a shipping address.');
        return;
    }

    const userEmail = document.getElementById('userEmail').value;
    const products = getProductsFromDOM();
    const couponCode = document.getElementById('couponCode')?.value || null;
    const couponDiscount = parseFloat(document.getElementById('couponDiscount')?.value) || 0;
    const discount = parseFloat(document.getElementById('discount')?.value) || 0;


    const paymentMethod = document.querySelector('input[name="paymentOption"]:checked').value;
    document.getElementById('selectedPaymentMethod').value = paymentMethod;

    const totalAmount = document.querySelector('input[name="totalAmount"]').value;
    console.log(totalAmount);
    // create payment using razorpay
    if (paymentMethod === 'Razorpay') {
        try {
            const response = await fetch('/createRazorpayOrder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    totalAmount: totalAmount,
                    products: products,
                    shippingAddressId: selectedAddressId,
                    couponCode: couponCode ?? '',
                    couponDiscount: couponDiscount,
                    discount: discount
                })
            });

            const { orderId, key, amount } = await response.json();
            console.log(orderId, key, amount)
            const options = {
                key,
                amount,
                currency: "INR",
                order_id: orderId,
                handler: function (response) {

                    verifyRazorpayPayment(response);
                },
                prefill: {
                    email: userEmail,
                    contact: phone
                },
                modal: {
                    ondismiss: function () {
                        window.location.href = '/orders';
                    }
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Razorpay order creation failed:", error);
        }
    } else {
        if (paymentMethod === 'COD' && totalAmount > 1000) {
            return showError('above 1000 rupees product cant buy using cash on delevery ');
        }
        this.submit();
    }

});

// verify razorpayment 
function verifyRazorpayPayment(response) {
    fetch('/verifyRazorpayPayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...response })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.redirectUrl;
            } else {
                if (rzp) {
                    rzp.close();
                }
                window.location.href = '/orders';  // Redirect to order page for retry
            }
        })
        .catch(err => {
            console.error("Payment verification failed:", err);
            if (rzp) {
                rzp.close();
            }
        });
}


// show error
function showError(message) {
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(errorToast);
    toast.show();
    setTimeout(() => {
        toast.hide();
    }, 3000);
}

