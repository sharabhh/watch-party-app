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

let currentTime = 0;
let totalDuration = 0;
let isPlaying = false;

io.on('connection', (socket) => {
    connectedUser.add(socket.id);
    console.log('a user connected', socket.id);
    

    io.emit('users', Array.from(connectedUser));

    // Send complete video state to newly connected user if video exists
    if (youtubeUrl) {
        const videoState = {
            videoUrl: youtubeUrl,
            currentTime: currentTime,
            isPlaying: isPlaying,
            totalDuration: totalDuration
        };
        socket.emit('video-state-sync', videoState);
        console.log('Sent video state to new user:', videoState);
    }

    socket.on('message', (message) => {
        console.log('message', message);
    });

    socket.on('player-settings', (settings) => {
        console.log('player settings', settings);
        currentTime = settings.seekTo || settings.currentTime || 0;
        isPlaying = settings.playing !== undefined ? settings.playing : isPlaying;
        settings.videoUrl = youtubeUrl;
        socket.broadcast.emit('player-settings', settings);
    });
    
    socket.on('youtube-url', (url) => {
        console.log('Received YouTube URL:', url);
        youtubeUrl = url;
        currentTime = 0; // Reset time when new video starts
        isPlaying = true; // Assume new video starts playing
        
        // Broadcast the YouTube URL to all connected clients
        socket.broadcast.emit('youtube-url', url);
    });

    socket.on('time-update', (time) => {
        console.log('time update', time);
        currentTime = time;
        // totalDuration = time.totalDuration;
        socket.broadcast.emit('time-update', currentTime);
    });

    socket.on('get-current-time', () => {
        console.log('Client requested current time:', currentTime);
        socket.emit('current-time', currentTime);
    });

    socket.on('disconnect-party', () => {
        console.log('User requested to disconnect party:', socket.id);
        
        // Clear server state
        youtubeUrl = null;
        currentTime = 0;
        totalDuration = 0;
        isPlaying = false;
        
        // Notify all clients that party has been disconnected
        io.emit('party-disconnected');
        console.log('Party disconnected - all users notified');
    });

    socket.on('disconnect', () => {
        connectedUser.delete(socket.id);
        console.log('User disconnected:', socket.id);
        
        // Update user count for remaining users
        io.emit('users', Array.from(connectedUser));
    });

    
});

httpServer.listen(3000, () => {
    console.log('Server is running on port 3000');
});