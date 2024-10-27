    document.addEventListener('DOMContentLoaded', function() {
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


   
    document.getElementById('createCouponForm').addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent form submission

        const form = e.target;
        const errorToast = document.getElementById('errorToast');
        const toastBody = document.getElementById('toastBody');

        // Form fields
        const couponCode = form['code'];
        const discountType = form['discountType'];
        const discountValue = form['discountValue'];
        const minimumCartValue = form['minimumCartValue'];
        const usageLimit = form['usageLimit'];
        const expiryDate = form['expiryDate'];
        const description = form['description'];
        const productCheckboxes = document.querySelectorAll('.product-checkbox');
        const categoryCheckboxes = document.querySelectorAll('.category-checkbox');

        // Function to show the error toast
        function showError(message) {
            toastBody.textContent = message;
            const toast = new bootstrap.Toast(errorToast);
            toast.show();
        }

        // Sequential Validation
        if (!couponCode.value.trim()) {
            showError("Coupon Code is required.");

            return;
        }

        if (!discountType.value) {
            showError("Please select a Discount Type.");
            discountType.focus();
            return;
        }

        if (!discountValue.value || discountValue.value <= 0) {
            showError("Discount Value must be greater than 0.");
            discountValue.focus();
            return;
        }

        if (!minimumCartValue.value || minimumCartValue.value < 0) {
            showError("Minimum Cart Value must be 0 or more.");
            minimumCartValue.focus();
            return;
        }

        if (!usageLimit.value || usageLimit.value <= 0) {
            showError("Usage Limit must be greater than 0.");
            usageLimit.focus();
            return;
        }

        if (!expiryDate.value) {
            showError("Please select an Expiry Date.");
            expiryDate.focus();
            return;
        }
        if (!description.value.trim()) {
            showError("Please Enter description.");

            return;
        }

        const anyProductSelected = Array.from(productCheckboxes).some(checkbox => checkbox.checked);
        const anyCategorySelected = Array.from(categoryCheckboxes).some(checkbox => checkbox.checked);

        // If no errors, submit the form
        try{
            const formData = new FormData(form);

        console.log(...formData); 
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
        console.log("Coupon fetch error: ", err);
        showError('An error occurred, please try again later.');
    }
    });

