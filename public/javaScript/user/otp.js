document.addEventListener('DOMContentLoaded', () => {
    // Check for error message in inline `span` and display toast if present
    const msg = document.getElementById('error').textContent.trim();
    if (msg) {
        showToast(msg);
    }

    // Countdown timer logic
    let countdown = parseInt(document.getElementById('countdown').textContent, 10);
    if (isNaN(countdown)) {
        console.error('Countdown is not a number');
    } else {
        const timer = setInterval(() => {
            countdown--;
            document.getElementById('countdown').innerText = countdown;

            if (countdown <= 0) {
                clearInterval(timer);
                document.getElementById('timer').style.display = 'none';
                document.getElementById('resendOtpForm').hidden = false;

                showToast('OTP expired. Please request a new one.');
            }
        }, 1000);
    }
});

// Function to show the Bootstrap toast
function showToast(message) {
    // Set the toast message content
    document.getElementById('toastMessage').textContent = message;

    // Initialize the toast and show it
    const toast = new bootstrap.Toast(document.getElementById('errorToast'));
    toast.show();
}
