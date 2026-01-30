/* =====================================================
   GAME ENGINE
   Vertex Escape — Tech Odyssey
   Scene-based, Apple-smooth navigation
===================================================== */

/* -------------------------------
   GLOBAL TIMER STATE
-------------------------------- */

// Stores time spent in each room (seconds)
window.roomTimes = {};

// Timestamp when current room started
window.currentRoomStart = null;

/* -------------------------------
   ENGINE STATE
-------------------------------- */

const Engine = {
  currentScreen: 'start-screen',
  currentRoom: 0,
  totalRooms: 6,
  locked: false
};

/* -------------------------------
   DOM CACHE
-------------------------------- */

const screens = Array.from(document.querySelectorAll('.screen'));
const startBtn = document.getElementById('start-btn');

/* -------------------------------
   CORE SCREEN HANDLER
-------------------------------- */

function showScreen(id) {
  if (Engine.locked) return;

  Engine.locked = true;

  screens.forEach(screen => {
    screen.classList.remove('screen-active');
    screen.setAttribute('aria-hidden', 'true');
  });

  const target = document.getElementById(id);
  if (!target) {
    console.error(`Screen not found: ${id}`);
    Engine.locked = false;
    return;
  }

  target.classList.add('screen-active');
  target.setAttribute('aria-hidden', 'false');
  Engine.currentScreen = id;

  // Smooth unlock after animation
  setTimeout(() => {
    Engine.locked = false;
  }, 600);
}

/* -------------------------------
   GAME FLOW
-------------------------------- */

function startGame() {
  // Reset engine
  Engine.currentRoom = 1;

  // ⏱️ Start timing Room 1
  window.currentRoomStart = Date.now();

  showScreen('room-1');

  // Let rooms.js inject content
  if (typeof loadRoom === 'function') {
    loadRoom(1);
  }
}

function completeRoom() {
  if (Engine.locked) return;

  const now = Date.now();

  /* --------------------------------
     SAVE TIME FOR CURRENT ROOM
  --------------------------------- */
  if (window.currentRoomStart !== null) {
    const seconds = Math.round(
      (now - window.currentRoomStart) / 1000
    );
    window.roomTimes[Engine.currentRoom] = seconds;
  }

  /* --------------------------------
     MOVE TO NEXT ROOM
  --------------------------------- */
  Engine.currentRoom++;

  // ⏱️ Start timer for next room
  window.currentRoomStart = Date.now();

  /* --------------------------------
     END GAME
  --------------------------------- */
  if (Engine.currentRoom > Engine.totalRooms) {
    console.table(window.roomTimes); // Organizer summary
    showScreen('end-screen');
    return;
  }

  const nextRoomId = `room-${Engine.currentRoom}`;
  showScreen(nextRoomId);

  if (typeof loadRoom === 'function') {
    loadRoom(Engine.currentRoom);
  }
}

/* -------------------------------
   SAFETY & INPUT CONTROL
-------------------------------- */

// Prevent accidental scrolling (mobile)
document.addEventListener(
  'touchmove',
  e => e.preventDefault(),
  { passive: false }
);

// Disable right-click during event
document.addEventListener('contextmenu', e => {
  e.preventDefault();
});

/* -------------------------------
   START BUTTON
-------------------------------- */

startBtn.addEventListener('click', startGame);

/* -------------------------------
   PUBLIC API (FOR ROOMS)
-------------------------------- */

// Rooms call this when solved
window.unlockNextRoom = completeRoom;

// Optional debug access
window.__ENGINE__ = Engine;

/* =====================================================
   GLOBAL FEEDBACK POLISH
===================================================== */

function flashSuccess() {
  const root = document.getElementById('game-root');
  root.classList.add('success-flash');
  setTimeout(() => root.classList.remove('success-flash'), 400);
}

function flashFailure() {
  const root = document.getElementById('game-root');
  root.classList.add('failure-flash');
  setTimeout(() => root.classList.remove('failure-flash'), 400);
}
