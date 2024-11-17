document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginform');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (formValidate()) {
            loginForm.submit();
        }
    });

    function formValidate() {
        let email = document.getElementById('email');
        let password = document.getElementById('password');
        let isValid = true;

        // Reset previous validation
        email.classList.remove('is-invalid');
        password.classList.remove('is-invalid');
        document.getElementById('emailError').style.display = 'none';
        document.getElementById('passwordError').style.display = 'none';

        // Validate email
        if (email.value.trim() === '') {
            email.classList.add('is-invalid');
            document.getElementById('emailError').style.display = 'block';
            isValid = false;
        }

        // Validate password
        if (password.value.trim() === '') {
            password.classList.add('is-invalid');
            document.getElementById('passwordError').style.display = 'block';
            isValid = false;
        }

        return isValid;
    }

    // Display server-rendered messages inline if they exist
    const msg = document.getElementById('msg').textContent.trim();
    const error = document.getElementById('err').textContent.trim();

    if (msg) {
        document.getElementById('emailError').textContent = msg;
        document.getElementById('emailError').style.display = 'block';
        document.getElementById('email').classList.add('is-valid');
    }
    if (error) {
        document.getElementById('emailError').textContent = error;
        document.getElementById('emailError').style.display = 'block';
        document.getElementById('email').classList.add('is-invalid');
    }
});
