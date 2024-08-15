const express = require('express')
const http = require('http')
const { Server } = require('socket.io');
const {v4: uuidv4} = require('uuid')
const cors = require('cors')

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow only this origin to access the server
        methods: ["GET", "POST"]
    }
});

app.use(cors()); // Use the CORS middleware

let users = []

io.on('connection', (socket) => {
    console.log('New user connected');

    // Handle user joining the chatroom
    socket.on('join', (username, callback) => {
        if(!users.includes(username)){
            users.push(username)
            console.log(`${username} joined`)
            const joinMessage = `${username} has joined the chatroom`
            socket.broadcast.emit('userJoined', joinMessage);
            if (callback){
                callback()
            }
        }

    });

    // Handle message sending
    socket.on('sendMessage', (username, message, callback) => {
        if(users.includes(username)){
            io.emit('message', { user: username, text: message });
        }
        if (callback){
            callback()
        }
    });

    // Handle user disconnection
    socket.on('disconnected', (username) => {
        console.log(users)
        if (users.includes(username)) {
            console.log('hi',users.filter((item) => item !== username))
            users = users.filter((item) => item !== username)
            io.emit('userLeft', `${username} has left the chatroom`);
            console.log(users)
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
