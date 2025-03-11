const bcrypt = require('bcrypt');
const User = require('../models/user_model');
const session = require('express-session');

const registerLoad = async (req, res) => {
    res.render('register');
}

const register = async (req, res) => {
    try {
        console.log('entering');
        const passwordhash = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            image: 'images/' + req.file.filename,
            password: passwordhash
        });

        await user.save();

        res.render('register', { message: 'success' })

    } catch (error) {
        console.log(error);

    }
}

const loginLoad = (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}
const login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                console.log('true');
                req.session.user = userData;
                res.redirect('/user/dashboard');
            } else {
                console.log('false');
                res.render('login', { message: 'Incorrect email or password' });
            }


        } else {
            res.render('login', { message: 'Incorrect email or password' });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const logout = (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/user/login');

    } catch (error) {
        console.log(error.message);
    }
}

const dashboardLoad = async (req, res) => {
    try {
        var users = await User.find({_id : {$nin:[req.session.user._id] }});
        console.log(users);
        
        res.render('dashboard', { user: req.session.user, users : users });
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    registerLoad,
    register,
    login,
    loginLoad,
    logout,
    dashboardLoad
}