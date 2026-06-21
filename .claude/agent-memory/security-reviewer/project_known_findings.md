---
name: project-known-findings
description: Security findings identified in the tic-tac-toe Socket.IO game (2026-06-21 review) to watch for regressions
metadata:
  type: project
---

Security review of tic-tac-toe Socket.IO game on 2026-06-21 found (no DB/auth in scope):

- **Socket.IO CORS/origin: no allowlist.** `new Server(httpServer)` in server.js has no `cors` or `allowRequest` origin check → any web origin can connect (CSWSH-style). Watch if frontend ever moves cross-origin.
- **No input-type validation on `make-move` index.** server.js trusts `{ index }`; game.js makeMove only does `cellIndex < 0 || > 8` numeric range — non-numeric/object/float indices not type-checked. Low impact today but fragile.
- **No rate limiting** on `find-game` / `make-move` events → spam/DoS of in-memory Maps (waitingQueue, activeGames). No cap on concurrent games.
- **IDOR-resistant by design (good):** server derives roomId from `socketRooms.get(socket.id)` and symbol from server-side `room.players[socket.id]`, ignoring client-supplied roomId. Authoritative game state lives server-side in game.js. KEEP THIS PATTERN — do not start trusting client-supplied roomId/symbol.
- **No Socket.IO `maxHttpBufferSize` lowering / connection limits.**

**Why:** These are the realistic risks for a no-auth realtime game; the authoritative-server-state pattern is the main thing protecting it.
**How to apply:** Flag regressions if a future change makes the server trust client-sent roomId/symbol, or adds cross-origin without a CORS allowlist.
