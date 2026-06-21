const { test } = require("node:test");
const assert = require("node:assert/strict");

/*
  node --test matchmaking.test.js
*/

function makeSocket(id) {
  const events = [];
  const rooms = [];
  return {
    id,
    events,
    rooms,
    emit(event, data) { events.push({ event, data }); },
    join(room) { rooms.push(room); },
  };
}

function fresh() {
  const resolved = require.resolve('./matchmaking');
  delete require.cache[resolved];
  return require('./matchmaking');
}

// --- addToQueue ---

test("first socket in queue emits waiting", () => {
  const { addToQueue } = fresh();
  const s1 = makeSocket("s1");
  const io = { sockets: { sockets: new Map() } };

  addToQueue(s1, io);

  assert.equal(s1.events.length, 1);
  assert.equal(s1.events[0].event, "waiting");
});

test("second socket triggers a match — both receive game-start with X and O", () => {
  const { addToQueue } = fresh();
  const s1 = makeSocket("s1");
  const s2 = makeSocket("s2");
  const io = { sockets: { sockets: new Map() } };

  addToQueue(s1, io);
  addToQueue(s2, io);

  const e1 = s1.events.find(e => e.event === "game-start");
  const e2 = s2.events.find(e => e.event === "game-start");
  assert.ok(e1, "s1 should receive game-start");
  assert.ok(e2, "s2 should receive game-start");
  assert.deepEqual(new Set([e1.data.symbol, e2.data.symbol]), new Set(["X", "O"]));
  assert.equal(e1.data.roomId, e2.data.roomId);
});

test("second socket triggers a match — both appear in activeGames and socketRooms", () => {
  const { addToQueue, activeGames, socketRooms } = fresh();
  const s1 = makeSocket("s1");
  const s2 = makeSocket("s2");
  const io = { sockets: { sockets: new Map() } };

  addToQueue(s1, io);
  addToQueue(s2, io);

  assert.equal(activeGames.size, 1);
  assert.equal(socketRooms.has("s1"), true);
  assert.equal(socketRooms.has("s2"), true);
  assert.equal(socketRooms.get("s1"), socketRooms.get("s2"));
});

test("adding same socket twice is a no-op", () => {
  const { addToQueue } = fresh();
  const s1 = makeSocket("s1");
  const io = { sockets: { sockets: new Map() } };

  addToQueue(s1, io);
  addToQueue(s1, io);

  assert.equal(s1.events.filter(e => e.event === "waiting").length, 1);
});

test("socket already in a game is not re-queued", () => {
  const { addToQueue, activeGames } = fresh();
  const s1 = makeSocket("s1");
  const s2 = makeSocket("s2");
  const s3 = makeSocket("s3");
  const io = { sockets: { sockets: new Map() } };

  addToQueue(s1, io);
  addToQueue(s2, io); // s1 and s2 are now in a game

  addToQueue(s1, io); // s1 already in a game — should be ignored
  addToQueue(s3, io); // s3 should wait, not match s1

  assert.equal(s3.events[0].event, "waiting");
  assert.equal(activeGames.size, 1);
});

// --- removeFromQueue ---

test("removeFromQueue removes a waiting player", () => {
  const { addToQueue, removeFromQueue } = fresh();
  const s1 = makeSocket("s1");
  const s2 = makeSocket("s2");
  const io = { sockets: { sockets: new Map() } };

  addToQueue(s1, io);
  removeFromQueue(s1);
  addToQueue(s2, io); // s2 should wait — s1 is gone

  assert.equal(s2.events[0].event, "waiting");
});

test("removeFromQueue is a no-op for unknown socket", () => {
  const { removeFromQueue } = fresh();
  const s1 = makeSocket("s1");

  assert.doesNotThrow(() => removeFromQueue(s1));
});

// --- cleanupGame ---

test("cleanupGame removes both players from socketRooms and the room from activeGames", () => {
  const { addToQueue, cleanupGame, activeGames, socketRooms } = fresh();
  const s1 = makeSocket("s1");
  const s2 = makeSocket("s2");
  const io = { sockets: { sockets: new Map() } };

  addToQueue(s1, io);
  addToQueue(s2, io);

  const roomId = socketRooms.get("s1");
  cleanupGame(roomId);

  assert.equal(activeGames.has(roomId), false);
  assert.equal(socketRooms.has("s1"), false);
  assert.equal(socketRooms.has("s2"), false);
});

test("cleanupGame is a no-op for unknown roomId", () => {
  const { cleanupGame } = fresh();

  assert.doesNotThrow(() => cleanupGame("no-such-room"));
});

// --- handleDisconnect ---

test("handleDisconnect removes disconnecting player from waiting queue", () => {
  const { addToQueue, handleDisconnect } = fresh();
  const s1 = makeSocket("s1");
  const s2 = makeSocket("s2");
  const io = { sockets: { sockets: new Map() } };

  addToQueue(s1, io);
  handleDisconnect(s1, io);
  addToQueue(s2, io); // s2 should wait — s1 was removed

  assert.equal(s2.events[0].event, "waiting");
});

test("handleDisconnect notifies opponent with opponent-left and cleans up maps", () => {
  const { addToQueue, handleDisconnect, activeGames, socketRooms } = fresh();
  const s1 = makeSocket("s1");
  const s2 = makeSocket("s2");
  const ioSockets = new Map();
  const io = { sockets: { sockets: ioSockets } };

  addToQueue(s1, io);
  addToQueue(s2, io);
  ioSockets.set("s1", s1);
  ioSockets.set("s2", s2);

  const roomId = socketRooms.get("s1");
  handleDisconnect(s1, io);

  assert.equal(activeGames.has(roomId), false);
  assert.equal(socketRooms.has("s1"), false);
  assert.equal(socketRooms.has("s2"), false);
  assert.ok(s2.events.some(e => e.event === "opponent-left"));
});

test("handleDisconnect is a no-op for unknown socket", () => {
  const { handleDisconnect } = fresh();
  const s1 = makeSocket("s1");
  const io = { sockets: { sockets: new Map() } };

  assert.doesNotThrow(() => handleDisconnect(s1, io));
});
