const { randomUUID } = require("crypto");
const TicTacToeGame = require("./game");

const waitingQueue = []; // Players waiting for a match
const activeGames = new Map(); // roomId -> { game, players: { socketId -> symbol } }
const socketRooms = new Map(); // socketId -> roomId

function addToQueue(socket, io) {
  if (waitingQueue.length > 0) {
    const opponent = waitingQueue.shift();
    const roomId = randomUUID();
    const game = new TicTacToeGame();

    const [xPlayer, oPlayer] =
      Math.random() < 0.5 ? [opponent, socket] : [socket, opponent];

    opponent.join(roomId);
    socket.join(roomId);

    activeGames.set(roomId, {
      game,
      players: { [xPlayer.id]: "X", [oPlayer.id]: "O" },
    });

    socketRooms.set(opponent.id, roomId);
    socketRooms.set(socket.id, roomId);

    xPlayer.emit("game-start", { symbol: "X", roomId });
    oPlayer.emit("game-start", { symbol: "O", roomId });
  } else {
    waitingQueue.push(socket);
    socket.emit("waiting");
  }
}

function removeFromQueue(socket) {
  const index = waitingQueue.findIndex((s) => s.id === socket.id);
  if (index !== -1) waitingQueue.splice(index, 1);
}

function handleDisconnect(socket, io) {
  removeFromQueue(socket);

  const roomId = socketRooms.get(socket.id);
  if (!roomId) return;

  const room = activeGames.get(roomId);
  if (!room) return;

  const opponentId = Object.keys(room.players).find((id) => id !== socket.id);
  if (opponentId) {
    const opponentSocket = io.sockets.sockets.get(opponentId);
    if (opponentSocket) opponentSocket.emit("opponent-left");
    socketRooms.delete(opponentId);
  }

  socketRooms.delete(socket.id);
  activeGames.delete(roomId);
}

module.exports = {
  addToQueue,
  removeFromQueue,
  handleDisconnect,
  activeGames,
  socketRooms,
};
