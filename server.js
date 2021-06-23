require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 8080
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')

//! database connection
mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true, useFindAndModify : false });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
}).catch(err => {
    console.log('Connection failed...')
});
//! database connection End 

//! Session Config
app.use(session({
secret: process.env.COOKIE_SECRET,
resave: true,
saveUninitialized: false,
}))
//! Session Config End

//!set view engine
app.set('view engine', 'pug')
app.set('views', 'views')
app.use(express.static(path.join(__dirname, 'public')))
//!end view engine 

//!datatype send to server
app.use(bodyParser.urlencoded({ extended: false })) 


//! all routers
app.use('/',require('./routes/clientroutes.js'))
app.use('/',require('./routes/adminroutes'))
app.use((req, res)=>{
    res.status(404).render('errors/404')
})
//! all routers end


//! server port setup
const server = app.listen(PORT,() => {
    console.log(`listening on port ${PORT}`)
})
//! server port setup end

//! socket io connection server side 
const io = require("socket.io")(server, { pingTimeout: 60000 })
io.on("connection", socket => {
    socket.on("setup", userData => {
        socket.join(userData._id);
        socket.emit("connected");
    })

    // chate room joining 
    socket.on("join room", room => socket.join(room));
    // start typing indicator
    socket.on("typing", room => socket.in(room).emit("typing"));
    // End typing indicator
    socket.on("stop typing", room => socket.in(room).emit("stop typing"));
    // realtime like,answered,reasked notification
    socket.on("notification received", room => socket.in(room).emit("notification received"));
    // realtime message send 
    socket.on("new message", newMessage => {
        var chat = newMessage.chat;

        if(!chat.users) return console.log("Chat.users not defined");

        chat.users.forEach(user => {
            
            if(user._id == newMessage.sender._id) return;
            socket.in(user._id).emit("message received", newMessage);
        })
    });

})
    