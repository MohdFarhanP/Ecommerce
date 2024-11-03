// event delegation used for selecting each submited form 

document.addEventListener('DOMContentLoaded', function () {

    const wishlistForms = document.querySelectorAll('.removeWishlistForm');
    console.log('hai')
    if (wishlistForms.length > 0) {
        console.log(`Found ${wishlistForms.length} wishlist forms.`);
        wishlistForms.forEach(function (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                console.log('Remove Wishlist Form submitted.');

                const productId = form.querySelector('input[name="productId"]').value;
                console.log('Product ID:', productId);

                removeFromWishlist(productId);
            });
        });
    } else {
        console.log('No wishlist forms found.');
    }
});

function removeFromWishlist(productId) {
    console.log('removewhislistfun:', productId)
    fetch('/wishlistRemove', {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}, ${response.message}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {

                showToast('Success', data.message);

                const productElement = document.querySelector(`#wishlist-item-${productId}`);
                if (productElement) {
                    productElement.remove();
                }

                const remainingItem = document.querySelectorAll('.wishlistItem');
                if (remainingItem.length == 0) {
                    location.reload()
                }

            } else {
                console.error('Failed to remove product from wishlist');
                showToast('Error', data.message);
            }
        })
        .catch(err => {
            console.error('Error:', err);
            showToast('Error', 'An error occurred while removing from wishlist.');
        });
}

// Function to show toast
function showToast(title, message) {
    const toastTitle = document.getElementById('toast-title');
    const toastBody = document.getElementById('toast-body');
    const toastElement = document.getElementById('toast');

    toastTitle.textContent = title;
    toastBody.textContent = message;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}
