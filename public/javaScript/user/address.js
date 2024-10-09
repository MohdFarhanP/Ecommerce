
// set default address

function selectCard(card, addressId) {
    document.querySelectorAll('.card').forEach((item) => {
        item.classList.remove("active")
    });

    card.classList.add("active");

    fetch('/user/setDefaultAddress', {
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

    document.querySelector('#editAddress form').action = `/user/editAddress/${id}`;
}
function setDeleteAddress(addressId){

    document.getElementById('deleteAddressForm').action = `/user/deleteAddress/${addressId}`;

}