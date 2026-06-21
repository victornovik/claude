---
name: project-architecture
description: Actual architecture of the tic-tac-toe project vs. what CLAUDE.md claims, for security scoping
metadata:
  type: project
---

The tic-tac-toe project is a plain-JavaScript (CommonJS) Socket.IO realtime game, NOT the TypeScript/React/Express-REST/DB stack the root CLAUDE.md describes.

Actual source files (all at repo root + public/):
- `server.js` — Express static server + Socket.IO connection handler
- `matchmaking.js` — in-memory queue + activeGames/socketRooms Maps, randomUUID room ids
- `game.js` — TicTacToeGame class (pure logic)
- `public/client.js`, `public/index.html`, `public/style.css` — frontend (vanilla JS, no React)
- `game.test.js` — node:test unit tests

**Why:** The shared CLAUDE.md (at D:\dev\src\claude\.claude) references `server/src/routes/`, `server/src/db/schema.ts`, JWT, sameSite cookies, React `src/components/` — NONE of these exist in this project. That CLAUDE.md appears to describe a different/template project.

**How to apply:** For security reviews here, ignore CLAUDE.md's auth/DB/cookie/JWT context — there is no DB, no auth, no cookies, no HTTP API beyond static file serving. Focus on Socket.IO event handlers, in-memory state DoS, and missing input validation in `make-move`/`find-game`. Re-verify file layout before future reviews in case it migrates to the TS stack.
