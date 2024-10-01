// Show Add Product form
function showAddProduct() {
    document.getElementById("addProduct").classList.remove("d-none");
}

// Hide Add Product form
function hideAddProduct() {
    document.getElementById("addProduct").classList.add("d-none");
}

// Show Edit Product form
function showEditProduct(productName, productStock, productPrice, images, id) {
    document.getElementById("editProduct").classList.remove("d-none");
    document.getElementById("productName").value = productName;
    document.getElementById("productStock").value = productStock;
    document.getElementById("productPrice").value = productPrice;
    document.getElementById("productId").value = id;
    document.getElementById('productImages').value = images;
}

// Hide Edit Product form
function hideEditProduct() {
    document.getElementById("editProduct").classList.add("d-none");
}