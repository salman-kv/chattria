const isLogin = (req, res, next) => {
    if (req.session.user) { }
    else {
        res.redirect('/user/login')
    }
    next();
}
const isLogout = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/user/dashboard')
    }
    next();
}

module.exports = {
    isLogin,
    isLogout
}