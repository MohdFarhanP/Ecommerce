// validate and submit form validation 
document.getElementById('signupForm').addEventListener('submit', (event) => {
    event.preventDefault();

    clearErrors(); 
    let accept = formValidate();
    if (accept) {
        event.target.submit();
    }
});

function clearErrors() {
    document.querySelectorAll('.form-control').forEach(input => {
        input.classList.remove('is-invalid');
    });
    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
}
// validate form validation
function formValidate() {
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('conformPassword').value;

    let isValid = true;

    if (name === '') {
        document.getElementById('nameError').textContent = 'Username is required';
        document.getElementById('name').classList.add('is-invalid');
        isValid = false;
    } else if (!/^[a-zA-Z0-9_]{5,20}$/.test(name)) {
        document.getElementById('nameError').textContent = 'Username must be 5-20 characters long and contain only letters, numbers, and underscores.';
        document.getElementById('name').classList.add('is-invalid');
        isValid = false;
    }

    if (email === '') {
        document.getElementById('emailError').textContent = 'Email is required';
        document.getElementById('email').classList.add('is-invalid');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email. e.g., example@domain.com';
        document.getElementById('email').classList.add('is-invalid');
        isValid = false;
    }

    if (password === '') {
        document.getElementById('passwordError').textContent = 'Password is required';
        document.getElementById('password').classList.add('is-invalid');
        isValid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
        document.getElementById('passwordError').textContent = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
        document.getElementById('password').classList.add('is-invalid');
        isValid = false;
    }

    if (confirmPassword === '') {
        document.getElementById('confirmPasswordError').textContent = 'Confirm password is required';
        document.getElementById('conformPassword').classList.add('is-invalid');
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match. Please try again.';
        document.getElementById('conformPassword').classList.add('is-invalid');
        isValid = false;
    }

    return isValid;
}
