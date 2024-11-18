const Category = require('../../model/categoryModel');
const Products = require('../../model/products');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'images',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

const upload = multer({ storage: storage });

// Function to display products 
const productPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;


        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;

        const products = await Products.find()
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit);

        const totalProducts = await Products.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
        const categories = await Category.find();

        res.render('admin/products', {
            products,
            categories,
            currentPage: page,
            totalPages,
            totalProducts,
            activePage: 'products',
            sortBy,
            order
        });

    } catch (err) {
        console.log("product listing error", { err });
    }
};
// Function to add a new product
const addProduct = async (req, res) => {

    let errors = '';
    const { productName, productStock, productPrice, description, category, highlights } = req.body;


    try {

        const existingProduct = await Products.findOne({ productName: productName });
        if (existingProduct) {
            return res.status(400).json({ errors: "Product with the same name already exists." });
        }
  
        const images = [];
        for (const file of req.files) {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'images',
                        transformation: [
                            { width: 500, height: 500, crop: 'limit' },
                            { quality: 'auto' },
                            { fetch_format: 'auto' },
                        ]
                    },
                    (error, result) => {
                        if (error) {
                            return reject(new Error("Image upload failed"));
                        }
                        resolve(result);
                    }
                );

                uploadStream.end(file.buffer);
            });

            console.log('Cloudinary result URL:', uploadResult.secure_url);
            images.push(uploadResult.secure_url);
        }

        console.log('Images array:', images);

        const newProduct = new Products({
            productName,
            productStock,
            productPrice,
            images: images,
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
            },
            maxQtyPerPerson: Math.min(Math.floor(productStock / 3), 10)
        });

        await newProduct.save();
        res.status(200).json({ redirectUrl: '/products' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
// Function to edit an existing product
const editProduct = async (req, res) => {
    const { productName, productStock, productPrice, id, categories, description, highlights } = req.body;

    try {
        const product = await Products.findById(id);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        product.productName = productName;
        product.productStock = productStock;
        product.productPrice = productPrice;
        product.description = description;
        product.category = categories;
        product.maxQtyPerPerson = Math.min(Math.floor(productStock / 3), 10);

        console.log(req.files);

        if (req.files && req.files.length > 0) {

            for (const [index, file] of req.files.entries()) {

                const updatedResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'images',
                            transformation: [
                                { width: 500, height: 500, crop: 'limit' },
                                { quality: 'auto' },
                                { fetch_format: 'auto' }
                            ]
                        },
                        (error, result) => {
                            if (error) {
                                return reject(new Error('Image upload failed'));
                            }
                            resolve(result);
                        }
                    );
                    uploadStream.end(file.buffer);
                });

                const oldImage = product.images[index];

                const newImageName = updatedResult.secure_url;
                if (product.images[index]) {
                    product.images[index] = newImageName;
                } else {
                    product.images.push(newImageName);
                }

                if (oldImage) {
                    const publicId = oldImage.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                }
            }
        }

        if (product.images.length > 3) {
            product.images = product.images.slice(0, 3);
        }

        if (highlights) {
            const { brand, model, caseMaterial, dialColor, waterResistance, movementType, bandMaterial, features, warranty } = highlights;
            product.highlights = {
                brand: brand || product.highlights.brand,
                model: model || product.highlights.model,
                caseMaterial: caseMaterial || product.highlights.caseMaterial,
                dialColor: dialColor || product.highlights.dialColor,
                waterResistance: waterResistance || product.highlights.waterResistance,
                movementType: movementType || product.highlights.movementType,
                bandMaterial: bandMaterial || product.highlights.bandMaterial,
                features: Array.isArray(features) ? features : product.highlights.features,
                warranty: warranty || product.highlights.warranty
            };
        }

        await product.save();
        res.redirect('/products');
    } catch (err) {
        console.error('Error editing product:', err);
        res.status(500).send('Internal Server Error');
    }
};
// Function to delete a product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await Products.findByIdAndUpdate(id, { isDeleted: true });
        res.redirect('/products');
    } catch (err) {
        console.log('error on deleting product');
    }

};
// Function to restore a deleted product
const activeProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await Products.findByIdAndUpdate(id, { isDeleted: false });
        res.redirect('/products');
    } catch (err) {
        console.log('error on deleting product');
    }
};



module.exports = {
    productPage,
    addProduct,
    editProduct,
    deleteProduct,
    activeProduct,
};