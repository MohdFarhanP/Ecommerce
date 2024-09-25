let countdown = 60;
const timer = setInterval(() => {
  countdown--;
  document.getElementById('countdown').innerText = countdown;

  if (countdown <= 0) {
    clearInterval(timer);
    alert('OTP expired. Please request a new one.');
  }
}, 1000);

const msg = document.getElementById('error').textContent;
  if(msg){
    Swal.fire({
        icon: "error",
        title: msg,
        timer: 1500
      });
  }