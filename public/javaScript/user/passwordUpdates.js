document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('passwordForm').addEventListener('submit', (event) => {
        event.preventDefault(); 

        clearErrorMessages();

        // Validate form inputs
        const oldPassword = document.getElementById('oldPassword').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        let isValid = true;

        if (!oldPassword) {
            document.getElementById('oldPasswordError').textContent = 'Old password is required.';
            document.getElementById('oldPasswordError').style.display = 'block';
            isValid = false;
        }

        if (!newPassword) {
            document.getElementById('newPasswordError').textContent = 'New password is required.';
            document.getElementById('newPasswordError').style.display = 'block';
            isValid = false;
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
            document.getElementById('newPasswordError').textContent = 'At least 8 characters one uppercase letter and one number.';
            document.getElementById('newPasswordError').style.display = 'block';
            isValid = false;
        }

        if (oldPassword === newPassword ) {
            document.getElementById('newPasswordError').textContent = 'Existing password is not allowed';
            document.getElementById('newPasswordError').style.display = 'block';
            isValid = false;
        }

        if (!confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Please confirm your password.';
            document.getElementById('confirmPasswordError').style.display = 'block';
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'The passwords do not match. Please try again.';
            document.getElementById('confirmPasswordError').style.display = 'block';
            isValid = false;
        }

        if (isValid) {
            event.target.submit();
        }
    });

    // show toast messages (both error and success)
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
    
    function clearErrorMessages() {
        document.getElementById('oldPasswordError').textContent = '';
        document.getElementById('newPasswordError').textContent = '';
        document.getElementById('confirmPasswordError').textContent = '';

        document.getElementById('oldPasswordError').style.display = 'none';
        document.getElementById('newPasswordError').style.display = 'none';
        document.getElementById('confirmPasswordError').style.display = 'none';
    }

    const err = document.getElementById('editPasswordError').textContent.trim();
    if (err) {
        showToast(err, 'error');
    }

    const msg = document.getElementById('msg').value;
    if (msg) {
        showToast(msg, 'success'); 
    }
});