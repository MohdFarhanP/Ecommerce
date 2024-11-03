document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('passwordForm').addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form submission for validation

        // Clear previous error messages
        clearErrorMessages();

        // Validate form inputs
        const oldPassword = document.getElementById('oldPassword').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        let isValid = true;

        // Validate old password
        if (!oldPassword) {
            document.getElementById('oldPasswordError').textContent = 'Old password is required.';
            document.getElementById('oldPasswordError').style.display = 'block';
            isValid = false;
        }

        // Validate new password
        if (!newPassword) {
            document.getElementById('newPasswordError').textContent = 'New password is required.';
            document.getElementById('newPasswordError').style.display = 'block';
            isValid = false;
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
            document.getElementById('newPasswordError').textContent = 'At least 8 characters one uppercase letter and one number.';
            document.getElementById('newPasswordError').style.display = 'block';
            isValid = false;
        }

        // Validate confirm password
        if (!confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Please confirm your password.';
            document.getElementById('confirmPasswordError').style.display = 'block';
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'The passwords do not match. Please try again.';
            document.getElementById('confirmPasswordError').style.display = 'block';
            isValid = false;
        }

        // If all validations pass, submit the form
        if (isValid) {
            event.target.submit();
        }
    });

    // Function to show toast messages (both error and success)
    function showToast(message, type) {
        const toastBody = document.getElementById('toastBody');
        const errorToast = document.getElementById('errorToast');

        toastBody.textContent = message;

        if (type === 'error') {
            errorToast.classList.remove("bg-success");
            errorToast.classList.add("bg-danger");
        }else{
            errorToast.classList.remove("bg-danger");
            errorToast.classList.add("bg-success");
        }

        const toast = new bootstrap.Toast(errorToast);
        toast.show();

        setTimeout(() => {
            toast.hide();
        }, 3000);
    }
    // Function to clear error messages
    function clearErrorMessages() {
        document.getElementById('oldPasswordError').textContent = '';
        document.getElementById('newPasswordError').textContent = '';
        document.getElementById('confirmPasswordError').textContent = '';

        document.getElementById('oldPasswordError').style.display = 'none';
        document.getElementById('newPasswordError').style.display = 'none';
        document.getElementById('confirmPasswordError').style.display = 'none';
    }

    // Check for backend error messages and display in toast if present
    const err = document.getElementById('editPasswordError').textContent.trim();
    if (err) {
        showToast(err, 'error');
    }

    // Check for success message (if needed)
    const msg = document.getElementById('msg').value;
    if (msg) {
        showToast(msg, 'success'); // Show success message
    }
});