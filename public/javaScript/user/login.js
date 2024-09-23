
	 document.addEventListener('DOMContentLoaded', function() {
     document.getElementById('loginform').addEventListener('submit', (event) => {
        event.preventDefault(); 

        let accept = formValidate();
        if (accept) {
            event.target.submit();
        }
    });


    function formValidate() {
        let name = document.getElementById('email').value;
        let password = document.getElementById('password').value;

        if (password == ''|| email == '') {
            Swal.fire('All fields are required');
            return false;
        }
        return true;
    }
  });
  
  const msg = document.getElementById('msg').textContent;
  if(msg){
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: msg,
        showConfirmButton: false,
        timer: 1500
      });
  }