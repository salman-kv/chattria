const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,

    },
    is_online: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    }
},
    { Timestamp: true }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCurrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.method.genarateAccessToken = function () {
    return jwt.sign({ _id: this._id, email: this.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
}

userSchema.method.genarateRefreshToken = function () {
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "10d" });
}


module.exports = mongoose.model('User', userSchema);