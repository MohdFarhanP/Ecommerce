const admin = {
    userName:"admin",
    password:123
}
const loadLogin = (req,res)=>{
    res.render('admin/login');
}
const loginData = (req,res)=>{
    res.send("hai")

}
module.exports = {loadLogin,loginData}