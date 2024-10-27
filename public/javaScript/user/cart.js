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

// Applay coupons

document.addEventListener('DOMContentLoaded', function () {

  const couponButtons = document.querySelectorAll('.apply-coupon-btn');
  const couponCodeInput = document.getElementById('coupon-code');
  const cartTotalElement = document.getElementById('total-cart-price');
  const removeCouponButton = document.getElementById('remove-coupon-btn');

  couponButtons.forEach(button => {
    button.addEventListener('click', function () {
      console.log('click');
      const couponCode = this.getAttribute('data-coupon-code');
      console.log("couponcode", couponCode);

      couponCodeInput.value = couponCode;
    });
  });
  function showError(message) {
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(errorToast);
    toast.show();
  }

  document.getElementById('apply-coupon-btn').addEventListener('click', function () {
    const couponCode = couponCodeInput.value;

    if (!couponCode) {
      showError('Please enter a coupon code!');
      return;
    }

    fetch('/applyCoupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ couponCode })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {

          cartTotalElement.textContent = `₹${data.finalTotal}`;
          alert('Coupon applied successfully!');
          window.location.reload();   
        } else {
          showError(data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });

  // Removing coupon 
  if (removeCouponButton) {
    removeCouponButton.addEventListener('click', function () {
        fetch('/removeCoupon', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cartTotalElement.textContent = `₹${data.grandTotal}`;
                    alert('Coupon removed successfully!');
                    window.location.reload(); 
                } else {
                  showError(data.message); 
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
}
});
