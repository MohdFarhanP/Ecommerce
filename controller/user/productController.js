const User = require("../../model/userModel");
const Products = require('../../model/products');
const Category = require('../../model/categoryModel');
const Review = require('../../model/reviewModel');


const homePage = (req, res) => {
    console.log(req.session.userId);

    res.render('user/home');
};
const gestUser = (req, res) => {
    res.redirect('/home')
};
const productList = async (req, res) => {
    const productsPerPage = 6;
    const page = parseInt(req.query.page) || 1;

    try {
        const totalProducts = await Products.countDocuments({ isDeleted: false });
        const totalPages = Math.ceil(totalProducts / productsPerPage);

        const products = await Products.find({ isDeleted: false })
            .populate('offersApplied')
            .skip((page - 1) * productsPerPage)
            .limit(productsPerPage);

        const productsWithDiscounts = products.map(product => {
            let hasDiscount = null;
            let discountLabel = '';

            if (product.offersApplied && product.offersApplied.length > 0) {
                const activeOffer = product.offersApplied[0];

                if (activeOffer.discountType && activeOffer.discountValue) {
                    if (activeOffer.discountType === 'percentage') {
                        hasDiscount = product.productPrice * (1 - activeOffer.discountValue / 100);
                        discountLabel = `${activeOffer.discountValue}% off`;
                    } else if (activeOffer.discountType === 'fixed') {
                        hasDiscount = product.productPrice - activeOffer.discountValue;
                        discountLabel = `₹${activeOffer.discountValue} off`;
                    }
                    hasDiscount = Math.max(hasDiscount, 0);
                }
            }

            return {
                ...product.toObject(),
                finalPrice: hasDiscount ? hasDiscount.toFixed(2) : product.productPrice.toFixed(2),
                hasDiscount: hasDiscount ? hasDiscount.toFixed(2) : null,
                discountLabel,
            };
        });

        res.render('user/ProductList', {
            products: productsWithDiscounts,
            currentPage: page,
            totalPages,
        });
    } catch (err) {
        console.error('Error fetching product list:', err);
    }
};
const filterProducts = async (req, res) => {
    try {
        const { searchQuery, brands = [], displayTypes = [], colors = [], showOutOfStock, sortCriteria } = req.body;
        const minPrice = parseInt(req.body.minPrice, 10) || 0;
        const maxPrice = parseInt(req.body.maxPrice, 10) || Infinity;

        const query = {
            productPrice: { $gte: minPrice, $lte: maxPrice },
            isDeleted: false
        };

        if (!showOutOfStock) {
            query.productStock = { $gt: 0 };
        } else {
            query.productStock = { $gte: 0 };
        }

        let categoryIds = [];
        if (brands.length > 0 || displayTypes.length > 0 || colors.length > 0 || searchQuery) {
            const categoryQuery = {};

            if (brands.length > 0) {
                categoryQuery.brandName = { $in: brands };
            }
            if (displayTypes.length > 0) {
                categoryQuery.displayType = { $in: displayTypes };
            }
            if (colors.length > 0) {
                categoryQuery.bandColor = { $in: colors };
            }

            if (searchQuery) {
                categoryQuery.$or = [
                    { brandName: { $regex: searchQuery, $options: 'i' } },
                    { bandColor: { $regex: searchQuery, $options: 'i' } },
                    { displayType: { $regex: searchQuery, $options: 'i' } }
                ];
            }

            const matchingCategories = await Category.find(categoryQuery).collation({ locale: 'en', strength: 2 });
            categoryIds = matchingCategories.map(category => category._id);
        }

        if (categoryIds.length > 0) {
            query.category = { $in: categoryIds };
        }

        if (searchQuery) {
            query.$or = [
                { productName: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { "highlights.brand": { $regex: searchQuery, $options: 'i' } },
                { "highlights.model": { $regex: searchQuery, $options: 'i' } }
            ];
        }

        let sortQuery = {};
        let collation = { locale: 'en', strength: 2 };
        switch (sortCriteria) {
            case 'popularity':
                sortQuery = { popularity: -1 };
                break;
            case 'priceLowToHigh':
                sortQuery = { productPrice: 1 };
                break;
            case 'priceHighToLow':
                sortQuery = { productPrice: -1 };
                break;
            case 'averageRating':
                sortQuery = { averageRating: -1 };
                break;
            case 'featured':
                sortQuery = { isFeatured: -1 };
                break;
            case 'newArrivals':
                sortQuery = { createdAt: -1 };
                break;
            case 'aToZ':
                sortQuery = { productName: 1 };
                break;
            case 'zToA':
                sortQuery = { productName: -1 };
                break;
            default:
                sortQuery = {};
                break;
        }

        const filteredProducts = await Products.find(query)
            .populate('offersApplied')
            .sort(sortQuery)
            .collation(collation);

        const productsWithDiscounts = filteredProducts.map(product => {
            let hasDiscount = null;
            let discountLabel = '';

            if (product.offersApplied && product.offersApplied.length > 0) {
                const activeOffer = product.offersApplied[0];

                if (activeOffer.discountType && activeOffer.discountValue) {
                    if (activeOffer.discountType === 'percentage') {
                        hasDiscount = product.productPrice * (1 - activeOffer.discountValue / 100);
                        discountLabel = `${activeOffer.discountValue}% off`;
                    } else if (activeOffer.discountType === 'fixed') {
                        hasDiscount = product.productPrice - activeOffer.discountValue;
                        discountLabel = `₹${activeOffer.discountValue} off`;
                    }
                    hasDiscount = Math.max(hasDiscount, 0); // Ensure the price does not go below 0
                }
            }

            return {
                ...product.toObject(),
                finalPrice: hasDiscount ? hasDiscount.toFixed(2) : product.productPrice.toFixed(2),
                hasDiscount: hasDiscount ? hasDiscount.toFixed(2) : null,
                discountLabel,
            };
        });

        res.json(productsWithDiscounts);

    } catch (err) {
        console.error('Filter Products Error:', err);
        res.status(500).json({ message: 'Error occurred while filtering products' });
    }
};
const productPage = async (req, res) => {

    const getProductRatingSummary = async (ProductId) => {
        const reviews = await Review.find({ productId: ProductId });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
            : 0;

        await Products.findByIdAndUpdate(ProductId, { averageRating: averageRating.toFixed(1) });

        return {
            averageRating: averageRating.toFixed(1),
            totalReviews,
        };
    };

    const incrementProductPopularity = async (ProductId) => {
        await Products.findByIdAndUpdate(ProductId, { $inc: { popularity: 1 } });
    };

    try {
        const currentProductId = req.params.id;

        await incrementProductPopularity(currentProductId);

        const product = await Products.findById(currentProductId).populate('offersApplied');
        const reviews = await Review.find({ productId: currentProductId });
        const priceRange = 0.7 * product.productPrice;

        const ratingSummary = await getProductRatingSummary(currentProductId);

        const relatedProducts = await Products.find({
            productPrice: {
                $gte: product.productPrice - priceRange,
                $lte: product.productPrice + priceRange
            },
            _id: { $ne: currentProductId },
            isDeleted: false
        }).limit(4);

        // Access the discount details from the first offer in offersApplied if it exists
        const firstOffer = Array.isArray(product.offersApplied) && product.offersApplied[0];
        const hasDiscount = firstOffer && product.discountPrice && product.discountPrice < product.productPrice;
        const discountLabel = hasDiscount
            ? (firstOffer.discountType === 'percentage' && firstOffer.discountValue
                ? `${firstOffer.discountValue}% off`
                : firstOffer.discountValue
                    ? `₹${firstOffer.discountValue} off`
                    : '')
            : '';

        res.render('user/singleProduct', {
            product,
            discountedPrice: hasDiscount ? product.discountPrice.toFixed(2) : product.productPrice.toFixed(2),
            discountLabel,
            hasDiscount,
            relatedProducts,
            reviews,
            averageRating: ratingSummary.averageRating,
            totalReviews: ratingSummary.totalReviews,
        });
    } catch (err) {
        console.error('Error fetching single product details:', err);
        res.status(500).json({ error: "An error occurred while fetching the product details" });
    }
};
const review = async (req, res) => {
    try {
        const { customerName, email, rating, comment } = req.body;
        const productid = req.params.id;

        const newReview = await Review({
            productId: productid,
            customerName,
            email,
            rating,
            comment,
        });
        await newReview.save();
        res.redirect(`/singleProduct/${productid}`);
    } catch (err) {

    }
};




module.exports = {
    homePage,
    productList,
    filterProducts,
    productPage,
    review,
    gestUser
};