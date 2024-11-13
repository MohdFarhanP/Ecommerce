const Products = require('../../model/products');
const Review = require('../../model/reviewModel');
const Cart = require('../../model/cartModel');
const Wishlist = require('../../model/whishlistModel');
const Coupon = require('../../model/coupenModel');

//load cart page
const cart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = 2;
        const skip = (page - 1) * limit;

        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.render('user/cart', { cartItems: [], message: 'Your cart is empty.' });
        }

        const totalItems = cart.items.length;
        const totalPages = Math.ceil(totalItems / limit);

        const paginatedItems = cart.items.slice(skip, skip + limit).map(item => {
            const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.productPrice;
            const itemTotal = price * item.quantity;
            return {
                product: item.product,
                quantity: item.quantity,
                itemTotal,
                price,
            };
        });

        const totalPrice = paginatedItems.reduce((acc, item) => acc + item.itemTotal, 0);

        const grandTotal = req.session.discountedTotal || totalPrice;
        const productIds = cart.items.map(item => item.product._id);
        const categoryIds = cart.items.map(item => item.product.category);


        // Fetch applicable coupons based on criteria
        const coupons = await Coupon.find({
            expiryDate: { $gte: new Date() },
            usageLimit: { $gt: 0 },
            $or: [
                { applicableProducts: { $in: productIds } },
                { applicableCategories: { $in: categoryIds } }
            ],
            minimumCartValue: { $lte: grandTotal }
        });
        const appliedCouponCode = req.session.appliedCouponCode || null;

        res.render('user/cart', {
            cartItems: paginatedItems,
            totalPrice,
            grandTotal,
            currentPage: page,
            totalPages,
            coupons,
            appliedCouponCode
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
// function for remove cart item
const removeCartItem = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.params.id;

        const cart = await Cart.findOne({ user: userId });
        const itemToRemove = cart.items.find(item => item.product.toString() === productId);

        if (!itemToRemove) {
            return res.redirect('/cart');
        }

        await Cart.updateOne(
            { user: userId },
            { $pull: { items: { product: productId } } }
        );

        const product = await Products.findById(productId);
        product.productStock += itemToRemove.quantity;
        product.maxQtyPerPerson = Math.min(Math.floor(product.productStock / 3), 10);
        await product.save();

        res.redirect('/cart');
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.render('error', { message: 'Error removing product from cart' });
    }
};
// function for add to cart
const addToCart = async (req, res) => {
    const { productId, quantity, } = req.body;
    const userId = req.session.userId;

    try {
        const product = await Products.findById(productId)
            .populate('category offersApplied');



        if (!product || product.isDeleted || product.productStock < quantity) {
            const relatedProducts = await Products.find({ category: product.category }).limit(5).lean();
            const reviews = await Review.find({ product: productId }).lean();
            const totalRating = reviews.length;
            const averageRating = totalRating > 0 ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalRating).toFixed(1) : 0;

            return res.render('user/singleProduct', {
                msg: 'Product is unavailable or out of stock',
                product,
                relatedProducts,
                reviews,
                totalRating,
                averageRating
            });
        }

        // Determine final price to use in cart
        const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.productPrice;

        // Check if quantity exceeds stock or maxQtyPerPerson
        if (quantity > product.maxQtyPerPerson || quantity > product.productStock) {
            const relatedProducts = await Products.find({ category: product.category }).limit(5).lean();
            const reviews = await Review.find({ product: productId }).lean();
            const totalRating = reviews.length;
            const averageRating = totalRating > 0 ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalRating).toFixed(1) : 0;

            return res.render('user/singleProduct', {
                msg: `Quantity exceeds limit. Max per person: ${product.maxQtyPerPerson}, Available stock: ${product.productStock}`,
                product,
                relatedProducts,
                reviews,
                totalRating,
                averageRating
            });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingItem = cart.items.find(item => item.product.toString() === productId);

        if (existingItem) {
            existingItem.quantity += Number(quantity);
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: finalPrice,  // Use final calculated price
            });
        }

        await cart.save();
        product.productStock -= quantity;
        product.maxQtyPerPerson = Math.min(Math.floor(product.productStock / 3), 10);
        await product.save();

        await Wishlist.updateOne(
            { userId: userId },
            { $pull: { products: productId } }
        );

        res.redirect('/cart');

    } catch (err) {
        console.error('Error adding product to cart:', err);
        res.status(500).send('Internal Server Error');
    }
};
// for updating quatity 
const updateCartQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        const product = await Products.findById(productId);

        if (!cart || !product) {
            return res.json({ success: false, message: 'Cart or product not found' });
        }

        if (quantity > product.maxQtyPerPerson) {
            return res.json({ success: false, message: `You can only add up to ${product.maxQtyPerPerson} units of this product.` });
        }

        const itemIndex = cart.items.findIndex(item => item.product.equals(productId));

        if (itemIndex > -1) {
            const oldQuantity = cart.items[itemIndex].quantity;
            const quantityDifference = quantity - oldQuantity;

            if (quantityDifference > 0) {
                if (product.productStock < quantityDifference) {
                    return res.json({ success: false, message: 'Not enough stock available' });
                }
                product.productStock -= quantityDifference;
                product.maxQtyPerPerson = Math.min(Math.floor(product.productStock / 3), 10);
            } else {
                product.productStock += Math.abs(quantityDifference);
                product.maxQtyPerPerson = Math.min(Math.floor(product.productStock / 3), 10);
            }

            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            await product.save();

            const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.productPrice;
            const updatedItemPrice = effectivePrice * quantity;

            const cartTotalPrice = cart.items.reduce((total, item) => {
                const itemProduct = item.product;

                const itemEffectivePrice = itemProduct.discountPrice > 0 ? itemProduct.discountPrice : itemProduct.productPrice; // Use stored discount price or original price
                return total + (itemEffectivePrice * item.quantity);
            }, 0);

            return res.json({
                success: true,
                message: 'Cart quantity updated',
                updatedItemPrice,
                cartTotalPrice
            });
        }

        return res.json({ success: false, message: 'Product not found in cart' });
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.json({ success: false, message: 'Error updating cart quantity' });
    }
};






module.exports = {
    cart,
    addToCart,
    removeCartItem,
    updateCartQuantity,
};