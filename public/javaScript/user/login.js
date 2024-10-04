
	 document.addEventListener('DOMContentLoaded', function() {
     document.getElementById('loginform').addEventListener('submit', (event) => {
        event.preventDefault(); 

        let accept = formValidate();
        if (accept) {
            event.target.submit();
        }
    });


    function formValidate() {
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;

        if (password == ''|| email == '') {
            Swal.fire('All fields are required');
            return false;
        }
        return true;
    }
  });
  
  const msg = document.getElementById('msg').textContent;
  const error = document.getElementById('err').textContent;
  if(msg){
    Swal.fire({
        position: "center",
        icon: "success",
        title: msg,
        showConfirmButton: false,
        timer: 1500
      });
  }
  if(error){
    Swal.fire({
        position: "center",
        icon: "error",
        title: error,
        showConfirmButton: false,
        timer: 1500
      });
  }

  document.getElementById('demoLogin').addEventListener('click', function() {
    fetch('/user/demoLogin', {
        method: 'POST',
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/user/home'; 
        } else {
            console.error('Demo login failed');
        }
    })
    .catch(error => {
        console.error('Error during demo login:', error);
    });
});