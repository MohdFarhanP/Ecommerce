

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

    // Event listener for the submit event
    editOfferForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        // Validate required fields
        const discountType = document.getElementById('editDiscountType').value;
        const discountValue = document.getElementById('editDiscountValue').value;
        const expirationDate = document.getElementById('editExpirationDate').value;

        if (!discountType) {
            showToast('Please select a discount type.', false);
            return;
        }

        if (!discountValue || isNaN(discountValue) || discountValue <= 0) {
            showToast('Please provide a valid discount value.', false);
            return;
        }

        if (!expirationDate) {
            showToast('Please provide a valid expiration date.', false);
            return;
        }

        const formData = new FormData(editOfferForm);

        fetch('/editOffer', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    showToast(data.message, false);
                } else {
                    showToast('Offer edited successfully', true);
                    location.reload(); 
                }
            })
            .catch(error => {
                showToast('An error occurred. Please try again.', false);
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
            const description =this.dataset.description;

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


    // Create Offer Form Submission with Validation
    document.getElementById('createOfferForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        // Collect form data
        const discountType = document.getElementById('discountType').value;
        const discountValue = document.getElementById('discountValue').value;
        const description = document.getElementById('description').value;
        const expirationDate = document.getElementById('expirationDate').value;
        const isActive = document.getElementById('isActive').checked;

        const productCheckboxes = document.querySelectorAll('#applicableProducts input[type="checkbox"]');
        const categoryCheckboxes = document.querySelectorAll('#applicableCategories input[type="checkbox"]');
        const selectedProducts = Array.from(productCheckboxes).filter(checkbox => checkbox.checked);
        const selectedCategories = Array.from(categoryCheckboxes).filter(checkbox => checkbox.checked);

        // Validation logic
        if (!discountType) {
            showToast('Please select a discount type.', false);
            return;
        }

        if (!discountValue || isNaN(discountValue) || discountValue <= 0) {
            showToast('Please provide a valid discount value.', false);
            return;
        }

        if (!description.trim()) {
            showToast('Please provide a description.', false);
            return;
        }

        if (!expirationDate) {
            showToast('Please provide an expiration date.', false);
            return;
        }

        const formData = new FormData(this);

        selectedProducts.forEach(checkbox => {
            formData.append('applicableProducts', checkbox.value);
        });

        selectedCategories.forEach(checkbox => {
            formData.append('applicableCategories', checkbox.value);
        });

        try {
            const response = await fetch('/createOffer', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                showToast(errorData.errors[0].msg, false);
            } else {
                const successData = await response.json();
                showToast(successData.message, true);
                location.reload();
            }
        } catch (error) {
            showToast('Error submitting form. Please try again later.', false);
        }
    });
