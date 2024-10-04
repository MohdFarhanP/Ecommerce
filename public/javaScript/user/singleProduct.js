// whish icon
const wishlistIcons = document.querySelectorAll('.wish-icon');
wishlistIcons.forEach(icon => {
  icon.addEventListener('click', function () {
    this.classList.toggle('clicked'); // Toggle 'clicked' class on click
  });
});

// star rating

const ratingContainers = document.querySelectorAll('.star-rating');
const ratingInput = document.getElementById('rating');
    
    
    ratingContainers.forEach(container => {
    
      const stars = container.querySelectorAll('i');
      
      stars.forEach(star => {
        star.addEventListener('click', function() {
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
  
  isZooming = false; // reset flag
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
  thumbnail.addEventListener('click', function() {

    const mainImage = document.getElementById('productImg');

    mainImage.src = this.src;
    
    const imageZoom = document.getElementById('imageZoom');
    imageZoom.style.setProperty('--url', `url(${this.src})`);
  });
});