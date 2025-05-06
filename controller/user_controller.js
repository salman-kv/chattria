const bcrypt = require('bcrypt');
const User = require('../models/user_model');
const session = require('express-session');
const nodeMail = require('nodemailer');
const Mail = require('nodemailer/lib/mailer');
const { use } = require('../routes/user_routes');

const transporter = nodeMail.createTransport({
    service: 'Gmail',
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: 'kvsalu16@gmail.com',
        pass: 'pjxl czhh hbnp rqkg'
    }
})

const sendMail = async (req, res) => {
    try {
        const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000).toString();
        const { email } = req.body;
        console.log(randomNumber);
        transporter.sendMail({
            to: email,
            subject: "subject",
            html: randomNumber,
            text: 'text'
        });
        res.status(200);
        res.send();
    } catch (error) {
        console.log('errrrrrrrrror');
    }
}

const registerLoad = async (req, res) => {
    res.render('register');
}

const register = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "email and password is required" });
    }
    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exist" });
        }

        const user = await User.create({ email, password });

        const createduser = await User.findById(user._id).select("-password, -refreshToken");

        if (!createduser) {
            return res.status(500).json({ message: "Somthing wrong on server" });
        }

        res.status(200)
            .json({ message: "User created successfully" });
        // console.log('entering');
        // const passwordhash = await bcrypt.hash(req.body.password, 10);
        // const user = new User({
        //     name: req.body.name,
        //     email: req.body.email,
        //     image: 'images/' + req.file.filename,
        //     password: passwordhash
        // });

        // await user.save();

        // res.render('register', { message: 'success' })

    } catch (error) {
        console.log(error);
        res.send({ message: error });

    }
}

const loginLoad = (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const genarateAccessTokenAndRefreshToken = async function(id){
    try {
        
    } catch (error) {
        console.log('error');
        
    }
}

const login = async (req, res) => {

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: " Email and password required" });
    }

    const user = User.findOne({ email });

    if (!user) {
        res.status(400).json({ message: "User not found" });
    }

    const isPasswordvalid = await user.isPasswordCurrect(password);

    if (!isPasswordvalid) {
        return res.status(400).json({ message: 'Email or password incorrect' });
    }



    // try {
    //     const email = req.body.email;
    //     const password = req.body.password;

    //     const userData = await User.findOne({ email: email });

    //     if (userData) {
    //         const passwordMatch = await bcrypt.compare(password, userData.password);
    //         if (passwordMatch) {
    //             console.log('true');
    //             req.session.user = userData;
    //             res.redirect('/user/dashboard');
    //         } else {
    //             console.log('false');
    //             res.render('login', { message: 'Incorrect email or password' });
    //         }


    //     } else {
    //         res.render('login', { message: 'Incorrect email or password' });
    //     }

    // } catch (error) {
    //     console.log(error.message);
    // }
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
        var users = await User.find({ _id: { $nin: [req.session.user._id] } });
        console.log(users);

        res.render('dashboard', { user: req.session.user, users: users });
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
    dashboardLoad,
    sendMail
}