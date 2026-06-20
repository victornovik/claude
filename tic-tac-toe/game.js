const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

/*
  TicTacToeGame class represents the state and logic of a Tic Tac Toe game.
  It maintains the game board, tracks the current player's turn, and provides methods to make moves and check for a winner or draw.
  To test this class, you can create an instance of TicTacToeGame and call the makeMove method with the index of the cell where the player wants to place their symbol (0-8).
  Run `node` in the terminal to start a Node.js REPL, then create an instance of TicTacToeGame and call the makeMove method with the desired cell index.

  const TicTacToeGame = require('./game.js')
  const game = new TicTacToeGame()  
  game.makeMove(0)
*/

class TicTacToeGame {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentTurn = "X";
  }

  makeMove(cellIndex, player) {
    if (player !== undefined && player !== this.currentTurn) {
      return {
        valid: false,
        symbol: null,
        winner: null,
        isDraw: false,
        board: this.board,
      };
    }

    if (cellIndex < 0 || cellIndex > 8 || this.board[cellIndex] !== null) {
      return {
        valid: false,
        symbol: null,
        winner: null,
        isDraw: false,
        board: this.board,
      };
    }

    const symbol = this.currentTurn;

    // Check if the game is already over before making a move
    let isWin = this._checkWinner();
    if (isWin) {
      return {
        valid: false,
        symbol,
        winner: isWin,
        isDraw: false,
        board: this.board,
      };
    }

    // Make move
    this.board[cellIndex] = symbol;

    isWin = this._checkWinner();
    if (isWin) {
      return {
        valid: true,
        symbol,
        winner: isWin,
        isDraw: false,
        board: this.board,
      };
    }

    const isDraw = !isWin && this.board.every((cell) => cell !== null);

    if (!isWin && !isDraw) {
      this.currentTurn = this.currentTurn === "X" ? "O" : "X";
    }

    return { valid: true, symbol, winner: isWin, isDraw, board: this.board };
  }

  getState() {
    return { board: this.board, currentTurn: this.currentTurn };
  }

  _checkWinner() {
    for (const [a, b, c] of WINNING_LINES) {
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        return this.board[a];
      }
    }
    return null;
  }
}

module.exports = TicTacToeGame;
