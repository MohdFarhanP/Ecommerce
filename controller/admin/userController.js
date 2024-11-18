
const Admin = require('../../model/adminModel');
const User = require('../../model/userModel');
const bcrypt = require('bcrypt');


// Render login page for the admin
const loadLogin = (req, res) => {
    res.render('admin/login');
};
// admin login validation
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
        res.redirect("/dashboard");
    } catch (error) {
        console.error(error)
    }
};
// admin logout
const logoutBtn = async (req, res) => {
    req.session.admin = null;
    res.redirect('/login');
}

// Render the users page with filtering
const usersPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 7;
        const skip = (page - 1) * limit;
        const filterBy = req.query.filterBy || 'createdAt';

        const sortOptions = {
            createdAt: { createdAt: -1 },
            userName: { userName: 1 },
            email: { email: 1 },
        };

        const sort = sortOptions[filterBy] || { createdAt: -1 };

        // Fetch filtered and paginated user data
        const totalUsers = await User.countDocuments();
        const users = await User.find({})
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalUsers / limit);

        res.render('admin/users', {
            data: users,
            currentPage: page,
            totalPages: totalPages,
            totalUsers: totalUsers,
            activePage: 'users',
            selectedFilter: filterBy
        });

    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching Users');
    }
};
// Block a user  
const blockUser = async (req, res) => {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, { isBlocked: true });
    res.redirect('/users'); unblockUser
};
// Unblock a user  
const unblockUser = async (req, res) => {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, { isBlocked: false });
    res.redirect('/users');
};


module.exports = {
    loadLogin,
    loginBtn,
    logoutBtn,
    usersPage,
    blockUser,
    unblockUser
};