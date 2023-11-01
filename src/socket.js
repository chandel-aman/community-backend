// // Import necessary libraries
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');

// // Set up express
// const app = express();
// const server = http.createServer(app);

// // Set up Socket.IO
// const io = socketIo(server);

// // Listen for socket connections
// io.on('connection', (socket) => {
//   console.log('New user connected');

//   // When a new message is received
//   socket.on('message', async (data) => {
//     console.log('Received new message:', data);

//     // Broadcast the new message to everyone in the chat room
//     io.to(data.chatId).emit('message', data);
//   });

//   // Listen for join room event
//   socket.on('join', (room) => {
//     console.log('User joined room:', room);
//     socket.join(room);
//   });

//   // Listen for disconnect event
//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

// // Start the server
// const PORT = 3000;
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
