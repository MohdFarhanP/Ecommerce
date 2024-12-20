// validate and submit form submission 
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

    // validate form
    let isValid = true;

    if (!userName) {
        document.getElementById('userNameError').style.display = 'block';
        isValid = false;
    }

    if (!email || !validateEmail(email)) {
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
    }

    if (!mobile || !validateMobile(mobile)) {
        document.getElementById('mobileError').style.display = 'block';
        isValid = false;
    }

    if (!country) {
        document.getElementById('countryError').style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        event.target.submit();
    }
});

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
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