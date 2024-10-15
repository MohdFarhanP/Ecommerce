// show edit products

function showEditProduct(productName, productStock, productPrice, description, id, category, highlights, images) {
    // Basic fields
    document.getElementById("productName").value = productName;
    document.getElementById("productStock").value = productStock;
    document.getElementById("productPrice").value = productPrice;
    document.getElementById("productDescription").value = description;
    document.getElementById("productId").value = id;

    // Category selection
    const categorySelect = document.getElementById("productCategories");
    categorySelect.value = category;

    // Highlights fields
    document.getElementById("highlightBrand").value = highlights.brand;
    document.getElementById("highlightModel").value = highlights.model;
    document.getElementById("highlightCaseMaterial").value = highlights.caseMaterial;
    document.getElementById("highlightDialColor").value = highlights.dialColor;
    document.getElementById("highlightDaterResistance").value = highlights.waterResistance;
    document.getElementById("highlightMovementType").value = highlights.movementType;
    document.getElementById("highlightBandMaterial").value = highlights.bandMaterial;
    document.getElementById("highlightFeatures").value = highlights.features.join(", ");
    document.getElementById("highlightWarranty").value = highlights.warranty;

    // Images display and replace functionality
    const imagePreview = document.querySelector(".product-images");
    imagePreview.innerHTML = ""; // Clear previous images
console.log(images);

    images.forEach((image, index) => {
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-wrapper");

        const imgElement = document.createElement("img");
        imgElement.src = `/uploads/${image}`;
        imgElement.width = 100;
        imgElement.height = 100;
        imgElement.className = "m-2";
        imageContainer.appendChild(imgElement);

        // Create file input for image replacement
        const replaceInput = document.createElement("input");
        replaceInput.type = "file";
        replaceInput.name = `replaceImage-${index}`; // Unique name for each replacement
        replaceInput.className = "replace-image-input";
        imageContainer.appendChild(replaceInput);

        imagePreview.appendChild(imageContainer);
    });
}



// Image cropping
let cropperInstances = [];

document.getElementById('imageInput').addEventListener('change', function(event) {
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

        reader.onload = function(e) {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "100%";
            img.id = `cropImage${index}`;
            img.classList.add('img-thumbnail', 'col-4');
            container.appendChild(img);

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
document.getElementById('addProduct').addEventListener('click', function(event) {
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
