const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const {
  addToQueue,
  cleanupGame,
  handleDisconnect,
  activeGames,
  socketRooms,
} = require('./matchmaking');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('find-game', () => {
    addToQueue(socket, io);
  });

  socket.on('make-move', ({ index }) => {
    const roomId = socketRooms.get(socket.id);
    if (!roomId) return;

    const room = activeGames.get(roomId);
    if (!room) return;

    const symbol = room.players[socket.id];
    const result = room.game.makeMove(index, symbol);

    if (!result.valid) return;

    io.to(roomId).emit('move-made', {
      index,
      symbol: result.symbol,
      board: result.board,
    });

    if (result.winner || result.isDraw) {
      io.to(roomId).emit('game-over', {
        winner: result.winner,
        isDraw: result.isDraw,
        board: result.board,
      });
      cleanupGame(roomId);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    handleDisconnect(socket, io);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
