function selectCard(selectedCard) {
    const cards = document.querySelectorAll('.address-card');
    cards.forEach(card => card.classList.remove('selected'));
    selectedCard.classList.add('selected');

    const addressId = selectedCard.getAttribute('data-address-id');
    document.getElementById('selectedAddress').value = addressId;
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

    document.querySelector('#editAddress form').action = `/user/editAddress/${id}`;
}



document.getElementById('checkoutForm').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const selectedAddress = document.getElementById('selectedAddress').value;
    if (!selectedAddress) {
        alert('Please select a shipping address.'); 
        return; 
    }

    const selectedPayment = document.querySelector('input[name="paymentOption"]:checked').value;
    document.getElementById('selectedPaymentMethod').value = selectedPayment;

    this.submit();
});