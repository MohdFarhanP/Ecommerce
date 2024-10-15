const checkSession = (req, res, next) => {
    if (req.session.admin) {
        next()
    } else {
        res.redirect('/adminLogin')
    }
}

const isLogin = (req, res, next) => {
    if (req.session.admin) {
        res.redirect('/users')
    } else {
        next()
    }
}

module.exports = {
    checkSession,
    isLogin
}