const bcrypt = require('bcrypt')
const Admin = require('../module/adminModel');
const saltRound = 10;
const User = require('../module/userModel');
const Category = require('../module/categoryModel');
const Products = require('../module/products');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const Order = require('../module/orderModel')
const fs = require('fs'); 

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const loadLogin = (req, res) => {
    res.render('admin/login');
};
const loginBtn = async (req, res) => {
    try {
        const { password, email } = req.body;

        const adminExist = await Admin.findOne({ email });
        if (!adminExist) {
            return res.render("admin/login", { msg: 'admin not found' });
        }

        const isMatch = await bcrypt.compare(password, adminExist.password);
        if (!isMatch) {
            return res.render('admin/login', { msg: 'password is incorrect' });
        }
        req.session.admin = true;
        res.redirect("/users");
    } catch (error) {
        console.error(error)
    }
};
const logoutBtn = async (req, res) => {
    req.session.admin = null;
    res.redirect('/login');
}
const usersPage = async (req, res) => {
    try {
        const users = await User.find({});
        res.render('admin/users', { data: users })
    } catch (err) {
        res.status(500).send('Error fetching Users');
    }
};
const blockUser = async (req, res) => {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, { isBlocked: true });
    res.redirect('/users');unblockUser
};
const unblockUser = async (req, res) => {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, { isBlocked: false });
    res.redirect('/users');
};
const categoryPage = async (req, res) => {
    const category = await Category.find({});
    res.render('admin/category', { category });
};
const addCategory = async (req, res) => {
    const { brandName, displayType, bandColor } = req.body;

    try {
        const existingCategory = await Category.findOne({ brandName, displayType, bandColor });

        if (existingCategory) {
            return res.status(400).json({
                errorMessage: 'Category with the same Brand, Display Type, and Band Color already exists.'
            });
        }

        const newCategory = new Category({
            brandName,
            displayType,
            bandColor
        });

        await newCategory.save();
        return res.status(200).json({ message: "Category added successfully" });
    } catch (err) {
        console.log("Adding error", err);
        return res.status(500).json({
            errorMessage: 'Server error occurred while adding category.'
        });
    }
};
const editCategory = async (req, res) => {
    try {
        const { brandName, displayType, bandColor, id } = req.body;

        if (!brandName || !displayType || !bandColor) {
            return res.json({ error: 'All fields are required' });
        }
        const existingCategory = await Category.findOne({ brandName, _id: { $ne: id } });
        if (existingCategory) {

            return res.json({ error: 'Brand name already exists. Please choose a different one.' });
        }

        await Category.findByIdAndUpdate(id, { brandName, displayType, bandColor });
        res.json({ success: true });

    } catch (err) {
        console.error('Error on the edit category:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;
        await Category.findByIdAndUpdate(id,
            { isDelete: true }
        );
        res.redirect('/category');
    } catch (err) {
        console.log('error on deleting category');
    }
};
const activeCategory = async (req, res) => {
    try {
        const { id } = req.body;
        await Category.findByIdAndUpdate(id,
            { isDelete: false }
        );
        res.redirect('/category');
    } catch (err) {
        console.log('error on deleting category');
    }
}
const productPage = async (req, res) => {
    try {
        const products = await Products.find();
        const categories = await Category.find();
        res.render('admin/products', { products, categories });

    } catch (err) {
        console.log("product listing error", { err })
    }
};
const addProduct = async (req, res) => {
    const errors = [];

    // Validate required fields
    const { productName, productStock, productPrice, description, category, highlights } = req.body;

    if (!productName) errors.push("Product name is required.");
    if (!productStock) errors.push("Product stock is required.");
    if (!productPrice) errors.push("Product price is required.");
    if (!description) errors.push("Description is required.");
    if (!category) errors.push("Category is required.");
    if (!highlights.brand) errors.push("Brand is required ");
    if (!highlights.model) errors.push("Model is required ");
    if (!highlights.caseMaterial) errors.push("caseMaterial is required ");
    if (!highlights.dialColor) errors.push("dialColor is required");
    if (!highlights.waterResistance) errors.push("waterResistance ");
    if (!highlights.movementType) errors.push("movementType is required");
    if (!highlights.caseMaterial) errors.push("caseMaterial is required ");
    if (!highlights.bandMaterial) errors.push("bandMaterial is required ");
    if (!highlights.features) errors.push("features is required");
    if (!highlights.warranty) errors.push("warranty is required");

    
    if (!req.files ||req.files.length !== 3 ){
        errors.push('Please upload at least 3 images.');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

 
    try {

        const existingProduct = await Products.findOne({ productName: productName });
        if (existingProduct) {
            return res.status(400).json({ errors: ["Product with the same name already exists."] });
        }

        const images = [];
        for (const file of req.files) {
            const newImgName = `${Date.now()}-${file.originalname}`;
            await sharp(file.buffer)
                .resize(500, 500) 
                .toFile(`./uploads/${newImgName}`);
            images.push(newImgName);
        }

        const newProduct = new Products({
            productName,
            productStock,
            productPrice,
            images,
            category,
            description,
            highlights: {
                brand: highlights.brand,
                model: highlights.model,
                caseMaterial: highlights.caseMaterial,
                dialColor: highlights.dialColor,
                waterResistance: highlights.waterResistance,
                movementType: highlights.movementType,
                bandMaterial: highlights.bandMaterial,
                features: highlights.features.split(','),
                warranty: highlights.warranty
            }
        });

        await newProduct.save();
        res.status(200).json({ redirectUrl: '/products' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const editProduct = async (req, res) => {
    try {
        const { productName, productStock, productPrice, id, categories, description, highlights } = req.body;
        const product = await Products.findById(id);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Update basic product details
        product.productName = productName;
        product.productStock = productStock;
        product.productPrice = productPrice;
        product.description = description;
        product.category = categories;

        // Handle image replacement
        if (req.files && req.files.length > 0) {
            for (const [index, file] of req.files.entries()) {
                const oldImage = product.images[index];
                const newImageName = `${Date.now()}-${file.originalname}`;

                // Process the image with sharp
                await sharp(file.buffer)
                    .resize(500, 500)
                    .toFile(path.join(__dirname, '../uploads/', newImageName));

                // Replace the old image with the new one in the array
                product.images[index] = newImageName;

                // Remove old image from the filesystem if it exists
                if (oldImage) {
                    fs.unlinkSync(path.join(__dirname, '../uploads/', oldImage));
                }
            }
        }

        // Ensure at least 3 images are in place
        if (product.images.length > 3) {
            product.images = product.images.slice(0, 3); 
        }

        // Update highlights if available
        if (highlights) {
            product.highlights = highlights;
        }

        // Save the updated product
        await product.save();
        res.redirect('/products');
    } catch (err) {
        console.error('Error on the edit products', err);
        res.status(500).send('Internal Server Error');
    }
};
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await Products.findByIdAndUpdate(id, { isDeleted: true });
        res.redirect('/products');
    } catch (err) {
        console.log('error on deleting product');
    }

};
const activeProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await Products.findByIdAndUpdate(id, { isDeleted: false });
        res.redirect('/products');
    } catch (err) {
        console.log('error on deleting product');
    }
};
const orders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'userId',
                select: 'userName email',
            })
            .populate({
                path: 'shippingAddress',
                select: 'addressLine city state postalCode country',
            })
            .populate({
                path: 'products.productId',
                select: 'productName',
            })
            .exec();
        res.render('admin/order', { orders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
const changeOrderStatus = async (req, res) => {
    const { orderId, status } = req.body;

    try {
        await Order.findByIdAndUpdate(orderId, { status });
        res.redirect('/orders');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
const cancelOrder = async (req, res) => {
    const { orderId } = req.body;

    try {
        const order = await Order.findById(orderId);


        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await Order.findByIdAndDelete(orderId);
        res.redirect('/orders');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
const inventry = async (req, res) => {
    try {
        const products = await Products.find({ isDeleted: false });
        res.render('admin/inventory', { products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
}
const editInventry = async (req, res) => {
    const { id, productName, productStock, productPrice, isFeatured } = req.body;
    try {
        await Products.findByIdAndUpdate(id, { productName, productStock, productPrice, isFeatured });
        res.redirect('/inventory');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
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
const updateStock = async (req, res) => {
    const { id, productStock } = req.body;
    try {
        await Products.findByIdAndUpdate(id, { productStock });
        res.redirect('/inventory');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};
module.exports = {
    loadLogin,
    loginBtn,
    usersPage,
    categoryPage,
    addCategory,
    editCategory,
    deleteCategory,
    activeCategory,
    productPage,
    addProduct,
    upload,
    blockUser,
    unblockUser,
    editProduct,
    deleteProduct,
    logoutBtn,
    orders,
    changeOrderStatus,
    cancelOrder,
    inventry,
    editInventry,
    deleteInventory,
    updateStock,
    activeProduct,

}