

// error toast 
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
// Function to remove product from wishlist
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
// whish icon
function updateWishlistListeners() {
  const wishlistIcons = document.querySelectorAll('.wish-icon');

  wishlistIcons.forEach(icon => {
    icon.addEventListener('click', function () {
      this.classList.toggle('clicked');

      const productId = this.getAttribute('data-id');
      const isAdded = this.classList.contains('clicked');

      if (isAdded) {
        addToWishlist(productId);
      } else {
        removeFromWishlist(productId);
      }
    });
  });
}

// price
function updatePriceLabels() {
  const minPrice = document.getElementById('minPrice').value;
  const maxPrice = document.getElementById('maxPrice').value;

  document.getElementById('minPriceLabel').textContent = `₹${minPrice}`;
  document.getElementById('maxPriceLabel').textContent = `₹${maxPrice}`;
}


// filtering
function collectFilterValuesAndFilter() {

  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('q') || document.getElementById('searchInput').value;

  const minPrice = document.getElementById('minPrice').value;
  const maxPrice = document.getElementById('maxPrice').value;
  const selectedBrands = Array.from(document.querySelectorAll('.brand-filter:checked')).map(input => input.value);
  const selectedDisplayTypes = Array.from(document.querySelectorAll('.display-type-filter:checked')).map(input => input.value);
  const selectedColors = Array.from(document.querySelectorAll('.color-filter:checked')).map(input => input.value);
  const showOutOfStock = document.getElementById('showOutOfStock').checked;
  const sortCriteria = document.getElementById('sortCriteria').value;

  fetch('/filterProducts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchQuery,
      minPrice,
      maxPrice,
      brands: selectedBrands,
      displayTypes: selectedDisplayTypes,
      colors: selectedColors,
      showOutOfStock,
      sortCriteria
    })
  })
    .then(response => response.json())
    .then(filteredProducts => {
      renderProducts(filteredProducts);
      updateWishlistListeners();
    });
}

// Add event listeners to filters
document.getElementById('searchInput').addEventListener('input', collectFilterValuesAndFilter);
document.getElementById('minPrice').addEventListener('input', collectFilterValuesAndFilter);
document.getElementById('maxPrice').addEventListener('input', collectFilterValuesAndFilter);
document.querySelectorAll('.brand-filter').forEach(checkbox => checkbox.addEventListener('change', collectFilterValuesAndFilter));
document.querySelectorAll('.display-type-filter').forEach(checkbox => checkbox.addEventListener('change', collectFilterValuesAndFilter));
document.querySelectorAll('.color-filter').forEach(checkbox => checkbox.addEventListener('change', collectFilterValuesAndFilter));
document.getElementById('showOutOfStock').addEventListener('change', collectFilterValuesAndFilter);
document.getElementById('sortCriteria').addEventListener('change', collectFilterValuesAndFilter);

// render filtered product 
function renderProducts(products) {
  console.log(products);
  const productContainer = document.getElementById('product-container');
  productContainer.innerHTML = '';

  let productHTML = products.map(product => {
    const imageUrl = product.images && product.images.length > 0
      ? `${product.images[0]}`
      : '/images/default-product.jpg';

    return `
            <div class="col-md-4 mb-4">
    <div class="card h-100 d-flex flex-column">
        <a href="/singleProduct/${product._id}">
            <img src="${imageUrl}" class="card-img-top" alt="${product.productName}">
        </a>
        <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between">
                <h5 class="card-title">${product.productName}</h5>
                <i class="fa-solid fa-heart wish-icon" data-id="${product._id}"></i>
            </div>
            ${product.hasDiscount ? `
                <div class="mb-2">
                    <span class="text-muted text-decoration-line-through">₹${product.productPrice}</span>
                    <span class="text-danger">₹${product.finalPrice}</span>
                    <div class="badge bg-success">${product.discountLabel}</div>
                </div>
            ` : `
                <p class="card-text text-warning">₹${product.finalPrice}</p>
            `}
            <!-- Adding mt-auto to push the button to the bottom -->
            <form action="/addToCart" method="POST" class="mt-auto">
                <input type="hidden" name="productId" value="${product._id}">
                <input type="number" name="quantity" value="1" min="1" hidden>
                <button type="submit" class="btn btn-outline-warning w-100">Add to Cart</button>
            </form>
        </div>
    </div>
</div>

        `;
  }).join(''); 

  productContainer.innerHTML = productHTML;
}

