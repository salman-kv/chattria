require('dotenv').config();

var mongoose = require('mongoose');

const bodyParser = require('body-parser');

mongoose.connect('mongodb://127.0.0.1:27017/chattria').then(() => console.log('mongo connected'));

const express = require('express');
const app = require('express')();
const userRouter = require('../chattria/routes/user_routes');

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/user', userRouter);

const http = require('http').Server(app);

const User = require('../chattria/models/user_model');
const io = require('socket.io')(http);
var usp = io.of('/user-namespace');

usp.on('connection', async (socket) => {
    var token = socket.handshake.auth.token;
    await User.findByIdAndUpdate({_id: token },{$set:{ is_online : true}});

    // emit brodcast to all user to update the user connected

    socket.broadcast.emit('getUserOnline',{user_id : token});   
    

    socket.on('disconnect',async function(){
        console.log('disconnected socket io');
        await User.findByIdAndUpdate({_id: token },{$set:{ is_online : false}});

        socket.broadcast.emit('getUserOfline',{user_id : token});   
    })

})

http.listen(3000, function () {
    console.log('server is running');

});