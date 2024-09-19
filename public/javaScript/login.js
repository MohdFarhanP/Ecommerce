
	 document.addEventListener('DOMContentLoaded', function() {
     document.getElementById('loginform').addEventListener('submit', (event) => {
        event.preventDefault();
		 alert("Form validation triggered"); 

        let accept = formValidate();
        if (accept) {
            event.target.submit();
        }
    });


    function formValidate() {
        let name = document.getElementById('name').value;
        let password = document.getElementById('password').value;

      
  

        if (name == '' || password == '') {
            Swal.fire('All fields are required');
            return false;
        }
        return true;
    }
  });
