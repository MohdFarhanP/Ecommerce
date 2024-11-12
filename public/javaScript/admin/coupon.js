document.addEventListener('DOMContentLoaded', function () {
    // Function to update selected items
    function updateSelectedItems(checkboxClass, displayContainerId) {
        const checkboxes = document.querySelectorAll(checkboxClass);
        const displayContainer = document.getElementById(displayContainerId);
        const selectedItems = [];

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedItems.push(checkbox.nextElementSibling.textContent);
            }
        });

        displayContainer.innerHTML = selectedItems.length > 0
            ? `<strong>Selected:</strong> ${selectedItems.join(', ')}`
            : '<em>No items selected</em>';
    }

    // Event listeners for product checkboxes
    document.querySelectorAll('.product-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateSelectedItems('.product-checkbox', 'selectedProductsContainer');
        });
    });

    // Event listeners for category checkboxes
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateSelectedItems('.category-checkbox', 'selectedCategoriesContainer');
        });
    });
});


// validating and submitting the form validation 
document.getElementById('createCouponForm').addEventListener('submit', async function (e) {
    e.preventDefault(); 

    const form = e.target;

    const fields = [
        { element: form['code'], error: 'Coupon Code is required.' },
        { element: form['discountType'], error: 'Please select a Discount Type.' },
        { element: form['discountValue'], error: 'Discount Value must be greater than 0.', min: 1 },
        { element: form['minimumCartValue'], error: 'Minimum Cart Value must be 0 or more.', min: 0 },
        { element: form['usageLimit'], error: 'Usage Limit must be greater than 0.', min: 1 },
        { element: form['expiryDate'], error: 'Please select an Expiry Date.' },
        { element: form['description'], error: 'Description is required.' }
    ];


    let isValid = true;
    fields.forEach(({ element, error, min }) => {
        clearError(element);
        const value = element.value.trim();
        if (!value || (min !== undefined && +value < min)) {
            setError(element, error);
            isValid = false;
        }
    });

    const anyProductSelected = Array.from(document.querySelectorAll('.product-checkbox')).some(cb => cb.checked);
    const anyCategorySelected = Array.from(document.querySelectorAll('.category-checkbox')).some(cb => cb.checked);

    if (!isValid) return;


    try {
        const formData = new FormData(form);
        const response = await fetch('/createCoupon', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();

        if (!result.success) {
            showError(result.message);
        } else {
            console.log('Coupon created successfully');
            const modal = bootstrap.Modal.getInstance(document.getElementById('couponModal'));
            modal.hide();
            location.reload();
        }
    } catch (err) {
        console.error("Coupon fetch error: ", err);
        showError('An error occurred, please try again later.');
    }
});


// toast for show Error
function showError(message) {
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(errorToast);
    toast.show();
}
// Function to set error message
function setError(element, message) {
    element.classList.add('is-invalid');
    const errorDiv = element.nextElementSibling;
    if (errorDiv) {
        errorDiv.classList.add('invalid-feedback');
        errorDiv.textContent = message;
    }
}
// Function to clear error message
function clearError(element) {
    element.classList.remove('is-invalid');
    const errorDiv = element.nextElementSibling;
    if (errorDiv) {
        errorDiv.textContent = '';
    }
}
