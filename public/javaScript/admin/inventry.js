// for showing the existing data to edit
function showEditProduct(id, productName, productStock, productPrice, isFeatured) {
    document.getElementById('editProductId').value = id;
    document.getElementById('editProductName').value = productName;
    document.getElementById('editStock').value = productStock;
    document.getElementById('editPrice').value = productPrice;
    document.getElementById('editFeatured').value = isFeatured === 'true' ? 'true' : 'false';
}
// form validation for edit form
function validateEditProductForm() {
   
    const fields = [
        { id: 'editProductName', minLength: 3, errorMsg: 'Product Name must be at least 3 characters long.' },
        { id: 'editStock', minValue: 0, errorMsg: 'Stock cannot be negative.' },
        { id: 'editPrice', minValue: 0, errorMsg: 'Price cannot be negative.' }
    ];

    let isValid = true;

    fields.forEach(({ id, minLength, minValue, errorMsg }) => {
        const input = document.getElementById(id);
        const errorDiv = document.getElementById(`${id}Error`);
        const value = input.value.trim();

        input.classList.remove('is-invalid');
        errorDiv.textContent = '';

        if (!value) {
            errorDiv.textContent = `${input.previousElementSibling.textContent} is required.`;
            input.classList.add('is-invalid');
            isValid = false;
        } else if (minLength && value.length < minLength) {
            errorDiv.textContent = errorMsg;
            input.classList.add('is-invalid');
            isValid = false;
        } else if (minValue !== undefined && Number(value) < minValue) {
            errorDiv.textContent = errorMsg;
            input.classList.add('is-invalid');
            isValid = false;
        }
    });

    return isValid; 
}
// submitting the edit inventry form 
document.getElementById('editProductForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const result = validateEditProductForm();
    if (result) {
        e.target.submit();
    }
});