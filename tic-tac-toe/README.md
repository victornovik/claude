# Tic Tac Toe

Real-time multiplayer Tic Tac Toe in the browser — no account needed, just open and play.

## How to Play

1. Click **Find Game** — the server pairs you with the next available opponent.
2. You're assigned X or O randomly. X always goes first.
3. Click any empty cell on your turn to place your symbol.
4. First to complete a row, column, or diagonal wins. If all 9 cells fill with no winner, it's a draw.
5. Click **Play Again** to jump back into the queue.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Server | Express |
| Real-time | Socket.io |
| Frontend | Vanilla HTML / CSS / JS |

## Run Locally

```bash
git clone https://github.com/victornovik/claude.git
cd claude/tic-tac-toe
npm install
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in two browser tabs to play against yourself.

## Run Unit Tests

Tests use Node's built-in test runner — no extra packages needed.

```bash
node --test game.test.js
```

This tests the `TicTacToeGame` class: first move, occupied cell rejection, out-of-turn rejection, post-win lockout, and draw detection.

## Debug Locally

**Server-side** — run with the Node.js inspector and connect Chrome DevTools or VS Code:

```bash
node --inspect server.js
```

Open `chrome://inspect` in Chrome and click **inspect** under Remote Target. You can set breakpoints in `server.js`, `game.js`, and `matchmaking.js`.

**VS Code** — add this to `.vscode/launch.json` for one-click debugging:

```json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Start server",
      "program": "${workspaceFolder}/server.js"
    }
  ]
}
```

**Socket events** — open the browser console while the game is running. All Socket.io traffic is visible under the **Network → WS** tab in DevTools. Filter by the websocket connection to inspect individual `find-game`, `make-move`, and `game-over` frames.

## How It Works

The Express server serves the static frontend and shares its port with a Socket.io server. When a client emits `find-game`, the server either adds them to a waiting queue or pairs them with whoever's already waiting, creating a private room and a fresh game instance. All moves are validated server-side — the client only sends a cell index, and the server responds with the updated board state. If a player disconnects mid-game, their opponent is notified immediately via the `opponent-left` event.
