
     document.getElementById('signupForm').addEventListener('submit', (event) => {
        event.preventDefault(); 

        let accept = formValidate();
        if (accept) {
            event.target.submit();
        }
    });


    function formValidate() {
        let name = document.getElementById('name').value;
        let password = document.getElementById('password').value;
        let email = document.getElementById('email').value;
        let conformPassword = document.getElementById('conformPassword').value;

        if (name == '' || password == ''|| email == ''||conformPassword == '') {
            Swal.fire('All fields are required');
            return false;
        }
        if (!/^[a-zA-Z0-9_]{5,20}$/.test(name)) {
            Swal.fire({
                icon: "error",
                text: "Username must be 5-20 characters long and contain only letters, numbers, and underscores.",
              });
              return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            Swal.fire({
                icon: "error",
                text: "Please enter valid email. eg: example@domain.com",
              });
              return false;
        }
        if( !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)){
            Swal.fire({
                icon: "error",
                text: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number"
              }); 
              return false;
        }if(password !== conformPassword){
            Swal.fire({
                icon: "error",
                text: "The passwords you entered do not match. Please try again."
              });
            return false;
        }
        return true;
    }

  
  const msg = document.getElementById('msg').textContent;
  if(msg){
    Swal.fire({
        icon: "error",
        title: msg,
      });
  }