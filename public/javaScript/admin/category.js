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


function validateEditCategoryForm() {

    const errorFields = ['brandName', 'displayType', 'bandColor'];
    errorFields.forEach(fieldId => {
        const inputField = document.getElementById(fieldId);
        const errorDiv = document.getElementById(`${fieldId}Error`);
        errorDiv.textContent = '';
        inputField.classList.remove('is-invalid'); 
    });

    let isValid = true;

  
    errorFields.forEach(fieldId => {
        const inputField = document.getElementById(fieldId);
        if (!inputField.value.trim()) { 
            const errorDiv = document.getElementById(`${fieldId}Error`);
            errorDiv.textContent = `${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)} is required.`; 
            inputField.classList.add('is-invalid'); 
            isValid = false; 
        }
    });

    return isValid; 
}




function submitEditCategoryForm() {
    // Validate the form before submission
    if (!validateEditCategoryForm()) {
        return; // If the form is invalid, stop execution
    }

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
    const fields = [
        { id: 'addBrandName', minLength: 2, errorId: 'addBrandNameError', name: 'Brand Name' },
        { id: 'addDisplayType', minLength: 3, errorId: 'addDisplayTypeError', name: 'Display Type' },
        { id: 'addBandColor', minLength: 3, errorId: 'addBandColorError', name: 'Band Color' }
    ];

    let isValid = true;

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorDiv = document.getElementById(field.errorId);
        const value = input.value.trim();

        errorDiv.style.display = 'none';
        errorDiv.innerHTML = '';
        input.classList.remove('is-invalid');

        if (!value) {
            errorDiv.innerHTML = `${field.name} is required.`;
            isValid = false;
        } else if (value.length < field.minLength) {
            errorDiv.innerHTML = `${field.name} must be at least ${field.minLength} characters long.`;
            isValid = false;
        }

        if (!isValid) {
            errorDiv.style.display = 'block';
            input.classList.add('is-invalid');
        }
    });

    return isValid;
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


