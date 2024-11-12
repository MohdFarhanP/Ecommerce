

const Products = require('../../model/products');





// Fetches and displays inventory 
const inventory = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 7;

    try {
        const totalProducts = await Products.countDocuments();
        const products = await Products.find({ isDeleted: false })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        const totalPages = Math.ceil(totalProducts / limit)

        res.render('admin/inventory', {
            products,
            currentPage: page,
            totalPages,
            totalProducts,
            activePage: 'inventory'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
// Handles updating product stock in inventory
const editInventory = async (req, res) => {
    const { id, productName, productStock, productPrice, isFeatured } = req.body;
    try {
        const updateProducut = await Products.findByIdAndUpdate(id, {
            productName,
            productStock,
            productPrice,
            isFeatured,
            maxQtyPerPerson: Math.min(Math.floor(productStock / 3), 10)
        }, { new: true }
        );

        res.redirect('/inventory');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
// Handles deleting a product by marking it as deleted
const deleteInventory = async (req, res) => {
    const { id } = req.body;
    try {
        await Products.findByIdAndUpdate(id, { isDeleted: true });
        res.redirect('/inventory');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
// Updates the stock of a product in the inventory
const updateStock = async (req, res) => {
    const { id, productStock } = req.body;
    try {
        await Products.findByIdAndUpdate(id, {
            productStock,
            maxQtyPerPerson: Math.min(Math.floor(productStock / 3), 10),
        });
        res.redirect('/inventory');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};



module.exports = {
    inventory,
    editInventory,
    deleteInventory,
    updateStock
};