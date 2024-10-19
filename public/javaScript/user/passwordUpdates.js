document.getElementById('passwordForm').addEventListener('submit', (event) => {
    event.preventDefault(); 

    const accept = formValidate();
    if (accept) {
        event.target.submit();
    }
});


function formValidate() {
    const oldPassword = document.getElementById('oldPassword').value;
    const password = document.getElementById('newPassword').value;
    const conformPassword = document.getElementById('confirmPassword').value;

    if (oldPassword == '' || password == ''|| conformPassword == '') {
        Swal.fire('All fields are required');
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
const err = document.getElementById('editPasswordError').textContent.trim();;
if (err){
    document.getElementById('editPasswordError').style.display ="block";
}else{
    document.getElementById('editPasswordError').style.display ="none";
}
const msg = document.getElementById('msg').value;
if(msg){
  Swal.fire({
      icon: "success",
      title: msg,
    });
}