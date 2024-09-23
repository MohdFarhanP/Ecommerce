const bcrypt = require('bcrypt')
const Admin = require('../module/adminModel');
const saltRound = 10;


const loadLogin = (req, res) => {
    res.render('admin/login');
}

const loginData = async (req, res) => {
    try {
        const { userName, password,email} = req.body;
               
        const adminExist = await Admin.findOne({ userName,email});
        if (!adminExist) {
            return res.render("admin/login", { msg: 'admin not found' });
        }
        
        const isMatch = await bcrypt.compare(password,adminExist.password);
        if (!isMatch) {
            return res.render('admin/login', { msg: 'password is incorrect' });
        }
        res.render("admin/users");
    } catch (error) {
        console.error(error)
    }
}
module.exports = {
    loadLogin,
    loginData
}