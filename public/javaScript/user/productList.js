// whish icon
const wishlistIcons = document.querySelectorAll('.wish-icon');
wishlistIcons.forEach(icon => {
  icon.addEventListener('click', function () {
    this.classList.toggle('clicked'); // Toggle 'clicked' class on click
  });
});

// price

function updatePriceLabels() {
  const minPrice = document.getElementById('minPrice').value;
  const maxPrice = document.getElementById('maxPrice').value;

  document.getElementById('minPriceLabel').textContent = `₹${minPrice}`;
  document.getElementById('maxPriceLabel').textContent = `₹${maxPrice}`;
}

// filtering

document.getElementById('applyFilter').addEventListener('click', () => {

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
  });
});

function renderProducts(products) {
  const productContainer = document.getElementById('product-container');
  productContainer.innerHTML = ''; 

  products.forEach(product => {
    const productHTML = ` 
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <a href="/singleProduct/${product._id}">
            <img src="/uploads/${product.images[0]}" class="card-img-top" alt="${product.productName}">
          </a>
          <div class="card-body">
            <div class="d-flex">
              <h5 class="card-title">${product.productName}</h5>
              <i class="fa-solid fa-heart wish-icon"></i>
            </div>  
            <p class="card-text text-warning">₹${product.productPrice}</p>
             <form action="/user/addToCart" method="POST" class="d-inline">
                <input type="hidden" name="productId" value="${product._id}">
                <input type="number" name="quantity" value="1" min="1" hidden>
            <a href="#" class="btn btn-outline-warning">Add to Cart</a>
            </form>
          </div>
        </div>
      </div>
    `;
    productContainer.innerHTML += productHTML;
  });
}