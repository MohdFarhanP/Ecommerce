const Wishlist = require('../../model/whishlistModel');




const wishlist = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/login');
        }

        const whishlist = await Wishlist.findOne({ userId: userId, }).populate('products');
        const products = whishlist ? whishlist.products : [];
        res.render('user/whishList', { products });

    } catch (error) {

        console.log("Whishlist Error:", error);
    }
};
const addWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Please log in first' });
        }

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }


        let wishlist = await Wishlist.findOne({ userId: userId });

        if (!wishlist) {
            wishlist = new Wishlist({ userId: userId, products: [] });
        }


        if (wishlist.products.includes(productId)) {
            return res.status(400).json({ success: false, message: 'Product already in wishlist' });
        }

        wishlist.products.push(productId);
        await wishlist.save();

        return res.status(200).json({ success: true, message: 'Product added to wishlist successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error', error });
    }
};
const removeWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { productId } = req.body;

        console.log('userid :', userId, "productid :", productId);

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Please log in first' });
        }

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const wishlist = await Wishlist.findOne({ userId: userId });

        if (!wishlist) {
            return res.status(400).json({ success: false, message: 'Wishlist not found' });
        }

        const initialLength = wishlist.products.length;
        wishlist.products = wishlist.products.filter(item => item.toString() !== productId);

        if (initialLength === wishlist.products.length) {
            return res.status(400).json({ success: false, message: 'Product not found in wishlist' });
        }

        await wishlist.save();

        return res.status(200).json({ success: true, message: 'Product removed from wishlist successfully' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return res.status(500).json({ success: false, message: 'Server error', error });
    }
};





module.exports = {
    wishlist,
    addWishlist,
    removeWishlist
};