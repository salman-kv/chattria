const bcrypt = require('bcrypt');
const User = require('../models/user_model');
const session = require('express-session');
const nodeMail = require('nodemailer');
const Mail = require('nodemailer/lib/mailer');
const { use } = require('../routes/user_routes');
const jwt = require('jsonwebtoken');

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

    } catch (error) {
        console.log(error);
        res.send({ message: error });

    }
}

const genarateAccessTokenAndRefreshToken = async function (id) {
    try {
        const user = await User.findById(id);
        const refreshToken = await user.genarateRefreshToken();
        const accessToken = await user.genarateAccessToken();

        user.refreshToken = refreshToken;

        await user.save();

        return { refreshToken, accessToken };
    } catch (error) {
        console.log('error');

    }
}

const login = async (req, res) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: " Email and password required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({ message: "User not found" });
        }

        const isPasswordvalid = await user.isPasswordCorrect(password);

        if (!isPasswordvalid) {
            return res.status(400).json({ message: 'Email or password incorrect' });
        }
        const { refreshToken, accessToken } = await genarateAccessTokenAndRefreshToken(user._id);

        const loggedUser = await User.findById(user._id).select("-password -refreshToken");

        res.status(200).json({ user: loggedUser, accessToken: accessToken, refreshToken: refreshToken });

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Somthing went wrong' });
    }
}

const refreshAccessToken = async function (req, res) {

    const incomingRefreshToken = req.body.refreshToken;
    if (!incomingRefreshToken) {
        return res.status(400).json({ message: " refresh token missing" });
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id);

        if (!user) {
            return res.status(400).json({ message: "no user found" });
        }

        if (user.refreshToken !== incomingRefreshToken) {
            return res.status(400).json({ message: "invalid refresh token" });
        }

        const { refreshToken, accessToken } = await genarateAccessTokenAndRefreshToken(user._id);

        res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken, message: "AccesToken refreshed" });


    } catch (error) {
        res.status(500).json({ message: error });
    }
}


module.exports = {
    register,
    login,
    sendMail,
    refreshAccessToken
}