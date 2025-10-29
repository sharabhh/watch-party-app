// import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

// const app = express();
const httpServer = createServer();
const connectedUser = new Set();
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});


io.on('connection', (socket) => {
    connectedUser.add(socket.id);
    console.log('a user connected', socket.id);

    io.emit('users', Array.from(connectedUser));
    socket.on('disconnect', () => {
        connectedUser.delete(socket.id);
        console.log('a user disconnected', socket.id);
    });
    socket.on('message', (message) => {
        console.log('message', message);
    });
});

httpServer.listen(3000, () => {
    console.log('Server is running on port 3000');
});