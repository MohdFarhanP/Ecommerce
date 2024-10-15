function showEditProduct(id, productName, productStock, productPrice, isFeatured) {
    document.getElementById('editProductId').value = id;
    document.getElementById('editProductName').value = productName;
    document.getElementById('editStock').value = productStock;
    document.getElementById('editPrice').value = productPrice;
    document.getElementById('editFeatured').value = isFeatured === 'true' ? 'true' : 'false';
}
function validateEditProductForm() {
 
    const errorDiv = document.getElementById('editProductError');
    errorDiv.style.display = 'none'; 
    errorDiv.innerHTML = ''; 

    const productName = document.getElementById('editProductName').value.trim();
    const productStock = document.getElementById('editStock').value;
    const productPrice = document.getElementById('editPrice').value;

    let errors = [];
    if(!productName || !productStock || !productPrice){
        errors.push('All fields are required');
    }
    if (productName.length < 3) {
        errors.push('Product Name must be at least 3 characters long.');
    }

    if (productStock < 0) {
        errors.push('Stock cannot be negative.');
    }

    if (productPrice < 0) {
        errors.push('Price cannot be negative.');
    }

    if (errors.length > 0) {
       
        errorDiv.style.display = 'block'; 
        errorDiv.innerHTML = errors.join('<br>'); 
        return false; 
    }

    return true; 
}
document.getElementById('editProductForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const result = validateEditProductForm();
    if(result){
        e.target.submit();
    }
})