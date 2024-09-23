
	 document.addEventListener('DOMContentLoaded', function() {
     document.getElementById('loginform').addEventListener('submit', (event) => {
        event.preventDefault(); 

        let accept = formValidate();
        if (accept) {
            event.target.submit();
        }
    });


    function formValidate() {
        let name = document.getElementById('name').value;
        let password = document.getElementById('password').value;

        if (name == '' || password == ''|| email == '') {
            Swal.fire('All fields are required');
            return false;
        }
        return true;
    }
  });
  
  const msg = document.getElementById('msg').textContent;
  if(msg){
    Swal.fire({
        icon: "error",
        title: msg,
      });
  }