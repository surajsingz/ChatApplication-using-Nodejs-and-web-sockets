const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = 'uChat';

//set static folder
app.use(express.static(path.join(__dirname,'public')));

//Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to uChat - The Next Generation Chatting App!! '))

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users:  getRoomUsers(user.room)
        });
    });

    

    //Listen for ChatMessage
    socket.on('chatMessage', (msg)=>{
        const user =getCurrentUser(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });

    //Runs when a user disconnects
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`)
            );
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users:  getRoomUsers(user.room)
            });
        }
    });
});


const PORT = 3000 || process.env.PORT;

server.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT} at http://localhost:3000`)
});