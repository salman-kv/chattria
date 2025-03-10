require('dotenv').config();

var mongoose = require('mongoose');

const bodyParser = require('body-parser');

mongoose.connect('mongodb://127.0.0.1:27017/chattria').then(() => console.log('mongo connected'));

const app = require('express')();
const userRouter = require('../chattria/routes/user_routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/user', userRouter);

const http = require('http').Server(app);

http.listen(3000, function () {
    console.log('server is running');

});