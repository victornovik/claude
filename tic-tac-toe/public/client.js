const socket = io();

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const findGameBtn = document.getElementById("find-game-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const statusEl = document.getElementById("status");
const cells = document.querySelectorAll(".cell");

let mySymbol = null;
let roomId = null;
let myTurn = false;
let gameOver = false;

// ── Helpers ────────────────────────────────────────────────

function setStatus(text) {
  statusEl.textContent = text;
}

function updateTurnStatus(activeSymbol) {
  if (activeSymbol === mySymbol) {
    setStatus(`Your turn (${mySymbol})`);
    myTurn = true;
  } else {
    setStatus(`Opponent's turn`);
    myTurn = false;
  }
}

function placeSymbol(index, symbol) {
  const cell = cells[index];
  if (cell.classList.contains("taken")) return;
  cell.textContent = symbol;
  cell.classList.add("taken", symbol.toLowerCase());
}

function resetBoard() {
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.className = "cell";
  });
  mySymbol = null;
  roomId = null;
  myTurn = false;
  gameOver = false;
  playAgainBtn.hidden = true;
}

// ── UI Events ──────────────────────────────────────────────

findGameBtn.addEventListener("click", () => {
  setStatus("Searching for opponent...");
  socket.emit("find-game");
});

playAgainBtn.addEventListener("click", () => {
  resetBoard();
  setStatus("Searching for opponent...");
  socket.emit("find-game");
});

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (!myTurn || gameOver || cell.classList.contains("taken")) return;
    socket.emit("make-move", {
      index: parseInt(cell.dataset.index, 10),
      roomId,
    });
  });
});

// ── Socket Events: Receiving events FROM the server

socket.on("waiting", () => {
  setStatus("Waiting for another player...");
});

socket.on("game-start", ({ symbol, roomId: id }) => {
  mySymbol = symbol;
  roomId = id;
  gameOver = false;
  updateTurnStatus("X"); // X always moves first
});

socket.on("move-made", ({ index, symbol }) => {
  placeSymbol(index, symbol);
  updateTurnStatus(symbol === "X" ? "O" : "X");
});

socket.on("game-over", ({ winner, isDraw, board }) => {
  // Sync the full board so the winning cell is always visible
  board.forEach((symbol, index) => {
    if (symbol) placeSymbol(index, symbol);
  });

  gameOver = true;
  myTurn = false;

  if (isDraw) {
    setStatus("It's a draw!");
  } else {
    setStatus(winner === mySymbol ? "You won!" : "You lost.");

    const winLine = WINNING_LINES.find(
      ([a, b, c]) =>
        board[a] === winner && board[b] === winner && board[c] === winner,
    );
    if (winLine) winLine.forEach((i) => cells[i].classList.add("winning"));
  }

  playAgainBtn.hidden = false;
});

socket.on("opponent-left", () => {
  gameOver = true;
  myTurn = false;
  setStatus("Opponent disconnected.");
  playAgainBtn.hidden = false;
});
