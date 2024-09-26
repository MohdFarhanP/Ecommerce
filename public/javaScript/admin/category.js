function showEditCategory(brandName, displayType, bandColor, id) {
    const editCategory = document.getElementById('editCategory');
    editCategory.classList.remove('d-none');
    document.getElementById('brandName').value = brandName;
    document.getElementById('displayType').value = displayType;
    document.getElementById('bandColor').value = bandColor;
    document.getElementById('categoryId').value = id;
}

// Hide the Edit Category form
function hideEditCategory() {
   const editCategory = document.getElementById('editCategory');
    editCategory.classList.add('d-none');
}

// Function to show the add category form
function showAddCategory() {
    const addCategory = document.getElementById('addCategory');
    addCategory.classList.remove('d-none'); // Remove d-none class to show the element
}

// Function to hide the add category form
function hideAddCategory() {
    const addCategory = document.getElementById('addCategory');
    addCategory.classList.add('d-none'); // Add d-none class to hide the element
}