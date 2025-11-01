// import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

// const app = express();
const httpServer = createServer();
const connectedUser = new Set();
 let youtubeUrl = null;
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
    socket.on('message', (message) => {
        console.log('message', message);
    });
    
    socket.on('youtube-url', (url) => {
        console.log('Received YouTube URL:', url);
        youtubeUrl = url;
        // Broadcast the YouTube URL to all connected clients
        socket.broadcast.emit('youtube-url', url);
    });

    socket.on('disconnect', () => {
        connectedUser.delete(socket.id);
        console.log('User disconnected:', socket.id);
        
        // Update user count for remaining users
        io.emit('users', Array.from(connectedUser));
    });

    if (youtubeUrl) {
        io.emit('youtube-url', youtubeUrl);
    }
});

httpServer.listen(3000, () => {
    console.log('Server is running on port 3000');
});