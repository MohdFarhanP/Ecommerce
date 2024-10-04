const msg = document.getElementById('msg').textContent;

if(msg){
  Swal.fire({
      position: "center",
      icon: "success",
      title: msg,
      showConfirmButton: false,
      timer: 1500
    });
}