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
