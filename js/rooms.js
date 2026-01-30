/* =====================================================
   ROOMS LOGIC
   Vertex Escape — Tech Odyssey
===================================================== */
const DEV_MODE = false; // 🔥 set false before final event
let currentSequence = [];
let playerSequence = [];
let acceptingInput = false;

/* =====================================================
   ROOM LOADER
===================================================== */

function loadRoom(roomNumber) {
  switch (roomNumber) {
    case 1:
      loadRoom1();
      break;
    case 2:
      loadRoom2();
      break;
      case 3:
  loadRoom3();
  break;
    case 4:
  loadRoom4();
  break;
  case 5:
  loadRoom5();
  break;
case 6:
  loadRoom6();
  break;

    default:
      break;
  }
}
/* =====================================================
   DEV MODE — ROOM SKIP (rooms.js)
===================================================== */

if (DEV_MODE) {
  document.addEventListener("keydown", e => {

    // Jump directly to any room (1–6)
    if (e.key >= "1" && e.key <= "6") {
      loadRoom(Number(e.key));
      console.log("DEV → Jumped to Room", e.key);
    }

    // Force next room
    if (e.key.toLowerCase() === "n") {
      unlockNextRoom();
      console.log("DEV → Forced Next Room");
    }
  });
}


/* =====================================================
   ROOM 1 — NEON PULSE GATE
===================================================== */

function loadRoom1() {
  const room = document.getElementById("room-1");

  room.innerHTML = `
    <div class="center-wrapper">
      <h2 class="room-title accent-glow">Neon Pulse Gate</h2>
      <p class="room-instruction">
        Observe the pulses.<br>
        Repeat the sequence.
      </p>

      <div class="pulse-grid">
        ${createPulseTiles(9)}
      </div>
    </div>
  `;

  setupPulseGame(room);
}

/* =====================================================
   PULSE GRID CREATION
===================================================== */

function createPulseTiles(count) {
  let tiles = "";
  for (let i = 0; i < count; i++) {
    tiles += `<div class="pulse-tile" data-index="${i}"></div>`;
  }
  return tiles;
}

/* =====================================================
   GAME LOGIC
===================================================== */

function generatePulseSequence(length, max) {
  const seq = [];
  for (let i = 0; i < length; i++) {
    seq.push(Math.floor(Math.random() * max));
  }
  return seq;
}

function setupPulseGame(room) {
  const tiles = Array.from(room.querySelectorAll(".pulse-tile"));

  currentSequence = [];
  playerSequence = [];
  acceptingInput = false;

  // Generate random sequence
  currentSequence = generatePulseSequence(5, tiles.length);

  // Play sequence visually
  playSequence(tiles, currentSequence).then(() => {
    acceptingInput = true;
  }); 

  // Player input
  tiles.forEach(tile => {
    tile.addEventListener("click", () => {
      if (!acceptingInput) return;

      const index = Number(tile.dataset.index);
      playerSequence.push(index);

      flashTile(tile);

      const step = playerSequence.length - 1;

      // Wrong input
      if (playerSequence[step] !== currentSequence[step]) {
        resetPulseGame(tiles);
        return;
      }

      // Completed correctly
      if (playerSequence.length === currentSequence.length) {
        acceptingInput = false;
        setTimeout(() => {
          unlockNextRoom();
        }, 600);
      }
    });
  });
}

/* =====================================================
   ANIMATIONS
===================================================== */

function playSequence(tiles, sequence) {
  return new Promise(resolve => {
    let i = 0;

    const interval = setInterval(() => {
      flashTile(tiles[sequence[i]]);
      i++;

      if (i >= sequence.length) {
        clearInterval(interval);
        setTimeout(resolve, 400);
      }
    }, 700);
  });
}

function flashTile(tile) {
  tile.classList.add("active");
  setTimeout(() => {
    tile.classList.remove("active");
  }, 350);
}

function resetPulseGame(tiles) {
  acceptingInput = false;
  playerSequence = [];

  tiles.forEach(t => t.classList.add("shake"));

  setTimeout(() => {
    tiles.forEach(t => t.classList.remove("shake"));
    playSequence(tiles, currentSequence).then(() => {
      acceptingInput = true;
    });
  }, 600);
}
/* =====================================================
   ROOM 2 — CHROMATIC DRIFT (FINAL STABLE VERSION)
===================================================== */

const GRID = 10;
const CELL = 24;
const WALL = 10;
const ORB_SIZE = 14;

let maze, orb, goal;
let grid = [];
let orbX, orbY;
let active, alive, locked;
let lastX, lastY;

/* -------------------------------
   LOAD ROOM
-------------------------------- */

function loadRoom2() {
  // FULL STATE RESET (CRITICAL)
  active = false;
  alive = true;
  locked = false;
  lastX = lastY = null;

  const room = document.getElementById("room-2");
  room.innerHTML = `
    <div class="center-wrapper">
      <h2 class="room-title accent-glow">Chromatic Drift</h2>
      <div class="maze-container">
        <div class="maze" id="maze"></div>
      </div>
      <p class="room-instruction">
        Click inside the maze to begin.<br>
        Touch a wall once and the system resets.
      </p>
    </div>
  `;

  maze = document.getElementById("maze");

  generateMaze();
  renderMaze();
  placeOrbAndGoal();
  setupInput();

  requestAnimationFrame(gameLoop);
}

/* -------------------------------
   MAZE GENERATION (WITH SPAWN EXIT)
-------------------------------- */

function generateMaze() {
  grid = [];

  for (let y = 0; y < GRID; y++) {
    grid[y] = [];
    for (let x = 0; x < GRID; x++) {
      grid[y][x] = {
        visited: false,
        walls: { top: true, right: true, bottom: true, left: true }
      };
    }
  }

  // 🔒 SPAWN CELL (0,0)
  grid[0][0].visited = true;
  grid[0][0].walls.right = false;

  // CONNECT SPAWN TO MAZE
  grid[0][1].walls.left = false;

  // Generate maze starting AFTER spawn
  carve(1, 0);
}

function carve(x, y) {
  grid[y][x].visited = true;

  const dirs = shuffle([
    [0, -1, "top", "bottom"],
    [1, 0, "right", "left"],
    [0, 1, "bottom", "top"],
    [-1, 0, "left", "right"]
  ]);

  for (const [dx, dy, w1, w2] of dirs) {
    const nx = x + dx;
    const ny = y + dy;

    if (
      nx >= 0 && ny >= 0 &&
      nx < GRID && ny < GRID &&
      !grid[ny][nx].visited
    ) {
      grid[y][x].walls[w1] = false;
      grid[ny][nx].walls[w2] = false;
      carve(nx, ny);
    }
  }
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

/* -------------------------------
   RENDER MAZE
-------------------------------- */

function renderMaze() {
  maze.innerHTML = "";

  const size = GRID * CELL + (GRID + 1) * WALL;
  maze.style.width = maze.style.height = size + "px";

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const cell = grid[y][x];
      const bx = x * (CELL + WALL);
      const by = y * (CELL + WALL);

      if (cell.walls.top)    wall(bx + WALL, by, CELL, WALL);
      if (cell.walls.left)   wall(bx, by + WALL, WALL, CELL);
      if (cell.walls.right)  wall(bx + WALL + CELL, by + WALL, WALL, CELL);
      if (cell.walls.bottom) wall(bx + WALL, by + WALL + CELL, CELL, WALL);
    }
  }
}

function wall(x, y, w, h) {
  const d = document.createElement("div");
  d.className = "wall";
  d.style.left = x + "px";
  d.style.top = y + "px";
  d.style.width = w + "px";
  d.style.height = h + "px";
  maze.appendChild(d);
}

/* -------------------------------
   ORB & GOAL
-------------------------------- */

function cellCenter(x, y) {
  return {
    x: x * (CELL + WALL) + WALL + CELL / 2 - ORB_SIZE / 2,
    y: y * (CELL + WALL) + WALL + CELL / 2 - ORB_SIZE / 2
  };
}

function placeOrbAndGoal() {
  orb = document.createElement("div");
  orb.className = "orb";

  goal = document.createElement("div");
  goal.className = "goal";

  const start = cellCenter(0, 0);
  const end = cellCenter(GRID - 1, GRID - 1);

  orbX = start.x;
  orbY = start.y;

  goal.style.left = end.x + "px";
  goal.style.top = end.y + "px";

  maze.appendChild(orb);
  maze.appendChild(goal);
}

/* -------------------------------
   INPUT
-------------------------------- */

function setupInput() {
  maze.onmousedown = e => {
    active = true;
    lastX = e.clientX;
    lastY = e.clientY;
  };

  maze.onmousemove = e => {
    if (!active || !alive) return;
    orbX += e.clientX - lastX;
    orbY += e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
  };
}

/* -------------------------------
   LOOP & COLLISION
-------------------------------- */

function gameLoop() {
  if (alive) {
    orb.style.left = orbX + "px";
    orb.style.top = orbY + "px";
    checkCollision();
  }
  requestAnimationFrame(gameLoop);
}

function checkCollision() {
  if (locked) return;

  const o = orb.getBoundingClientRect();
  const m = maze.getBoundingClientRect();
  const g = goal.getBoundingClientRect();

  if (
    o.left < m.left || o.right > m.right ||
    o.top < m.top || o.bottom > m.bottom
  ) return fail();

  for (const w of maze.querySelectorAll(".wall")) {
    const r = w.getBoundingClientRect();
    if (
      o.left < r.right &&
      o.right > r.left &&
      o.top < r.bottom &&
      o.bottom > r.top
    ) return fail();
  }

  if (
    o.left < g.right &&
    o.right > g.left &&
    o.top < g.bottom &&
    o.bottom > g.top
  ) {
    alive = false;
    setTimeout(unlockNextRoom, 800);
  }
}

function fail() {
  if (locked) return;
  locked = true;
  alive = false;
  setTimeout(loadRoom2, 800);
}



/* =====================================================
   ROOM 3 — SPECTRUM SYNC (RHYTHM)
===================================================== */

let rhythmPattern = [];
let playerTaps = [];
let lastTapTime = null;
let listening = false;

function loadRoom3() {
  const room = document.getElementById("room-3");

  room.innerHTML = `
    <div class="center-wrapper">
      <h2 class="room-title accent-glow">Spectrum Sync</h2>

      <div class="rhythm-core" id="rhythm-core"></div>

      <p class="room-instruction">
        Watch the pulses.<br>
        Repeat the rhythm.
      </p>
    </div>
  `;

  generateRhythm();
  playRhythm();
  setupRhythmInput();
}

/* -------------------------------
   RHYTHM GENERATION
-------------------------------- */

function generateRhythm() {
  rhythmPattern = [];
  const beats = 5;

  for (let i = 0; i < beats; i++) {
    rhythmPattern.push(300 + Math.random() * 400); // 300–700ms
  }
}

/* -------------------------------
   PLAY RHYTHM (VISUAL)
-------------------------------- */

function playRhythm() {
  const core = document.getElementById("rhythm-core");
  let i = 0;

  listening = false;
  playerTaps = [];
  lastTapTime = null;

  function pulse() {
    core.classList.add("pulse");

    setTimeout(() => {
      core.classList.remove("pulse");
    }, 180);

    i++;

    if (i < rhythmPattern.length) {
      setTimeout(pulse, rhythmPattern[i]);
    } else {
      // Allow player input after final beat
      setTimeout(() => {
        listening = true;
      }, 400);
    }
  }

  pulse();
}

/* -------------------------------
   PLAYER INPUT
-------------------------------- */

function setupRhythmInput() {
  document.onkeydown = e => {
    if (!listening) return;
    if (e.code !== "Space") return;

    registerTap();
  };

  document.ontouchstart = () => {
    if (!listening) return;
    registerTap();
  };
}

function registerTap() {
  const now = performance.now();

  if (lastTapTime !== null) {
    playerTaps.push(now - lastTapTime);
  }

  lastTapTime = now;

  if (playerTaps.length === rhythmPattern.length - 1) {
    checkRhythm();
  }
}

/* -------------------------------
   VALIDATION
-------------------------------- */

function checkRhythm() {
  listening = false;

  const tolerance = 160; // ms
  let success = true;

  for (let i = 0; i < playerTaps.length; i++) {
    if (Math.abs(playerTaps[i] - rhythmPattern[i + 1]) > tolerance) {
      success = false;
      break;
    }
  }

  if (success) {
    setTimeout(() => unlockNextRoom(), 500);
  } else {
    setTimeout(() => {
      generateRhythm();
      playRhythm();
    }, 600);
  }
}
/* =====================================================
   ROOM 4 — PATTERN GRID (4x4, LOGIC PUZZLE)
===================================================== */
function loadRoom4() {
  const room = document.getElementById("room-4");

  room.innerHTML = `
    <div class="center-wrapper wide">
      <h2 class="room-title accent-glow">Logic Matrix</h2>

      <div class="rules-box">
        <p><b>SYSTEM RULES</b></p>
        <ul>
          <li>No shape may repeat in a <b>row</b></li>
          <li>No shape may repeat in a <b>column</b></li>
          <li>No shape may repeat in a <b>2×2 block</b></li>
          <li>Some shapes are <b>locked</b></li>
        </ul>
      </div>

      <div class="matrix-wrapper">
        <div id="logic-grid"></div>
      </div>

      <p id="logic-hint" class="room-instruction subtle">
        Think block by block.
      </p>
    </div>
  `;

  /* ============================
     CONFIG
  ============================ */
  const SIZE = 4;
  const SHAPES = ["circle", "square", "triangle", "diamond"];
  const ICON = {
    circle: "●",
    square: "■",
    triangle: "▲",
    diamond: "◆"
  };

  const gridEl = document.getElementById("logic-grid");
  const hintEl = document.getElementById("logic-hint");

  let solution = [];
  let grid = [];
  let locked = [];

  /* ============================
     UTILITIES
  ============================ */
  function shuffle(arr) {
    return arr.slice().sort(() => Math.random() - 0.5);
  }

  function unique(arr) {
    return new Set(arr).size === arr.length;
  }

  /* ============================
     GENERATE SOLUTION (VALID)
  ============================ */
  function generateSolution() {
    const base = shuffle(SHAPES);
    solution = [];

    for (let r = 0; r < SIZE; r++) {
      solution[r] = [];
      for (let c = 0; c < SIZE; c++) {
        solution[r][c] = base[(r * 2 + Math.floor(r / 2) + c) % SIZE];
      }
    }
  }

  /* ============================
     GENERATE PUZZLE
  ============================ */
  function generatePuzzle() {
    grid = solution.map(row => row.slice());
    locked = Array(SIZE).fill(0).map(() => Array(SIZE).fill(false));

    const positions = shuffle(
      [...Array(16).keys()]
    ).slice(0, 4);

    // Lock 4 random cells
    positions.forEach(i => {
      const r = Math.floor(i / 4);
      const c = i % 4;
      locked[r][c] = true;
    });

    // Clear other cells
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!locked[r][c]) grid[r][c] = SHAPES[0];
      }
    }
  }

  /* ============================
     RENDER
  ============================ */
  function render() {
    gridEl.innerHTML = "";
    gridEl.className = "logic-grid";

    grid.forEach((row, r) => {
      row.forEach((shape, c) => {
        const cell = document.createElement("div");
        cell.className = "logic-cell";
        if (locked[r][c]) cell.classList.add("locked");

        cell.innerHTML = ICON[shape];

        if (!locked[r][c]) {
          cell.onclick = () => {
            const i = SHAPES.indexOf(grid[r][c]);
            grid[r][c] = SHAPES[(i + 1) % SHAPES.length];
            render();
            validate();
          };
        }

        gridEl.appendChild(cell);
      });
    });
  }

  /* ============================
     VALIDATION
  ============================ */
  function validate() {
    // Rows
    for (let r = 0; r < SIZE; r++) {
      if (!unique(grid[r])) {
        return fail("Duplicate in a row.");
      }
    }

    // Columns
    for (let c = 0; c < SIZE; c++) {
      const col = grid.map(row => row[c]);
      if (!unique(col)) {
        return fail("Duplicate in a column.");
      }
    }

    // 2x2 blocks
    for (let br = 0; br < 4; br += 2) {
      for (let bc = 0; bc < 4; bc += 2) {
        const block = [
          grid[br][bc],
          grid[br][bc + 1],
          grid[br + 1][bc],
          grid[br + 1][bc + 1]
        ];
        if (!unique(block)) {
          return fail("Conflict inside a block.");
        }
      }
    }

    success();
  }

  function fail(msg) {
    hintEl.textContent = msg;
    gridEl.classList.remove("solved");
  }

  function success() {
    hintEl.textContent = "Matrix stabilized.";
    gridEl.classList.add("solved");
    unlockNextRoom();
  }

  /* ============================
     INIT
  ============================ */
  generateSolution();
  generatePuzzle();
  render();
}

/* =====================================
   ROOM 5 — SAVE YOUR ESCAPE (FINAL)
===================================== */
/* =====================================================
   ROOM 5 — SAVE YOUR ESCAPE (FINAL, STABLE)
===================================================== */

let room5Solved = false;
let room5Debounce = null;

function loadRoom5() {
  /* 🔴 HARD RESET — prevents skipping */
  room5Solved = false;

  const room = document.getElementById("room-5");

  room.innerHTML = `
    <div class="room5-wrapper">

      <div class="room5-title">SAVE YOUR ESCAPE</div>

      <div class="room5-card" id="room5Card">

        <div class="room5-subtitle">
          Create an account to preserve your run<br>
          <span>vertexclub.in</span>
        </div>

        <input id="room5User" class="room5-input"
               placeholder="Your name (any name works)"
               autocomplete="off"/>

        <input id="room5Pass" class="room5-input"
               placeholder="Create password"
               autocomplete="off"/>

        <div id="room5Constraint" class="constraint-box">
          Waiting for password…
        </div>

        <button id="room5Save" class="room5-btn">
          SAVE & EXIT
        </button>

        <div id="room5Forgot" class="forgot-btn">
          Forgot password?
        </div>

      </div>
    </div>
  `;

  const userInput = document.getElementById("room5User");
  const passInput = document.getElementById("room5Pass");
  const constraintBox = document.getElementById("room5Constraint");
  const card = document.getElementById("room5Card");

  let isPasswordValid = false;

  /* =====================================================
     UTILITIES
  ===================================================== */

  function asciiEven(pw) {
    const sum = [...pw].reduce((a, c) => a + c.charCodeAt(0), 0);
    return sum % 2 === 0;
  }

  function countVowels(pw) {
    return (pw.match(/[aeiou]/gi) || []).length;
  }

  function alternatingCase(pw) {
    for (let i = 1; i < pw.length; i++) {
      if (
        /[a-z]/.test(pw[i]) &&
        /[a-z]/.test(pw[i - 1])
      ) return false;
      if (
        /[A-Z]/.test(pw[i]) &&
        /[A-Z]/.test(pw[i - 1])
      ) return false;
    }
    return true;
  }

  /* =====================================================
     20 CONSTRAINTS — ORDER MATTERS
     Only FIRST violation is shown
  ===================================================== */

  function check(pw, user) {
    if (pw.length !== 14)
      return "Password must be exactly 14 characters";

    if ((pw.match(/\d/g) || []).length !== 3)
      return "Exactly 3 digits required";

    if ((pw.match(/\d/g) || []).reduce((a, c) => a + Number(c), 0) !== 10)
      return "Digits must sum to 10";

    if ((pw.match(/[A-Z]/g)||[]).length !== 4)
  return "Exactly four uppercase letters required";


    if (/^[A-Z]|[A-Z]$/.test(pw))
      return "Uppercase cannot be first or last";

    if ((pw.match(/[^a-zA-Z0-9]/g) || []).length !== 2)
      return "Exactly two special characters required";

    if (/[^a-zA-Z0-9]{2}/.test(pw))
      return "Special characters cannot be adjacent";

    if (!/(a.*a|e.*e|i.*i|o.*o|u.*u)/i.test(pw))
      return "One vowel must repeat exactly twice";

    if (countVowels(pw) !== 4)
      return "Total vowels must be exactly 4";

    if (!alternatingCase(pw.replace(/[^a-zA-Z]/g, "")))
      return "Letters must alternate case";

    const hasX = pw.includes("X");
    const hasZ = pw.includes("Z");
    if ((hasX && hasZ) || (!hasX && !hasZ))
      return "Must contain X or Z (not both)";

    if (user && pw.toLowerCase().includes(user.toLowerCase()))
      return "Password cannot contain your name";

    if (/^\d/.test(pw))
      return "Password cannot start with a digit";

    if (/\d$/.test(pw))
      return "Password cannot end with a digit";

    if (!/[a-z]/.test(pw))
      return "At least one lowercase letter required";

    if (!pw.includes("@") && !pw.includes("#"))
      return "Must contain @ or #";

    if (/(\d)\1/.test(pw))
      return "Digits cannot repeat consecutively";

    if (/([a-zA-Z])\1/.test(pw))
      return "Letters cannot repeat consecutively";

    if (!asciiEven(pw))
      return "System checksum failed (hint: ASCII sum must be even)";

    if (pw.charCodeAt(0) + pw.charCodeAt(pw.length - 1) <= 150)
      return "First and last character are too weak together";

    return null;
  }

  /* =====================================================
     VALIDATION (DEBOUNCED)
  ===================================================== */

  function validatePassword() {
    const pw = passInput.value;
    const user = userInput.value.trim();

    const error = check(pw, user);

    if (error) {
      isPasswordValid = false;
      constraintBox.textContent = error;
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 450);
    } else {
      isPasswordValid = true;
      constraintBox.textContent =
        "All constraints satisfied. You may exit.";
    }
  }

  passInput.addEventListener("input", () => {
    clearTimeout(room5Debounce);
    room5Debounce = setTimeout(validatePassword, 600);
  });

  /* =====================================================
     SAVE & EXIT
  ===================================================== */

  document.getElementById("room5Save").onclick = () => {
    if (!isPasswordValid) {
      constraintBox.textContent = "You cannot exit yet.";
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 400);
      return;
    }

    room5Solved = true;

    document.querySelectorAll(".screen").forEach(s => {
      s.classList.remove("screen-active");
      s.setAttribute("aria-hidden", "true");
    });

    const r6 = document.getElementById("room-6");
    r6.classList.add("screen-active");
    r6.setAttribute("aria-hidden", "false");

    loadRoom6();
  };

  /* =====================================================
     FORGOT PASSWORD — PUNISHMENT
  ===================================================== */

  document.getElementById("room5Forgot").onclick = () => {
    const popup = document.createElement("div");
    popup.className = "savage-popup";
    popup.innerHTML = `
      <div>
        Forgot password during SIGN-UP?<br><br>
        Incredible confidence.<br>
        Rolling you back…
      </div>
    `;
    room.appendChild(popup);

    setTimeout(() => {
      rollbackToRoom4();
    }, 1800);
  };
}

/* =====================================================
   ROLLBACK (FIXED — NO SKIP)
===================================================== */

function rollbackToRoom4() {
  room5Solved = false;

  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("screen-active");
    s.setAttribute("aria-hidden", "true");
  });

  const r4 = document.getElementById("room-4");
  r4.classList.add("screen-active");
  r4.setAttribute("aria-hidden", "false");

  loadRoom4();
}

/* =====================================================
   ROOM 6 — FINAL NUMBER LOCK (ENGINE ISOLATED)
===================================================== */
const ROOM6_DEV_BYPASS = "9192-8907-3805";
const ROOM6_FINAL_CODE = ["4821", "7394", "1608"];

let room6Container = null;

function loadRoom6() {
  const room = document.getElementById("room-6");

  if (room6Container) {
    room6Container.remove();
    room6Container = null;
  }

  room6Container = document.createElement("div");
  room6Container.className = "room6-wrapper";

  room6Container.innerHTML = `
    <div class="room6-title">FINAL LOCK</div>

    <div class="room6-brief">
      Intelligence was scattered across the area.<br>
      Only <strong>three</strong> dead drops are valid.<br><br>
      Enter the codes in the <strong>correct order</strong>.
    </div>

    <div class="room6-lock">
      <input class="lock-input" maxlength="4" autocomplete="off" />
      <input class="lock-input" maxlength="4" autocomplete="off" />
      <input class="lock-input" maxlength="4" autocomplete="off" />
    </div>

    <button type="button" class="room6-submit">UNLOCK</button>

    <div class="room6-feedback" id="room6Feedback"></div>
  `;

  room.appendChild(room6Container);

  setupRoom6Logic();
}

function setupRoom6Logic() {
  const inputs = [...room6Container.querySelectorAll(".lock-input")];
  const submitBtn = room6Container.querySelector(".room6-submit");
  const feedback = document.getElementById("room6Feedback");

  inputs.forEach((input, index) => {
    /* FULL ISOLATION */
    ["keydown", "keyup", "input", "change"].forEach(evt => {
      input.addEventListener(evt, e => {
        e.stopPropagation();
        if (e.key === "Enter") e.preventDefault();
      });
    });

    input.addEventListener("input", e => {
      e.target.value = e.target.value.replace(/\D/g, "");

      if (e.target.value.length === 4 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });
  });

  submitBtn.onclick = e => {
    e.stopPropagation();

    const values = inputs.map(i => i.value);

    if (values.some(v => v.length !== 4)) {
      showRoom6Error("Incomplete code.");
      return;
    }

    const joined = values.join("-");

    if (joined === ROOM6_DEV_BYPASS) {
      unlockNextRoom();
      return;
    }

    for (let i = 0; i < 3; i++) {
      if (values[i] !== ROOM6_FINAL_CODE[i]) {
        showRoom6Error("Lock rejected. Surveillance triggered.");
        return;
      }
    }

    feedback.textContent = "Lock opened. Extraction successful.";
    feedback.className = "room6-feedback success";

    setTimeout(() => {
      unlockNextRoom();
    }, 1000);
  };
}

function showRoom6Error(msg) {
  const fb = document.getElementById("room6Feedback");
  fb.textContent = msg;
  fb.className = "room6-feedback";

  room6Container.classList.add("shake");
  setTimeout(() => room6Container.classList.remove("shake"), 450);
}


if (DEV_MODE) {
  const devBadge = document.createElement("div");
  devBadge.textContent = "DEV MODE";
  devBadge.style.cssText = `
    position: fixed;
    top: 12px;
    left: 12px;
    padding: 6px 12px;
    background: rgba(255, 60, 60, 0.9);
    color: white;
    font-weight: bold;
    font-size: 12px;
    border-radius: 10px;
    z-index: 9999;
  `;
  document.body.appendChild(devBadge);
}
