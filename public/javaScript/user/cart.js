document.querySelectorAll('.quantity-btn').forEach(button => {
  button.addEventListener('click', function (e) {
    e.preventDefault();

    const productId = this.getAttribute('data-product-id');
    const quantityInput = document.getElementById(`product-quantity-${productId}`);
    const maxQty = parseInt(this.getAttribute('data-max-qty')); 
    const stock = parseInt(this.getAttribute('data-stock')); 
    let quantity = parseInt(quantityInput.value);


    if (this.classList.contains('plus')) {
      if (quantity < maxQty && quantity < stock) {
        quantity += 1;
      } else {
        alert('You have reached the maximum allowed quantity for this product or stock limit.');
        return; 
      }
    } 
    
    else if (this.classList.contains('minus')) {
      if (quantity > 1) {
        quantity -= 1;
      } else {
        return;
      }
    }

  
    quantityInput.value = quantity;

   
    updateCartQuantity(productId, quantity);

    
    handleButtonState(this, quantity, maxQty, stock);
  });
});


function handleButtonState(button, quantity, maxQty, stock) {
  const productId = button.getAttribute('data-product-id');
  const minusBtn = document.querySelector(`.quantity-btn.minus[data-product-id="${productId}"]`);
  const plusBtn = document.querySelector(`.quantity-btn.plus[data-product-id="${productId}"]`);


  if (quantity <= 1) {
    minusBtn.disabled = true;
  } else {
    minusBtn.disabled = false;
  }


  if (quantity >= maxQty || quantity >= stock) {
    plusBtn.disabled = true;
  } else {
    plusBtn.disabled = false;
  }
}


function updateCartQuantity(productId, quantity) {
  fetch('/updateCartQuantity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, quantity })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {

      const productPriceElement = document.querySelector(`#product-price-${productId}`);
      productPriceElement.textContent = `₹${data.updatedItemPrice}`; 

      // Update the total cart price
      const totalCartPriceElement = document.querySelector('#total-cart-price');
      totalCartPriceElement.textContent = `₹${data.cartTotalPrice}`;   

      console.log('Quantity updated successfully');
    } else {
      alert(data.message || 'Error updating quantity');
    }
  })
  .catch(err => console.log(err));
}
