const bcrypt = require('bcrypt')
const Admin = require('../module/adminModel');
const saltRound = 10;
const User = require('../module/userModel');
const Category = require('../module/categoryModel');

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
const categoryPage = async (req,res) =>{
    const category = await Category.find({});
    res.render('admin/category',{category});
};
const addCategory = async (req,res) =>{
    try{
    const {brandName,displayType,bandColor} = req.body;
    const newCategory = await new Category({
        brandName,
        displayType,
        bandColor
    });
    await newCategory.save();
    res.redirect("/admin/category");
    }catch(err){
        console.log("adding error",err);
    }

};
const editCategory = async (req,res) =>{
    const {brandName,displayType,bandColor} = req.body;
    
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
}