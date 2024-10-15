document.querySelectorAll('.quantity-btn').forEach(button => {
  button.addEventListener('click', function (e) {
    e.preventDefault();

    const productId = this.getAttribute('data-product-id');
    const quantityInput = document.getElementById(`product-quantity-${productId}`);
    const maxQty = parseInt(this.getAttribute('data-max-qty')); // Assuming max quantity is stored as a data attribute
    const stock = parseInt(this.getAttribute('data-stock')); // Assuming stock is stored as a data attribute
    let quantity = parseInt(quantityInput.value);

    // If the plus button is clicked
    if (this.classList.contains('plus')) {
      if (quantity < maxQty && quantity < stock) {
        quantity += 1;
      } else {
        alert('You have reached the maximum allowed quantity for this product or stock limit.');
        return; // Prevent further execution if limits are reached
      }
    } 
    // If the minus button is clicked
    else if (this.classList.contains('minus')) {
      if (quantity > 1) {
        quantity -= 1;
      } else {
        return; // Prevent decrementing below 1
      }
    }

    // Update the quantity in the input field
    quantityInput.value = quantity;

    // Call the function to update the cart on the server side
    updateCartQuantity(productId, quantity);

    // Disable buttons based on conditions
    handleButtonState(this, quantity, maxQty, stock);
  });
});

// Function to handle the button state (disable/enable)
function handleButtonState(button, quantity, maxQty, stock) {
  const productId = button.getAttribute('data-product-id');
  const minusBtn = document.querySelector(`.quantity-btn.minus[data-product-id="${productId}"]`);
  const plusBtn = document.querySelector(`.quantity-btn.plus[data-product-id="${productId}"]`);

  // Disable minus button if quantity is 1
  if (quantity <= 1) {
    minusBtn.disabled = true;
  } else {
    minusBtn.disabled = false;
  }

  // Disable plus button if quantity reaches maxQty or stock
  if (quantity >= maxQty || quantity >= stock) {
    plusBtn.disabled = true;
  } else {
    plusBtn.disabled = false;
  }
}

// Function to update the cart quantity on the server
function updateCartQuantity(productId, quantity) {
  fetch('/user/updateCartQuantity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, quantity })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Update the individual product's price
      const productPriceElement = document.querySelector(`#product-price-${productId}`);
      productPriceElement.textContent = `₹${data.updatedItemPrice}`;  // Update product total price

      // Update the total cart price
      const totalCartPriceElement = document.querySelector('#total-cart-price');
      totalCartPriceElement.textContent = `₹${data.cartTotalPrice}`;   // Update cart total price

      console.log('Quantity updated successfully');
    } else {
      alert(data.message || 'Error updating quantity');
    }
  })
  .catch(err => console.log(err));
}
