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
