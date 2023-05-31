const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const { handleConnection } = require('./socket');

app.use(express.static('public'));

io.on('connection', (socket) => {
  handleConnection(socket, io);
});

httpServer.listen(5005, () => {
  console.log(`Server listening at http://localhost:5005`);
});
