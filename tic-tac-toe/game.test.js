const { test } = require("node:test");
const assert = require("node:assert/strict");
const TicTacToeGame = require("./game.js");

/*
  node --test game.test.js
*/

test("first move is always X", () => {
  const game = new TicTacToeGame();
  const { symbol } = game.makeMove(0);
  assert.equal(symbol, "X");
});

test("placing a move on an occupied cell returns valid: false", () => {
  const game = new TicTacToeGame();
  game.makeMove(4); // X
  game.makeMove(0); // O
  const { valid } = game.makeMove(4); // X tries occupied cell
  assert.equal(valid, false);
});

test("playing out of turn returns valid: false", () => {
  const game = new TicTacToeGame();
  const { valid } = game.makeMove(0, "O"); // O tries when it's X's turn
  assert.equal(valid, false);
});

test("after a win no more moves are allowed", () => {
  const game = new TicTacToeGame();
  // X wins the top row: 0, 1, 2
  game.makeMove(0); // X
  game.makeMove(3); // O
  game.makeMove(1); // X
  game.makeMove(4); // O
  const { valid: winValid } = game.makeMove(2); // X wins
  assert.equal(winValid, true);

  const { valid } = game.makeMove(5); // attempt move after win
  assert.equal(valid, false);
});

test("a full board with no winner is a draw", () => {
  const game = new TicTacToeGame();
  // Produces: X O X / X O O / O X X — no winning line
  [0, 1, 2, 4, 3, 5, 7, 6].forEach((i) => game.makeMove(i));
  const { isDraw, winner } = game.makeMove(8);
  assert.equal(isDraw, true);
  assert.equal(winner, null);
});

// --- getState ---

test("getState returns empty board and X turn at start", () => {
  const game = new TicTacToeGame();
  const { board, currentTurn } = game.getState();
  assert.deepEqual(board, Array(9).fill(null));
  assert.equal(currentTurn, "X");
});

test("getState board reflects placed moves", () => {
  const game = new TicTacToeGame();
  game.makeMove(0); // X
  game.makeMove(4); // O
  const { board } = game.getState();
  assert.equal(board[0], "X");
  assert.equal(board[4], "O");
});

test("getState currentTurn switches to O after X moves", () => {
  const game = new TicTacToeGame();
  game.makeMove(0);
  const { currentTurn } = game.getState();
  assert.equal(currentTurn, "O");
});

// --- board field in return value ---

test("makeMove returns board with placed symbol", () => {
  const game = new TicTacToeGame();
  const { board } = game.makeMove(3);
  assert.equal(board[3], "X");
});

test("makeMove returns unchanged board on invalid move", () => {
  const game = new TicTacToeGame();
  game.makeMove(0); // X
  const before = [...game.getState().board];
  const { board } = game.makeMove(0); // invalid — occupied
  assert.deepEqual(board, before);
});

// --- winner field ---

test("makeMove returns winner X when X wins", () => {
  const game = new TicTacToeGame();
  game.makeMove(0); game.makeMove(3);
  game.makeMove(1); game.makeMove(4);
  const { winner } = game.makeMove(2); // X wins top row
  assert.equal(winner, "X");
});

test("makeMove returns winner O when O wins", () => {
  const game = new TicTacToeGame();
  game.makeMove(6); game.makeMove(0);
  game.makeMove(7); game.makeMove(1);
  game.makeMove(2); // X plays away from O's line
  const { winner } = game.makeMove(2); // invalid
  // O wins: 0,1,2 — set up properly
  const g2 = new TicTacToeGame();
  g2.makeMove(3); g2.makeMove(0);
  g2.makeMove(4); g2.makeMove(1);
  g2.makeMove(8); // X plays away
  const { winner: w } = g2.makeMove(2); // O wins top row
  assert.equal(w, "O");
});

// --- turn does not advance after win ---

test("currentTurn does not advance after a win", () => {
  const game = new TicTacToeGame();
  game.makeMove(0); game.makeMove(3);
  game.makeMove(1); game.makeMove(4);
  game.makeMove(2); // X wins
  const { currentTurn } = game.getState();
  assert.equal(currentTurn, "X");
});

// --- out-of-range cell index ---

test("cellIndex less than 0 returns valid: false", () => {
  const game = new TicTacToeGame();
  const { valid } = game.makeMove(-1);
  assert.equal(valid, false);
});

test("cellIndex greater than 8 returns valid: false", () => {
  const game = new TicTacToeGame();
  const { valid } = game.makeMove(9);
  assert.equal(valid, false);
});

// --- all winning lines ---

test("X wins middle row (3,4,5)", () => {
  const game = new TicTacToeGame();
  game.makeMove(3); game.makeMove(0);
  game.makeMove(4); game.makeMove(1);
  const { winner } = game.makeMove(5);
  assert.equal(winner, "X");
});

test("X wins bottom row (6,7,8)", () => {
  const game = new TicTacToeGame();
  game.makeMove(6); game.makeMove(0);
  game.makeMove(7); game.makeMove(1);
  const { winner } = game.makeMove(8);
  assert.equal(winner, "X");
});

test("X wins left column (0,3,6)", () => {
  const game = new TicTacToeGame();
  game.makeMove(0); game.makeMove(1);
  game.makeMove(3); game.makeMove(2);
  const { winner } = game.makeMove(6);
  assert.equal(winner, "X");
});

test("X wins middle column (1,4,7)", () => {
  const game = new TicTacToeGame();
  game.makeMove(1); game.makeMove(0);
  game.makeMove(4); game.makeMove(2);
  const { winner } = game.makeMove(7);
  assert.equal(winner, "X");
});

test("X wins right column (2,5,8)", () => {
  const game = new TicTacToeGame();
  game.makeMove(2); game.makeMove(0);
  game.makeMove(5); game.makeMove(1);
  const { winner } = game.makeMove(8);
  assert.equal(winner, "X");
});

test("X wins main diagonal (0,4,8)", () => {
  const game = new TicTacToeGame();
  game.makeMove(0); game.makeMove(1);
  game.makeMove(4); game.makeMove(2);
  const { winner } = game.makeMove(8);
  assert.equal(winner, "X");
});

test("X wins anti-diagonal (2,4,6)", () => {
  const game = new TicTacToeGame();
  game.makeMove(2); game.makeMove(0);
  game.makeMove(4); game.makeMove(1);
  const { winner } = game.makeMove(6);
  assert.equal(winner, "X");
});
