# Security Review — Multiplayer Tic-Tac-Toe

**Date:** 2026-06-21  
**Reviewer:** Claude security-reviewer agent  
**Scope:** `server.js`, `matchmaking.js`, `game.js`, `public/client.js`, `public/index.html`, `package.json`

---

## Scope Note

The actual codebase is a plain-JavaScript (CommonJS) Socket.IO realtime game — not the TypeScript/React/Express-REST stack described in `CLAUDE.md`. Consequently there is **no SQL injection surface, no auth/session/JWT, no cookies, no CORS-relevant HTTP API, and no React/`dangerouslySetInnerHTML` surface** to review.

Dependency versions are current: `express@5.2.1`, `socket.io@4.8.3`, `engine.io@6.6.9`, `ws@8.21.0`. No known critical CVEs apply. Run `npm audit` in CI to stay current.

---

## Critical Vulnerabilities

None found.

---

## High Severity

### H1 — Socket.IO accepts connections from any origin (Cross-Site WebSocket Hijacking)
- **Location:** `server.js:14` — `const io = new Server(httpServer);`
- **Vulnerability:** No `cors` option or `allowRequest` origin check. Any web page on any origin can open a Socket.IO connection and emit `find-game` / `make-move`. Combined with H2, an attacker-controlled page can flood the matchmaking queue.
- **Remediation:**
  ```js
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });
  ```
- **References:** OWASP — Cross-Site WebSocket Hijacking; Socket.IO CORS docs.

### H2 — No rate limiting or resource caps on Socket.IO events (DoS)
- **Location:** `server.js:21-51`; `matchmaking.js:4-41`
- **Vulnerability:** A single connection can emit `find-game` and `make-move` without throttling. `activeGames` and `socketRooms` are unbounded in-memory `Map`s.
- **Remediation:**
  - Lower `maxHttpBufferSize`: `new Server(httpServer, { maxHttpBufferSize: 1024 })`
  - Add per-socket event throttling on `make-move`; ignore repeated `find-game` within N ms
  - Cap `waitingQueue`/`activeGames` size; add IP-based rate limiting at the proxy layer

---

## Medium Severity

### M1 — `make-move` index is not type-validated
- **Location:** `server.js:25` → `game.js:40`
- **Vulnerability:** Client-supplied `index` is not checked to be an integer before being passed to `makeMove`. Non-integer values (`3.5`, `"2"`, `NaN`) are only caught by JS coercion quirks, not explicit validation.
- **Remediation:**
  ```js
  socket.on('make-move', ({ index }) => {
    if (!Number.isInteger(index) || index < 0 || index > 8) return;
    // ...
  });
  ```
- **References:** OWASP — Improper Input Validation (CWE-20).

---

## Low Severity / Best Practice

### L1 — No security headers on static responses
- **Location:** `server.js:16`
- **Recommendation:** Add `helmet` for `X-Content-Type-Options`, `X-Frame-Options: DENY`, and a restrictive `Content-Security-Policy`.

### L2 — No HTTPS/WSS enforcement
- **Location:** `server.js:60`
- **Recommendation:** Terminate TLS at a reverse proxy and redirect HTTP→HTTPS so Socket.IO upgrades to WSS in production.

### L3 — Verbose connection logging
- **Location:** `server.js:19,54`
- **Recommendation:** Use a leveled/sampled logger in production to avoid log flooding under abuse conditions.

### L4 — Dual cleanup path divergence risk
- **Location:** `matchmaking.js:48-53`; `server.js:49`
- **Note:** `cleanupGame` and `handleDisconnect` overlap in responsibility. No current leak, but worth a unit test covering disconnect-after-game-over ordering to guard against future regressions.

---

## Security Positives

- **Server-authoritative game state** — client-supplied `roomId` is ignored; room and symbol are derived server-side from `socketRooms` and `room.players`. Players cannot spoof rooms, symbols, or move out of turn.
- **No XSS sink** — frontend renders only via `textContent`/`className`, never `innerHTML`. Board symbols are server-constrained to `"X"`/`"O"`.
- **No `eval`, `Function()`, dynamic `import()`, or `child_process`** anywhere in source.
- **No secrets or credentials** in the repo.
- **Matchmaking guards against double-queue / self-match** (`matchmaking.js:9-14`).
- **Dependencies are current** and minimal.

---

## Recommended Next Steps (priority order)

1. Add a Socket.IO CORS origin allowlist (H1)
2. Add event rate limiting + `maxHttpBufferSize` + connection caps (H2)
3. Add explicit integer validation on `make-move` index (M1)
4. Add `helmet` for static-response security headers (L1)
