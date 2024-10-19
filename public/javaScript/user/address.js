
// set default address

function selectCard(card, addressId) {
    document.querySelectorAll('.card').forEach((item) => {
        item.classList.remove("active")
    });

    card.classList.add("active");

    fetch('/setDefaultAddress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addressId: addressId }),
    })

    .then( res => {
        
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        
        res.json()

    }).then( data => {

        if (data.success) {
            Swal.fire({
                icon: "success",
                title: 'Default address updated successfully',
            });

        } else {
            
            Swal.fire({
                icon: "error",
                title: 'Error updating default address',
            });

        }
    })
    .catch(err => {
        
        console.error(err);

    });
} 
// for edit part  

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
function setDeleteAddress(addressId){

    document.getElementById('deleteAddressForm').action = `/deleteAddress/${addressId}`;

}



document.getElementById('editForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const isValid = validateAddressForm(event.target);
    if (isValid) {
        event.target.submit();
    }
});
document.getElementById('addForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const isValid = validateAddressForm(event.target);
    if (isValid) {
        event.target.submit();
    }
});

// Unified validation function for both forms
function validateAddressForm(form) {
    const inputs = [
        { name: "firstName", message: "First name is required" },
        { name: "lastName", message: "Last name is required" },
        { name: "email", message: "A valid email is required", validate: validateEmail },
        { name: "mobile", message: "A valid mobile number is required", validate: validateMobile },
        { name: "addressLine", message: "Address is required" },
        { name: "city", message: "City is required" },
        { name: "pinCode", message: "A valid pin code is required", validate: validatePinCode },
        { name: "country", message: "Please select a country", check: (value) => value !== "Select the Country" }
    ];

    for (const input of inputs) {
        const inputValue = form.querySelector(`input[name="${input.name}"]`)?.value.trim() || 
                           form.querySelector(`select[name="${input.name}"]`)?.value || '';
    
        console.log(inputValue); 
        
        if (!inputValue || (input.validate && !input.validate(inputValue)) || (input.check && !input.check(inputValue))) {
            Swal.fire('Error', input.message, 'error');
            form.querySelector(`input[name="${input.name}"], select[name="${input.name}"]`).focus();
            return false;
        }
    }

    return true; 
}
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validateMobile(mobile) {
    const regex = /^[0-9]{10,15}$/;
    return regex.test(mobile);
}

function validatePinCode(pinCode) {
    const regex = /^[0-9]{6}$/; 
    return regex.test(pinCode);
}