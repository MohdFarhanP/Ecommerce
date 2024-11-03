//editing the category

function showEditCategory(brandName, displayType, bandColor, id) {

    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';
    errorMessage.classList.add('d-none');

    document.getElementById('brandName').value = brandName;
    document.getElementById('displayType').value = displayType;
    document.getElementById('bandColor').value = bandColor;
    document.getElementById('categoryId').value = id;

    const myModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
    myModal.show();
}
function submitEditCategoryForm() {
    const categoryId = document.getElementById('categoryId').value;
    const brandName = document.getElementById('brandName').value;
    const displayType = document.getElementById('displayType').value;
    const bandColor = document.getElementById('bandColor').value;

    fetch('/editCategory', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: categoryId,
            brandName,
            displayType,
            bandColor
        }),
    })
        .then(response => response.json())
        .then(data => {
            const errorMessage = document.getElementById('error-message');
            if (data.error) {
                errorMessage.textContent = data.error;
                errorMessage.classList.remove('d-none');
            } else {

                const modal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
                modal.hide();
                window.location.reload();
            }
        })
        .catch(error => console.error('Error:', error));
}
// add the category

function validateAddCategoryForm() {

    const errorDiv = document.getElementById('addCategoryError');
    errorDiv.style.display = 'none';
    errorDiv.innerHTML = '';

    const brandName = document.getElementById('addBrandName').value.trim();
    const displayType = document.getElementById('addDisplayType').value.trim();
    const bandColor = document.getElementById('addBandColor').value.trim();

    let errors = [];

    if (!brandName || !displayType || !bandColor) {
        errors.push('All fields are required.');
    }

    if (brandName.length < 2) {
        errors.push('Brand Name must be at least 2 characters long.');
    }

    if (displayType.length < 3) {
        errors.push('Display Type must be at least 3 characters long.');
    }

    if (bandColor.length < 3) {
        errors.push('Band Color must be at least 3 characters long.');
    }

    if (errors.length > 0) {
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = errors.join('<br>');
        return false;
    }

    return true;
}


document.getElementById("addCategoryForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!validateAddCategoryForm()) {
        return;
    }

    const formData = {
        brandName: document.getElementById("addBrandName").value,
        displayType: document.getElementById("addDisplayType").value,
        bandColor: document.getElementById("addBandColor").value
    };

    try {
        const response = await fetch('/addCategory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            window.location.href = "/category";
        } else {
            document.getElementById("addCategoryError").style.display = "block";
            document.getElementById("addCategoryError").innerText = result.errorMessage;
        }
    } catch (error) {
        console.error("Error submitting form", error);
        document.getElementById("addCategoryError").style.display = "block";
        document.getElementById("addCategoryError").innerText = "An unexpected error occurred. Please try again.";
    }
});


