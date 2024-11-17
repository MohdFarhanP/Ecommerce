
const bcrypt = require('bcrypt');
const User = require("../../model/userModel");
const Address = require('../../model/addressModel');
const WalletTransaction = require('../../model/wlletModel');



// user profile page
const userProfile = async (req, res) => {
    try {

        const userId = req.session.userId;

        const user = await User.findById(userId);
        const address = await Address.findOne({ isDefault: true, user: userId });

        res.render('user/userProfile', { user, address, activePage:"userProfile" });

    } catch (err) {
        console.log('error in userPfofile', err)
    }

};
// controller for update password
const passwordUpdate = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { id, oldPassword, password } = req.body;

        const user = await User.findById(id);
        if (user) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (isMatch) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                await user.save();
                res.render('user/passwordUpdate', { msg: 'Password changed successfully', userId });
                console.log('changed successfully ');

            } else {
                res.render('user/passwordUpdate', { err: 'passoword not matching ', userId });
                console.log('password is not matching ');
            }
        } else {
            res.render('user/passwordUpdate', { err: 'User not exist ',activePage:'password' });
        }
    } catch (err) {
        console.log("Error on password update", err);
        res.status(500).send('Server error');
    }
};
// password updating page 
const passwordUpdatePage = async (req, res) => {
    try {
        const userId = req.session.userId;
        res.render('user/passwordUpdate', { userId });
    } catch (err) {
        console.log('on password update page')
    }
};
// getting Address page 
const addressPage = async (req, res) => {
    try {
        const userId = req.session.userId;
        const addresses = await Address.find({ user: userId });
        res.render('user/address', { addresses, activePage:'address' });
    } catch (err) {
        console.log('on address page');
        res.status(500).send('Internal Server Error');
    }
};
// controller for Address page
const addAddress = async (req, res) => {
    try {
        const userId = req.session.userId;

        const { firstName, lastName, email, mobile, addressLine, city, pinCode, country, source } = req.body;

        if (!firstName || !lastName || !email || !mobile || !addressLine || !city || !pinCode || !country) {
            return res.status(400).send('All fields are required.');
        }

        const newAddress = await Address({
            user: userId,
            firstName,
            lastName,
            email,
            mobile,
            addressLine,
            city,
            pinCode,
            country
        });
        await newAddress.save();

        await User.findByIdAndUpdate(userId,
            { $push: { addresses: newAddress._id } }
        );

        if (source === 'checkout') {
            return res.redirect('/checkout')
        } else {
            return res.redirect('/address');
        }

    } catch (err) {

        console.log("on add address", err);
    }
};
// controller for editAddress
const editAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const { firstName, lastName, email, mobile, addressLine, city, pinCode, country, source } = req.body;

        if (!firstName || !lastName || !email || !mobile || !addressLine || !city || !pinCode || !country) {
            return res.status(400).send('All fields are required.');
        }

        await Address.findByIdAndUpdate(addressId,
            {
                firstName,
                lastName,
                email,
                mobile,
                addressLine,
                city,
                pinCode,
                country,
            }
        );

        if (source === 'checkout') {
            res.redirect('/checkout')
        } else {
            res.redirect('/address');
        }

    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).send('Server Error');
    }
};
// controller for deleteAddress
const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        await Address.findByIdAndDelete(addressId);
        res.redirect('/address');
    } catch (err) {
        console.log(err);
    }
};
// controller for set defult address for the user
const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { addressId } = req.body;
        console.log(userId, addressId)
        await Address.updateMany({ user: userId }, { $set: { isDefault: false } });

        await Address.findByIdAndUpdate(addressId, { $set: { isDefault: true } });
        console.log("success");
        return res.json({ success: true });

    } catch (err) {

        console.error(err);
        res.json({ success: false, error: err.message });

    }
};
// for editing the user profile 
const editUserProfile = async (req, res) => {
    try {
        const { id, userName, email, mobile, country, addressId } = req.body;
        console.log(req.body);

        const user = await User.findByIdAndUpdate(id,
            {
                userName,
                email
            },
            { new: true }
        );

        const address = await Address.findByIdAndUpdate(addressId,
            {
                mobile,
                country
            },
            { new: true }
        );

        res.render('user/userProfile', { user, address });
    } catch (err) {
        console.log('error occured', err)
    }
};
// controller for wallet page 
const walletPage = async (req, res) => {
    try {
        const userId = req.session.userId;

        const transactions = await WalletTransaction.find({ userId });
        const user = await User.findById(userId)
        const Balance = user.walletBalance.toFixed(2);

        res.render('user/wallet', { transactions, user, Balance, activePage: 'wallet' });
    } catch (err) {
        console.log(err)
    }

};




module.exports = {
    userProfile,
    editUserProfile,
    passwordUpdate,
    passwordUpdatePage,
    addressPage,
    addAddress,
    editAddress,
    deleteAddress,
    setDefaultAddress,
    walletPage
};