let cropper;
let currentReplaceInput = null; // To track which image is being replaced

// Function to show the product details in the modal for editing
function showEditProduct(productName, productStock, productPrice, description, id, category, highlights, images) {
    // Populate basic fields
    document.getElementById("productName").value = productName;
    document.getElementById("productStock").value = productStock;
    document.getElementById("productPrice").value = productPrice;
    document.getElementById("productDescription").value = description;
    document.getElementById("productId").value = id;

    // Set the category
    document.getElementById("productCategories").value = category;

    // Set product highlights
    document.getElementById("highlightBrand").value = highlights.brand;
    document.getElementById("highlightModel").value = highlights.model;
    document.getElementById("highlightCaseMaterial").value = highlights.caseMaterial;
    document.getElementById("highlightDialColor").value = highlights.dialColor;
    document.getElementById("highlightWaterResistance").value = highlights.waterResistance;
    document.getElementById("highlightMovementType").value = highlights.movementType;
    document.getElementById("highlightBandMaterial").value = highlights.bandMaterial;
    document.getElementById("highlightFeatures").value = highlights.features.join(", ");
    document.getElementById("highlightWarranty").value = highlights.warranty;

    // Display existing images and add replace functionality
    const imagePreview = document.querySelector(".product-images");
    imagePreview.innerHTML = "";  // Clear current images

    images.forEach((image, index) => {
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-wrapper");

        // Display the current image
        const imgElement = document.createElement("img");
        imgElement.src = `/uploads/${image}`;
        imgElement.width = 100;
        imgElement.height = 100;
        imgElement.className = "m-2";
        imageContainer.appendChild(imgElement);

        // Add file input for replacing the image
        const replaceInput = document.createElement("input");
        replaceInput.type = "file";
        replaceInput.className = "replace-image-input";
        replaceInput.name = `images[${index}]`;
        replaceInput.addEventListener("change", (event) => openCropper(event.target, index));

        imageContainer.appendChild(replaceInput);
        imagePreview.appendChild(imageContainer);
    });
}

// Open the cropper when a new image is selected
function openCropper(input, index) {
    const file = input.files[0];
    currentReplaceInput = input;  // Track which input is being updated

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageToCrop = document.getElementById('imageToCrop');
            imageToCrop.src = e.target.result;

            // Initialize or reinitialize the cropper
            if (cropper) cropper.destroy();
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1
            });

            showCropperModal();
        };
        reader.readAsDataURL(file);
    }
}

// Crop the image and update the file input
document.getElementById('cropImage').addEventListener('click', function () {
    if (cropper) {
        const canvas = cropper.getCroppedCanvas({
            width: 500,
            height: 500
        });

        canvas.toBlob((blob) => {
            const croppedFile = new File([blob], "croppedImage.png", { type: "image/png" });

            // Use DataTransfer to simulate file input behavior
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(croppedFile);

            // Update the file input with the cropped file
            currentReplaceInput.files = dataTransfer.files;

            hideCropperModal();
        });
    }
});

// Show the cropper modal
function showCropperModal() {
    const cropperModal = new bootstrap.Modal(document.getElementById('cropperModal'));
    cropperModal.show();
}

// Hide the cropper modal
function hideCropperModal() {
    const cropperModal = bootstrap.Modal.getInstance(document.getElementById('cropperModal'));
    cropperModal.hide();
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
            alert(`${file.name} is not a valid image file. Please upload images only.`);
            event.target.value = '';
            return;
        }
        validImages.push(file);
    }

    if (validImages.length > 3) {
        alert('You can only upload a maximum of 3 images.');
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
                    const newFile = e.target.files[0];
                    if (newFile && newFile.type.startsWith('image/')) {
                        const newReader = new FileReader();
                        newReader.onload = function (event) {
                            img.src = event.target.result; // Replace the image source
                            cropperInstances[index].replace(event.target.result); // Replace cropper image
                        };
                        newReader.readAsDataURL(newFile);
                    } else {
                        alert("Invalid image file");
                    }
                };
            });
            imgWrapper.appendChild(changeImageBtn);

            // Append to container
            container.appendChild(imgWrapper);

            // Cropper initialization
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
    const formData = new FormData(form);

    const promises = cropperInstances.map((cropper, index) => {
        return new Promise((resolve) => {
            cropper.getCroppedCanvas().toBlob((blob) => {
                if (blob) {
                    formData.append('images', blob, `croppedImage${index}.png`);
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
                        displayErrors(data.errors);
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
            })
    });
});

function displayErrors(errors) {
    const errorContainer = document.getElementById('addProductError');
    errorContainer.innerHTML = '';
    errors.forEach(error => {
        const errorItem = document.createElement('div');
        errorItem.textContent = error;
        errorContainer.appendChild(errorItem);
    });
    errorContainer.style.display = 'block';
}
