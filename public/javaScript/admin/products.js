
// Show Edit Product form
function showEditProduct(productName,productStock,productPrice,description,id) {
    document.getElementById("product-name").value = productName;
    document.getElementById("product-stock").value =productStock;
    document.getElementById("product-price").value =productPrice;
    document.getElementById("product-description").value = description;
    document.getElementById("product-id").value = id;    
}

let cropperInstances = []; // Array to store cropper instances

document.getElementById('imageInput').addEventListener('change', function(event) {
    const files = event.target.files;
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = ""; // Clear previous previews
    cropperInstances = []; // Clear previous cropper instances

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "100%";
            img.id = `cropImage${index}`;
            container.appendChild(img);

            const cropper = new Cropper(img, {
                aspectRatio: 1, 
                viewMode: 2,
                autoCropArea: 1, 
            });

            cropperInstances.push(cropper); // Store the cropper instance
        };
        reader.readAsDataURL(file);
    });
});

document.getElementById('addProduct').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default form submission

    const form = document.getElementById('form1'); // The form element
    const formData = new FormData(form); // Collect form fields

    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }

    // Collect cropped images
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

    // After all the images are cropped and added to formData, submit everything together
    Promise.all(promises).then(() => {
        fetch('/admin/addProduct', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/admin/products'; // Redirect after success
            } else {
                console.error('Error uploading product');
            }
        })
        .catch(error => {
            console.error('Error in fetch request:', error);
        });
    });
});
