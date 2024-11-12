// wishlist icon change
const wishlistIcons = document.querySelectorAll('.wish-icon');
wishlistIcons.forEach(icon => {
  icon.addEventListener('click', function () {
    this.classList.toggle('clicked');

    const productId = this.getAttribute('data-id');
    const isAdded = this.classList.contains('clicked');
    console.log(productId, isAdded);

    if (isAdded) {
      console.log(productId);

      addToWishlist(productId);
    } else {
      removeFromWishlist(productId);
    }
  });
});

// Function to show toast
function showToast(title, message) {
  const toastTitle = document.getElementById('toast-title');
  const toastBody = document.getElementById('toast-body');
  const toastElement = document.getElementById('toast');

  toastTitle.textContent = title;
  toastBody.textContent = message;

  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

// Function to add product to wishlist
function addToWishlist(productId) {
  fetch('/wishlistAdd', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ productId })
  })
    .then(response => {
      if (response.status === 400) {
        return response.json().then(data => {
          throw new Error(data.message); 
        });
      } else if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        console.log('Product added to wishlist successfully!');
        showToast('Success', data.message);
      } else {
        console.error('Failed to add product to wishlist');
        showToast('Error', data.message);
      }
    })
    .catch(err => {
      console.error('Error:', err);
      showToast('Error', err.message || 'An error occurred while adding to wishlist.'); 
    });
}
// Function to remove product to wishlist
function removeFromWishlist(productId) {
  fetch('/wishlistRemove', {
    method: 'DELETE',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ productId })
  })
    .then(response => {

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        console.log('Product removed from wishlist successfully!');
        showToast('Success', data.message);
      } else {
        console.error('Failed to remove product from wishlist');
        showToast('Error', data.message);
      }
    })
    .catch(err => {
      console.error('Error:', err);
      showToast('Error', 'An error occurred while removing from wishlist.');
    });
}


// star rating
const ratingContainers = document.querySelectorAll('.star-rating');
const ratingInput = document.getElementById('rating');

ratingContainers.forEach(container => {

  const stars = container.querySelectorAll('i');

  stars.forEach(star => {
    star.addEventListener('click', function () {
      const rating = this.getAttribute('data-value');

      ratingInput.value = rating;

      stars.forEach((s, index) => {
        s.classList.toggle('fas', index < rating);
        s.classList.toggle('far', index >= rating);
      });
    });
  });
});

// quatity 
const minusBtn = document.querySelector('.minus');
const plusBtn = document.querySelector('.plus');
const quantityInput = document.getElementById('product-quantity');


minusBtn.addEventListener('click', () => {
  let currentQuantity = parseInt(quantityInput.value);
  if (currentQuantity > 1) {
    quantityInput.value = currentQuantity - 1;
  }
});

plusBtn.addEventListener('click', () => {
  let currentQuantity = parseInt(quantityInput.value);
  quantityInput.value = currentQuantity + 1;
});

// image zoom
let isZooming = false;

const zoomImage = (event) => {
  const pointer = {
    X: (event.offsetX * 100) / imageZoom.offsetWidth,
    Y: (event.offsetY * 100) / imageZoom.offsetHeight
  };

  imageZoom.style.setProperty('--zoom-x', pointer.X + '%');
  imageZoom.style.setProperty('--zoom-y', pointer.Y + '%');

  isZooming = false;
};

const imageZoom = document.getElementById('imageZoom');

imageZoom.addEventListener('mousemove', (event) => {
  imageZoom.style.setProperty('--display', 'block');

  if (!isZooming) {
    isZooming = true;
    requestAnimationFrame(() => zoomImage(event));
  }
});

imageZoom.addEventListener('mouseout', () => {
  imageZoom.style.setProperty('--display', 'none');
});

//image selection
document.querySelectorAll('.thumbnail').forEach(thumbnail => {
  thumbnail.addEventListener('click', function () {

    const mainImage = document.getElementById('productImg');

    mainImage.src = this.src;

    const imageZoom = document.getElementById('imageZoom');
    imageZoom.style.setProperty('--url', `url(${this.src})`);
  });
});

// Review form validation 
document.getElementById('reviewForm').addEventListener('submit', function (event) {
  const name = document.getElementById('customerName').value.trim();
  const email = document.getElementById('email').value.trim();
  const rating = document.getElementById('rating').value;
  const comment = document.getElementById('comment').value.trim();

  if (!name) {
    event.preventDefault();
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Name is required!',
      confirmButtonText: 'OK'
    });
    document.getElementById('customerName').focus();
    return false;
  }

  if (email && !validateEmail(email)) {
    event.preventDefault();
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Please enter a valid email address!',
      confirmButtonText: 'OK'
    });
    document.getElementById('email').focus();
    return false;
  }

  if (rating === "0") {
    event.preventDefault();
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Please provide a rating!',
      confirmButtonText: 'OK'
    });
    return false;
  }

  if (!comment) {
    event.preventDefault();
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Comment is required!',
      confirmButtonText: 'OK'
    });
    document.getElementById('comment').focus();
    return false;
  }
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
