function showEditCategory(brandName, displayType, bandColor, id) {
    const editCategory = document.getElementById('editCategory');
    editCategory.classList.remove('d-none');
    document.getElementById('brandName').value = brandName;
    document.getElementById('displayType').value = displayType;
    document.getElementById('bandColor').value = bandColor;
    document.getElementById('categoryId').value = id;
}
