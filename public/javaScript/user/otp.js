
let countdown = parseInt(document.getElementById('countdown').textContent, 10); // Use textContent

if (isNaN(countdown)) {
    console.error('Countdown is not a number');
} else {
    console.log(countdown);

    
    const timer = setInterval(() => {
        countdown--;
        document.getElementById('countdown').innerText = countdown;

        if (countdown <= 0) {
            clearInterval(timer);
            document.getElementById('timer').style.display = 'none'; 
            document.getElementById('resendOtpForm').hidden = false; 

            alert('OTP expired. Please request a new one.');
        }
    }, 1000);
}
const msg = document.getElementById('error').textContent;
  if(msg){
    Swal.fire({
        icon: "error",
        title: msg,
        timer: 1500
      });
  }