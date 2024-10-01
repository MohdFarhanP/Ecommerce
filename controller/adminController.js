const bcrypt = require('bcrypt')
const Admin = require('../module/adminModel');
const saltRound = 10;
const User = require('../module/userModel');
const Category = require('../module/categoryModel');
const Products = require('../module/products');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({storage:storage});

const loadLogin = (req, res) => {
    res.render('admin/login');
};
const loginBtn = async (req, res) => {
    try {
        const { userName, password, email } = req.body;

        const adminExist = await Admin.findOne({ userName, email });
        if (!adminExist) {
            return res.render("admin/login", { msg: 'admin not found' });
        }

        const isMatch = await bcrypt.compare(password, adminExist.password);
        if (!isMatch) {
            return res.render('admin/login', { msg: 'password is incorrect' });
        }
        req.session.admin = true;
        res.redirect("/admin/users");
    } catch (error) {
        console.error(error)
    }
};
const usersPage = async (req, res) => {
    try {
        const users = await User.find({});
        res.render('admin/users', { data: users })
    } catch (err) {
        res.status(500).send('Error fetching Users');
    }
};
const unblockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndUpdate(userId, { isBlocked: false });
        res.redirect('/admin/users');
    } catch (err) {
        res.status(500).send('error on Unbloking user')
    }
};
const blockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndUpdate(userId, { isBlocked: true });
        res.redirect('/admin/users');
    } catch (err) {
        res.status(500).send('error on Bloking user')
    }
};
const categoryPage = async (req, res) => {
    const category = await Category.find({});
    res.render('admin/category', { category });
};
const addCategory = async (req, res) => {
    try {
        const { brandName, displayType, bandColor } = req.body;
        const newCategory = await new Category({
            brandName,
            displayType,
            bandColor
        });
        await newCategory.save();
        res.redirect("/admin/category");
    } catch (err) {
        console.log("adding error", err);
    }

};
const editCategory = async (req, res) => {
    try {
        const { brandName, displayType, bandColor, id } = req.body;
 
        await Category.findByIdAndUpdate(id,
            {
                brandName,
                displayType,
                bandColor,
            }
        );
        res.redirect('/admin/category');

    } catch (err) {
        console.log('error on the edit category', err);
    }
};
const deleteCategory = async (req,res) =>{
    try{
        const {id} = req.body;
        await Category.findByIdAndUpdate(id,
            {isDelete:true}
        );
        res.redirect('/admin/category');
    }catch(err){
        console.log('error on deleting category');
    }
};
const productPage = async (req,res)=>{
    try{
    const products = await Products.find(); 
    const categories = await Category.find();
    res.render('admin/products',{products,categories});

    }catch(err){
        console.log("product listing error",{products})
    }
};
const addProduct = async(req,res)=>{
    try{
        if (!req.files || req.files.length < 3) {
            return res.status(400).send('Please upload at least 3 images.');
        }
        const images = [];
        for(let file of req.files){
            const newImgName = `${Date.now()}-${file.originalname}`;
            await sharp(file.buffer)
            .resize(1000,1000)
            .toFile(`./uploads/${newImgName}`);
            images.push(newImgName);
        }

        const {Name,Stock,Price,categories} = req.body;

        const newProduct = await new Products({
            productName:Name,
            productStock:Stock,
            productPrice:Price,
            images:images,
            category:categories,
        });
        await newProduct.save();
        res.redirect('/admin/products');
    }catch(err){
        console.log('error on adding products',err);
    }
    
};
const editProduct = async (req,res) =>{
    try {
        const { productName, productStock, productPrice, id,categories } = req.body;
        console.log(req.body)
        const product = await Products.findById(id);
        
                product.productName = productName;
                product.productStock = productStock;
                product.productPrice = productPrice;
                product.category = categories
                
                const images = [];
                if (req.files && req.files.length > 0) {
                    for (let file of req.files) {

                        const newImgName = `${Date.now()}-${file.originalname}`;
        
                        await sharp(file.buffer)
                            .resize(500, 500)  
                            .toFile(path.join(__dirname, '../uploads/', newImgName));

                        images.push(newImgName);
                    }

                    product.images = images;
                }
        
                await product.save();

        res.redirect('/admin/products');

    } catch (err) {
        console.log('error on the edit products', err);
    }
};
const deleteProduct = async (req,res) =>{
    try{
        const {id} = req.body;
        await Products.findByIdAndUpdate(id,{isDeleted:true});
        res.redirect('/admin/products');
    }catch(err){
        console.log('error on deleting product');
    }
     
}
module.exports = {
    loadLogin,
    loginBtn,
    usersPage,
    unblockUser,
    blockUser,
    categoryPage,
    addCategory,
    editCategory,
    deleteCategory,
    productPage,
    addProduct,
    upload,
    editProduct,
    deleteProduct
}