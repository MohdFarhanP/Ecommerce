document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent form submission for validation
    
    const userName = document.querySelector('input[name="userName"]').value.trim();
    const mobile = document.querySelector('input[name="mobile"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const country = document.querySelector('select[name="country"]').value;

    if (!userName) {
        Swal.fire('Error', 'Username is required', 'error');
        return false;
    }

    if (!email || !validateEmail(email)) {
        Swal.fire('Error', 'A valid email is required', 'error');
        return false;
    }

    if (!mobile || !validateMobile(mobile)) {
        Swal.fire('Error', 'A valid mobile number is required', 'error');
        return false;
    }

    if (!country || country === "") {
        Swal.fire('Error', 'Please select a country', 'error');
        return false;
    }

    // If all validations pass, submit the form
    event.target.submit();
});

// Helper function to validate email format
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Helper function to validate mobile number format (example: only digits, 10-15 digits)
function validateMobile(mobile) {
    const regex = /^[0-9]{10,15}$/;
    return regex.test(mobile);
}