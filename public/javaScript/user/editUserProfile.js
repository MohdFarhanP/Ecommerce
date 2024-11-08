document.getElementById('editUserForm').addEventListener('submit', (event) => {
    event.preventDefault(); 

    // Clear previous error messages
    document.getElementById('userNameError').style.display = 'none';
    document.getElementById('mobileError').style.display = 'none';
    document.getElementById('emailError').style.display = 'none';
    document.getElementById('countryError').style.display = 'none';

    const userName = document.querySelector('input[name="userName"]').value.trim();
    const mobile = document.querySelector('input[name="mobile"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const country = document.querySelector('select[name="country"]').value;

    let isValid = true;

    // Validate username
    if (!userName) {
        document.getElementById('userNameError').style.display = 'block';
        isValid = false;
    }

    // Validate email
    if (!email || !validateEmail(email)) {
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
    }

    // Validate mobile
    if (!mobile || !validateMobile(mobile)) {
        document.getElementById('mobileError').style.display = 'block';
        isValid = false;
    }

    // Validate country
    if (!country) {
        document.getElementById('countryError').style.display = 'block';
        isValid = false;
    }

    // If all validations pass, submit the form
    if (isValid) {
        event.target.submit();
    }
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
function copyReferralCode() {
    const referralCodeField = document.getElementById("referralCode");
    referralCodeField.select();
    document.execCommand("copy");
    alert("Referral code copied!");
}