const User = require('../models/user_model');
const nodeMail = require('nodemailer');
const jwt = require('jsonwebtoken');
const Otp = require('../models/otp_model');

require('dotenv').config();

const transporter = nodeMail.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendMailOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: 'Email is required' });

        const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.deleteMany({ email: email });

        await Otp.create({ email: email, otp: randomNumber, otpExpires: otpExpires });

        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Chattria OTP verification",
            html: randomNumber,
        });
        res.status(200).json({ 'message': 'OTP shared successfully to' + email });
    } catch (error) {
        res.send({ 'message': error })
    }
}

const verifyMailOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Invalid Otp' });

        const otpRecord = await Otp.findOne({ email: email });

        if (!otpRecord) return res.status(400).json({ message: 'Email not registerd Plese check email and otp' });

        if (otpRecord.otpExpires < Date.now()) {
            await Otp.deleteMany({ email: email });
            return res.status(400).json({ message: 'Otp expired' });
        }
        if (otpRecord.otp === otp) {
            await Otp.deleteMany({ email: email });
            res.status(200).json({ message: 'Otp verification successfull' })
        } else {
            return res.status(400).json({ message: 'invalid Otp' });
        }


    } catch (error) {
        res.send({ message: 'Otp verification error' })
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
    sendMailOtp,
    refreshAccessToken,
    verifyMailOtp
}