
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
