
// Detect sorting change and reload page with sorting parameters
document.getElementById('sortSelect').addEventListener('change', function () {
    const [sortBy, order] = this.value.split('-');
    window.location.href = `?sortBy=${sortBy}&order=${order}&page=1`;
});

let cropper;
let currentReplaceInput = null;
// function for the edit product
function showEditProduct(productName, productStock, productPrice, description, id, category, highlights, images) {

    document.getElementById("productName").value = productName;
    document.getElementById("productStock").value = productStock;
    document.getElementById("productPrice").value = productPrice;
    document.getElementById("productDescription").value = description;
    document.getElementById("productId").value = id;

    document.getElementById("productCategories").value = category;

    document.getElementById("highlightBrand").value = highlights.brand;
    document.getElementById("highlightModel").value = highlights.model;
    document.getElementById("highlightCaseMaterial").value = highlights.caseMaterial;
    document.getElementById("highlightDialColor").value = highlights.dialColor;
    document.getElementById("highlightWaterResistance").value = highlights.waterResistance;
    document.getElementById("highlightMovementType").value = highlights.movementType;
    document.getElementById("highlightBandMaterial").value = highlights.bandMaterial;
    document.getElementById("highlightFeatures").value = highlights.features.join(", ");
    document.getElementById("highlightWarranty").value = highlights.warranty;


    const imagePreview = document.querySelector(".product-images");
    imagePreview.innerHTML = ""; 

    images.forEach((image, index) => {
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-wrapper", "m-2");

        const imgElement = document.createElement("img");
        imgElement.src = `${image}`;
        imgElement.width = 150;
        imgElement.height = 150;
        imgElement.classList.add("preview-image");
        imgElement.id = `preview-image-${index}`;
        imageContainer.appendChild(imgElement);

        const replaceInput = document.createElement("input");
        replaceInput.type = "file";
        replaceInput.classList.add("replace-image-input", "d-none");
        replaceInput.name = `images[${index}]`;

        replaceInput.addEventListener("change", (event) => {
            openCropper(event.target, index);
        });

        imageContainer.appendChild(replaceInput);

        const changeButton = document.createElement("button");
        changeButton.classList.add("btn", "btn-outline-primary", "mt-2");
        changeButton.innerText = "Change Image";
        changeButton.onclick = (event) => {
            event.preventDefault();
            replaceInput.click();
        };

        imageContainer.appendChild(changeButton);
        imagePreview.appendChild(imageContainer);
    });

    // Function to open the cropper
    function openCropper(input, index) {
        const file = input.files[0];
        currentReplaceInput = input; 
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageToCrop = document.getElementById('imageToCrop');
                imageToCrop.src = e.target.result;
                imageToCrop.style.display = "block"; 

                if (cropper) cropper.destroy();
                cropper = new Cropper(imageToCrop, {
                    aspectRatio: 1,
                    viewMode: 0,
                    autoCropArea: 1,
                    ready: () => {
                        document.getElementById('cropper-container').style.display = 'flex'; 
                    }
                });
            };
            reader.readAsDataURL(file);
        }
    }

    // Crop the image and update the preview
    document.getElementById('cropImage').addEventListener('click', function (e) {
        e.preventDefault()
        if (cropper) {
            const canvas = cropper.getCroppedCanvas({
                width: 500,
                height: 500,
                fillColor: '#fff',
            });

            canvas.toBlob((blob) => {
                const croppedFile = new File([blob], "croppedImage.png", { type: "image/png" });

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(croppedFile);
                currentReplaceInput.files = dataTransfer.files;

                const index = currentReplaceInput.name.match(/\d+/)[0];
                const imgElement = document.getElementById(`preview-image-${index}`);
                imgElement.src = URL.createObjectURL(croppedFile);

                document.getElementById('cropper-container').style.display = 'none';
            });
        }
    });

}
// validate and submit the form
document.getElementById('editForm').addEventListener('submit', function (event) {

    clearErrors();
    let isValid = true;

    const productName = document.getElementById('productName').value.trim();
    if (!productName) {
        showInputError('productName', 'nameError');
        isValid = false;
    }

    const productStock = document.getElementById('productStock').value;
    if (productStock < 0 || productStock === '') {
        showInputError('productStock', 'stockError');
        isValid = false;
    }

    const productPrice = document.getElementById('productPrice').value;
    if (productPrice < 0 || productPrice === '') {
        showInputError('productPrice', 'priceError');
        isValid = false;
    }

    const productDescription = document.getElementById('productDescription').value.trim();
    if (!productDescription) {
        showInputError('productDescription', 'descriptionError');
        isValid = false;
    }

    const productCategories = document.getElementById('productCategories').value;
    if (!productCategories) {
        showInputError('productCategories', 'categoryError');
        isValid = false;
    }

    const highlightBrand = document.getElementById('highlightBrand').value.trim();
    if (!highlightBrand) {
        showInputError('highlightBrand', 'highlightBrandError');
        isValid = false;
    }

    const highlightModel = document.getElementById('highlightModel').value.trim();
    if (!highlightModel) {
        showInputError('highlightModel', 'highlightModelError');
        isValid = false;
    }

    const highlightCaseMaterial = document.getElementById('highlightCaseMaterial').value.trim();
    if (!highlightCaseMaterial) {
        showInputError('highlightCaseMaterial', 'highlightCaseMaterialError');
        isValid = false;
    }

    const highlightDialColor = document.getElementById('highlightDialColor').value.trim();
    if (!highlightDialColor) {
        showInputError('highlightDialColor', 'highlightDialColorError');
        isValid = false;
    }

    const highlightWaterResistance = document.getElementById('highlightWaterResistance').value.trim();
    if (!highlightWaterResistance) {
        showInputError('highlightWaterResistance', 'highlightWaterResistanceError');
        isValid = false;
    }

    const highlightMovementType = document.getElementById('highlightMovementType').value.trim();
    if (!highlightMovementType) {
        showInputError('highlightMovementType', 'highlightMovementTypeError');
        isValid = false;
    }

    const highlightBandMaterial = document.getElementById('highlightBandMaterial').value.trim();
    if (!highlightBandMaterial) {
        showInputError('highlightBandMaterial', 'highlightBandMaterialError');
        isValid = false;
    }

    const highlightFeatures = document.getElementById('highlightFeatures').value.trim();
    if (!highlightFeatures) {
        showInputError('highlightFeatures', 'highlightFeaturesError');
        isValid = false;
    }

    const highlightWarranty = document.getElementById('highlightWarranty').value.trim();
    if (!highlightWarranty) {
        showInputError('highlightWarranty', 'highlightWarrantyError');
        isValid = false;
    }

    if (!isValid) {
        event.preventDefault();
    }
});
// show error message
function showInputError(inputId, errorId) {
    document.getElementById(inputId).classList.add('is-invalid');
    document.getElementById(errorId).style.display = 'block';
}
// clear error message
function clearErrors() {
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.classList.remove('is-invalid');
    });

    const errorMessages = document.querySelectorAll('.invalid-feedback');
    errorMessages.forEach(msg => {
        msg.style.display = 'none';
    });
}


// Image cropping on add product
let cropperInstances = [];

document.getElementById('imageInput').addEventListener('change', function (event) {
    const files = event.target.files;
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = "";
    cropperInstances = [];


    const validImages = [];


    for (const file of files) {
        if (!file.type.startsWith('image/')) {
            showError(`${file.name} is not a valid image file. Please upload images only.`);
            event.target.value = '';
            return;
        }
        validImages.push(file);
    }

    if (validImages.length > 3) {
        showError('You can only upload a maximum of 3 images.');
        event.target.value = '';
        return;
    }

    validImages.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            const imgWrapper = document.createElement("div");
            imgWrapper.classList.add('img-thumbnail', 'col-4', 'position-relative');

            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "100%";
            img.id = `cropImage${index}`;
            imgWrapper.appendChild(img);

            // Add Change Image button
            const changeImageBtn = document.createElement("button");
            changeImageBtn.textContent = "Change Image";
            changeImageBtn.classList.add("btn", "btn-warning", "btn-sm", "m-2");
            changeImageBtn.addEventListener("click", function () {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.click();

                fileInput.onchange = function (e) {
                    e.preventDefault();
                    const newFile = e.target.files[0];
                    if (newFile && newFile.type.startsWith('image/')) {
                        const newReader = new FileReader();
                        newReader.onload = function (event) {
                            img.src = event.target.result;
                            cropperInstances[index].replace(event.target.result);
                        };
                        newReader.readAsDataURL(newFile);
                    } else {
                        showError("Invalid image file");
                    }
                };
            });
            imgWrapper.appendChild(changeImageBtn);

            container.appendChild(imgWrapper);

            const cropper = new Cropper(img, {
                aspectRatio: 1,
                viewMode: 2,
                autoCropArea: 1,
            });

            cropperInstances.push(cropper);
        };

        reader.readAsDataURL(file);
    });
});


// Adding product 
document.getElementById('addProduct').addEventListener('click', function (event) {
    event.preventDefault();

    const form = document.getElementById('form1');
    const isValid = validateProductForm(form);

    if (isValid) {
        const formData = new FormData(form);

        const promises = cropperInstances.map((cropper, index) => {
            return new Promise((resolve) => {
                cropper.getCroppedCanvas().toBlob((blob) => {
                    if (blob) {
                        formData.append('images', blob, `croppedImage${index}.png`);
                        console.log(formData)
                    }
                    resolve();
                });
            });
        });

        Promise.all(promises).then(() => {
            fetch('/addProduct', {
                method: 'POST',
                body: formData,
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            showError(data.errors);
                            throw new Error('Validation errors occurred');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    window.location.href = data.redirectUrl;
                })
                .catch(error => {
                    console.error('Error in fetch request:', error);
                });
        });
    }
});
// product form validate 
function validateProductForm(form) {
    const fields = [
        { name: "productName", message: "Product name is required" },
        { name: "productStock", message: "Stock must be a non-negative number", validate: (value) => parseInt(value) >= 0 },
        { name: "productPrice", message: "Price must be a positive number", validate: (value) => parseFloat(value) > 0 },
        { name: "description", message: "Description is required" },
        { name: "category", message: "Please select a category", isSelect: true }
    ];

    let isValid = true;

    fields.forEach(fieldConfig => {
        const field = fieldConfig.isSelect
            ? form.querySelector(`select[name="${fieldConfig.name}"]`)
            : form.querySelector(`input[name="${fieldConfig.name}"], textarea[name="${fieldConfig.name}"]`);

        const errorElement = field.nextElementSibling;
        const value = field.value.trim();

        // Reset previous error state
        errorElement.textContent = '';
        field.classList.remove('is-invalid');

        // Validation check
        if (!value || (fieldConfig.validate && !fieldConfig.validate(value))) {
            errorElement.textContent = fieldConfig.message;
            field.classList.add('is-invalid');
            isValid = false;
        }
    });

    const highlightFields = ['brand', 'model', 'caseMaterial', 'dialColor', 'waterResistance', 'movementType', 'bandMaterial', 'features', 'warranty'];
    highlightFields.forEach(name => {
        const field = form.querySelector(`input[name="highlights[${name}]"]`);
        if (field) {
            const errorElement = field.nextElementSibling;
            errorElement.textContent = '';
            field.classList.remove('is-invalid');

            if (!field.value.trim()) {
                errorElement.textContent = `${name} is required`;
                field.classList.add('is-invalid');
                isValid = false;
            }
        }
    });

    const imageInput = document.getElementById('imageInput');
    const imageErrorElement = imageInput.nextElementSibling;
    imageErrorElement.textContent = '';
    imageInput.classList.remove('is-invalid');
    if (imageInput.files.length < 3) {
        imageErrorElement.textContent = "Please upload at least 3 images";
        imageInput.classList.add('is-invalid');
        isValid = false;
    }

    return isValid;
}

// show error
function showError(message) {
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(errorToast);
    toast.show();
    setTimeout(() => {
        toast.hide();
    }, 3000);
}