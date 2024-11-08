

const errorToast = document.getElementById('errorToast');
const toastBody = document.getElementById('toastBody');

// Function to display error message on the toast
function showToast(message, success = false) {
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(errorToast);  // use errorToast instead of toastElement
    if (!success) {
        errorToast.classList.remove('bg-success');
        errorToast.classList.add('bg-danger');
    } else {
        errorToast.classList.remove('bg-danger');
        errorToast.classList.add('bg-success');
    }
    toast.show();
}


// Form Validation for Edit Offer

const editButtons = document.querySelectorAll('.edit-offer-button');
const editOfferForm = document.getElementById('editOfferForm');


editOfferForm.addEventListener('submit', function (event) {
    event.preventDefault(); 


    document.getElementById('discountTypeError').innerText = '';
    document.getElementById('discountValueError').innerText = '';
    document.getElementById('expirationDateError').innerText = '';

    const discountType = document.getElementById('editDiscountType').value;
    const discountValue = document.getElementById('editDiscountValue').value;
    const expirationDate = document.getElementById('editExpirationDate').value;

    let isValid = true;

    if (!discountType) {
        document.getElementById('discountTypeError').innerText = 'Please select a discount type.';
        isValid = false;
    }

    if (!discountValue || isNaN(discountValue) || discountValue <= 0) {
        document.getElementById('discountValueError').innerText = 'Please provide a valid discount value.';
        isValid = false;
    }

    if (!expirationDate) {
        document.getElementById('expirationDateError').innerText = 'Please provide a valid expiration date.';
        isValid = false;
    }

    if (!isValid) return;

    const formData = new FormData(editOfferForm);

    fetch('/editOffer', {
        method: 'PATCH',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                document.getElementById('discountTypeError').innerText = data.message; 
            } else {
                location.reload();
            }
        })
        .catch(error => {
            document.getElementById('discountTypeError').innerText = 'An error occurred. Please try again.';
        });
});


// Populate modal with offer data
editButtons.forEach(button => {
    button.addEventListener('click', function () {
        const offerId = this.dataset.id;
        const discountType = this.dataset.discountType;
        const discountValue = this.dataset.discountValue;
        const expirationDate = this.dataset.expirationDate;
        const isActive = this.dataset.isActive === 'true';
        const description = this.dataset.description;

        document.getElementById('editOfferId').value = offerId;
        document.getElementById('editDiscountType').value = discountType;
        document.getElementById('editDiscountValue').value = discountValue;
        document.getElementById('editExpirationDate').value = expirationDate;
        document.getElementById('editIsActive').checked = isActive;
        document.getElementById('editDescription').value = description;
        const editOfferModal = new bootstrap.Modal(document.getElementById('editOfferModal'));
        editOfferModal.show();
    });
});

document.getElementById('createOfferForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Collect form data
    const form = event.target;
    const discountType = document.getElementById('discountType');
    const discountValue = document.getElementById('discountValue');
    const description = document.getElementById('description');
    const expirationDate = document.getElementById('expirationDate');
    const productCheckboxes = document.querySelectorAll('#applicableProducts input[type="checkbox"]');
    const categoryCheckboxes = document.querySelectorAll('#applicableCategories input[type="checkbox"]');
    
    const productSelectionError = document.getElementById('productSelectionError');
    const categorySelectionError = document.getElementById('categorySelectionError');

    let isValid = true;

    // Clear previous error states
    function clearError(element) {
        element.classList.remove('is-invalid');
        const errorDiv = element.nextElementSibling;
        if (errorDiv) errorDiv.style.display = 'none';
    }

    // Show error
    function showError(element, message) {
        element.classList.add('is-invalid');
        const errorDiv = element.nextElementSibling;
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        isValid = false;
    }

    // Reset all previous errors
    clearError(discountType);
    clearError(discountValue);
    clearError(description);
    clearError(expirationDate);
    productSelectionError.style.display = 'none';
    categorySelectionError.style.display = 'none';

    // Validation checks
    if (!discountType.value) {
        showError(discountType, 'Please select a discount type.');
    }

    if (!discountValue.value || isNaN(discountValue.value) || discountValue.value <= 0) {
        showError(discountValue, 'Please provide a valid discount value greater than 0.');
    }

    if (!description.value.trim()) {
        showError(description, 'Please provide a description.');
    }

    if (!expirationDate.value) {
        showError(expirationDate, 'Please provide an expiration date.');
    }

    const anyProductSelected = Array.from(productCheckboxes).some(cb => cb.checked);
    const anyCategorySelected = Array.from(categoryCheckboxes).some(cb => cb.checked);


    if (!isValid) return; 


    const formData = new FormData(form);

    Array.from(productCheckboxes).forEach(checkbox => {
        if (checkbox.checked) formData.append('applicableProducts', checkbox.value);
    });

    Array.from(categoryCheckboxes).forEach(checkbox => {
        if (checkbox.checked) formData.append('applicableCategories', checkbox.value);
    });

    try {
        const response = await fetch('/createOffer', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (!response.ok) {
            showError(form, result.errors[0].msg);
        } else {
            showToast(result.message, true);
            location.reload();
        }
    } catch (error) {
        showToast('Error submitting form. Please try again later.', false);
    }
});
