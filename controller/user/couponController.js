

const Products = require('../../model/products');
const Category = require('../../model/categoryModel');
const Cart = require('../../model/cartModel');
const Coupon = require('../../model/coupenModel');


// function for checking the coupon applicability 
async function checkCouponApplicability(cart, couponCode) {
    try {
        const coupon = await Coupon.findOne({ code: couponCode });

        if (!coupon) {
            return { valid: false, message: 'Invalid coupon code' };
        }


        if (new Date() > coupon.expirationDate) {
            return { valid: false, message: 'Coupon has expired' };
        }

        const appliesToAllProducts = coupon.applicableProducts.length === 0;
        const appliesToAllCategories = coupon.applicableCategories.length === 0;
        console.log(appliesToAllProducts, appliesToAllCategories);

        // Check if the coupon applies to products or categories in the cart
        let applicable = false;
        for (const item of cart.items) {

            const product = item.product;

            const isProductApplicable = appliesToAllProducts || coupon.applicableProducts.includes(product._id);
            const isCategoryApplicable = appliesToAllCategories || coupon.applicableCategories.includes(product.category);


            if (isProductApplicable || isCategoryApplicable) {
                applicable = true;
                break;
            }
        }

        if (!applicable) {
            return { valid: false, message: 'Coupon is not applicable to your cart' };
        }

        return { valid: true, discountValue: coupon.discountValue, discountType: coupon.discountType };

    } catch (error) {
        console.error('Error checking coupon:', error);
        return { valid: false, message: 'Error processing the coupon' };
    }
};
// function for apply coupon 
function applyCoupon(cart, discountValue, discountType) {
    console.log(discountValue, discountType);

    let total = cart.items.reduce((sum, item) => {
        return sum + (item.quantity * item.product.productPrice);
    }, 0);

    if (discountType === 'percentage') {
        total = total - (total * (discountValue / 100));
    } else if (discountType === 'fixed') {
        total = total - discountValue;
    }

    total = Math.max(0, total);

    return total;
};
//for removing coupon
const removeCoupon = async (req, res) => {
    try {
        const userId = req.session.userId;

        const cart = await getCart(userId);
        if (!cart) {
            return res.status(400).json({ success: false, message: 'Cart not found' });
        }

        const totalPrice = cart.items.reduce((acc, item) => acc + (item.quantity * item.product.productPrice), 0);
        const deliveryCharge = 50;
        const grandTotal = totalPrice + deliveryCharge;

        req.session.discountedTotal = null;
        req.session.appliedCouponCode = null;

        return res.json({ success: true, grandTotal });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error removing coupon' });
    }
};
// controller for the coupon apply
const couponApply = async (req, res) => {
    const userId = req.session.userId;
    const { couponCode } = req.body;

    try {
        const cart = await getCart(userId);
        if (!cart) {
            return res.status(400).json({ success: false, message: 'Cart not found' });
        }

        const couponCheck = await checkCouponApplicability(cart, couponCode);
        if (!couponCheck.valid) {
            return res.status(400).json({ success: false, message: couponCheck.message });
        }

        const finalTotal = applyCoupon(cart, couponCheck.discountValue, couponCheck.discountType);

        req.session.discountedTotal = finalTotal;
        req.session.appliedCouponCode = couponCode;
        return res.json({ success: true, finalTotal, message: 'Coupon applied successfully!' });

    } catch (error) {
        return res.status(500).json({ success: false, appliedCouponCode: couponCode, message: 'Error applying coupon' });
    }
};
// getting cart function
async function getCart(userId) {
    try {
        const cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'productName category productPrice',
        }).exec();

        return cart;
    } catch (error) {
        console.error('Error fetching cart:', error);
        return null;
    }
};



module.exports = {
    couponApply,
    removeCoupon,
    checkCouponApplicability,
    applyCoupon,
    getCart
};
