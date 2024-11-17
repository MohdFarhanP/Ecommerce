const Category = require('../../model/categoryModel');
const Products = require('../../model/products');
const Offer = require('../../model/offerModel');


// Fetches and displays offers
const offer = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const totalOffers = await Offer.countDocuments();

        const totalPages = Math.ceil(totalOffers / limit);

        const offers = await Offer.find()
            .skip(skip)
            .limit(limit)
            .populate('applicableProducts', 'productName')
            .populate('applicableCategories', 'brandName');

        const products = await Products.find({ isDeleted: false });
        const categories = await Category.find({ isDelete: false });
        console.log(offers);

        res.render('admin/offer', {
            offers,
            products,
            categories,
            currentPage: page,
            totalPages,
            totalOffers,
            activePage: 'offer'
        });
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).send('Internal Server Error');
    }
};
// Creates a new offer
const createOffer = async (req, res) => {
    const { discountType, discountValue, applicableProducts, applicableCategories, expirationDate, isActive, description } = req.body;

    if (!discountType || !discountValue || !expirationDate || !description) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const numericDiscountValue = Number(discountValue);
    if (isNaN(numericDiscountValue)) {
        return res.status(400).json({ message: 'Invalid discount value' });
    }

    try {
        const offer = new Offer({
            discountType,
            discountValue: numericDiscountValue,
            description,
            applicableProducts: applicableProducts || [],
            applicableCategories: applicableCategories || [],
            expirationDate,
            isActive: isActive === 'on'
        });

        await offer.save();

        let productsToUpdate = [];

        if (applicableProducts && applicableProducts.length > 0) {
            productsToUpdate = await Products.find({ _id: { $in: applicableProducts } });
        }

        if (applicableCategories && applicableCategories.length > 0) {
            const productsInCategory = await Products.find({ category: { $in: applicableCategories } });
            productsToUpdate.push(...productsInCategory);
        }

        for (const product of productsToUpdate) {
            let discountPrice;

            const productPrice = Number(product.productPrice);
            if (isNaN(productPrice)) {
                console.error(`Product ID ${product._id} has an invalid price: ${product.productPrice}`);
                continue;
            }

            if (discountType === 'percentage') {
                discountPrice = productPrice - (productPrice * (numericDiscountValue / 100));
            } else if (discountType === 'fixed') {
                discountPrice = productPrice - numericDiscountValue;
            } else {
                console.error(`Invalid discount type for product ID ${product._id}`);
                continue;
            }

            discountPrice = Math.max(discountPrice, 0);

            console.log(`Updated discount price for product ID: ${product._id} to ${discountPrice}`);

            await Products.updateOne(
                { _id: product._id },
                {
                    $set: { discountPrice, },
                    $addToSet: { offersApplied: offer._id },
                },
                { upsert: true }
            );

        }

        res.status(201).json({ message: 'Offer created successfully', offer });
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
// Edits an existing offer 
const editOffer = async (req, res) => {
    try {
        const { offerId, discountType, discountValue, expirationDate, isActive, description } = req.body;

        let offer = await Offer.findById(offerId);

        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        // Update the offer fields
        offer.discountType = discountType;
        offer.discountValue = discountValue;
        offer.expirationDate = expirationDate;
        offer.description = description;
        offer.isActive = isActive === 'true';

        await offer.save();

        // Find all products linked to this offer
        const productsToUpdate = await Products.find({ offersApplied: offerId });

        for (const product of productsToUpdate) {
            let discountPrice = product.price; // Default to the original price

            if (offer.isActive) {
                if (discountType === 'percentage') {
                    discountPrice = product.price - (product.price * (discountValue / 100));
                } else if (discountType === 'fixed') {
                    discountPrice = product.price - discountValue;
                }

                discountPrice = Math.max(discountPrice, 0); // Ensure price doesn't go negative
            }

            await Products.updateOne(
                { _id: product._id },
                {
                    $set: { discountPrice: offer.isActive ? discountPrice : null }
                }
            );
        }

        res.status(200).json({ success: true, message: 'Offer updated successfully' });
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ success: false, message: 'Server error, please try again later' });
    }
};
// Deletes an offer
const deleteOffer = async (req, res) => {
    try {
        const { offerId } = req.body;

        // Delete the offer
        const deletedOffer = await Offer.findByIdAndDelete(offerId);
        if (!deletedOffer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        // Remove the offerId from the offersApplied field of products
        await Products.updateMany(
            { offersApplied: offerId },
            { $pull: { offersApplied: offerId } }
        );

        res.redirect('/offer');
    } catch (err) {
        console.error('Error deleting offer:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    offer,
    createOffer,
    editOffer,
    deleteOffer
};