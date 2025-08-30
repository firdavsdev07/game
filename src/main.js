import "./style.css"
import "./style.css"
// DOM Elements
const startGameBtn = document.getElementById("start-game");
const modalStart = document.querySelector(".modal-start");
const gameWrapper = document.getElementById("game-wrapper");
const gameArea = document.getElementById("game-area");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const gameMessage = document.getElementById("game-message");
const playAudio = document.getElementById("play-audio");

// Control buttons
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const soundBtn = document.getElementById("sound-btn");
const speedBtns = document.querySelectorAll(".speed-btn");

// Direction buttons
const upBtn = document.getElementById("up-btn");
const downBtn = document.getElementById("down-btn");
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");

// Info elements
const infoBtn = document.getElementById("info-btn");
const modalInfo = document.getElementById("modal-info");
const closeInfo = document.getElementById("close-info");

// Game variables
const GRID_SIZE = 20;
let gameSpeed = 300; // Default speed
let snake = [{ x: 10, y: 10 }];
let food = generateFoodPosition();
let direction = { x: 0, y: 0 };
let score = 0;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let gameInterval;
let isGameRunning = false;
let isGamePaused = false;
let isSoundEnabled = true;

// Initialize game
gameWrapper.style.display = "none";
highScoreEl.textContent = highScore;

// Create game board
function createGameBoard() {
  gameArea.innerHTML = "";
  gameArea.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
  gameArea.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const cell = document.createElement("div");
    cell.classList.add("game-cell");
    gameArea.appendChild(cell);
  }
}

// Draw snake and food
function draw() {
  const cells = document.querySelectorAll(".game-cell");
  cells.forEach(cell => {
    cell.classList.remove("snake", "food");
  });

  // Draw snake
  snake.forEach(segment => {
    const index = segment.y * GRID_SIZE + segment.x;
    if (cells[index]) {
      cells[index].classList.add("snake");
    }
  });

  // Draw food
  const foodIndex = food.y * GRID_SIZE + food.x;
  if (cells[foodIndex]) {
    cells[foodIndex].classList.add("food");
  }
}

// Move Snake
function move() {
  const head = { ...snake[0] };
  head.x += direction.x;
  head.y += direction.y;

  snake.unshift(head);

  // Check for food collision
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    food = generateFoodPosition();

    // Play eating sound effect (simple beep)
    if (isSoundEnabled) {
      playBeep();
    }
  } else {
    snake.pop();
  }
}

// Check for collisions
function checkCollisions() {
  const head = snake[0];

  // Wall collision
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    endGame();
    return;
  }

  // Self collision
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      endGame();
      return;
    }
  }
}

// Generate random food position
function generateFoodPosition() {
  let newFoodPosition;
  do {
    newFoodPosition = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (onSnake(newFoodPosition));
  return newFoodPosition;
}

function onSnake(position) {
  return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

// Game Loop
function gameLoop() {
  if (!isGameRunning || isGamePaused) return;

  move();
  checkCollisions();
  draw();
}

// Start Game
function startGame() {
  modalStart.style.display = "none";
  gameWrapper.style.display = "flex";
  gameMessage.style.display = "none";

  createGameBoard();

  // Reset game state
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  score = 0;
  scoreEl.textContent = score;
  food = generateFoodPosition();
  isGameRunning = true;
  isGamePaused = false;

  // Update pause button
  updatePauseButton();

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, gameSpeed);

  draw();

  if (isSoundEnabled) {
    playAudio.play().catch(() => {
      // Handle autoplay restriction
      console.log("Audio autoplay blocked");
    });
  }
}

// End Game
function endGame() {
  isGameRunning = false;
  isGamePaused = false;
  clearInterval(gameInterval);

  if (isSoundEnabled) {
    playAudio.pause();
    playAudio.currentTime = 0;
  }

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    highScoreEl.textContent = highScore;
  }

  gameMessage.classList.add("game-over");
  gameMessage.style.display = "flex"; // Use flex to center content
  gameMessage.innerHTML = `
    <div class="game-over-content">
      <h2>Game Over!</h2>
      <p>Your score: ${score}</p>
      <button class="control-btn" id="game-over-restart-btn" title="Restart Game">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-rotate-cw">
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      </button>
    </div>
  `;

  // Add event listener to the new restart button
  document.getElementById("game-over-restart-btn").addEventListener("click", startGame);

  updatePauseButton();
}

// Pause/Resume Game
function togglePause() {
  if (!isGameRunning) return;

  isGamePaused = !isGamePaused;
  updatePauseButton();

  if (isGamePaused) {
    gameMessage.classList.add("paused");
    gameMessage.style.display = "flex";
    gameMessage.innerHTML = `
      <h2>Game Paused</h2>
      <p>Press pause button or spacebar to resume</p>
      <button id="continue-btn">Continue</button>
    `;

    // Add event listener to continue button
    document.getElementById("continue-btn").addEventListener("click", togglePause);

    if (isSoundEnabled) {
      playAudio.pause();
    }
  } else {
    gameMessage.style.display = "none";
    gameMessage.classList.remove("paused");

    if (isSoundEnabled) {
      playAudio.play().catch(() => {
        console.log("Audio play blocked");
      });
    }
  }
}

// Update pause button icon
function updatePauseButton() {
  const pauseIcon = pauseBtn.querySelector("svg");

  if (isGamePaused && isGameRunning) {
    // Show play icon
    pauseIcon.innerHTML = `
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    `;
  } else {
    // Show pause icon
    pauseIcon.innerHTML = `
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    `;
  }
}

// Toggle sound
function toggleSound() {
  isSoundEnabled = !isSoundEnabled;

  if (!isSoundEnabled) {
    playAudio.pause();
    soundBtn.classList.add("muted");
    soundBtn.querySelector("svg").innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    `;
  } else {
    soundBtn.classList.remove("muted");
    soundBtn.querySelector("svg").innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    `;

    if (isGameRunning && !isGamePaused) {
      playAudio.play().catch(() => {
        console.log("Audio play blocked");
      });
    }
  }
}

// Change game speed
function changeSpeed(newSpeed) {
  gameSpeed = parseInt(newSpeed);

  // Update active speed button
  speedBtns.forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Restart game loop with new speed if game is running
  if (isGameRunning && !isGamePaused) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
  }
}

// Change direction
function changeDirection(newDirection) {
  if (!isGameRunning) return;

  switch (newDirection) {
    case "up":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "down":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "left":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "right":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
}

// Play beep sound for eating food
function playBeep() {
  // Create a simple beep sound
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Event Listeners
startGameBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", startGame);
soundBtn.addEventListener("click", toggleSound);

// Speed control listeners
speedBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    changeSpeed(e.target.getAttribute("data-speed"));
  });
});

// Direction control listeners
upBtn.addEventListener("click", () => changeDirection("up"));
downBtn.addEventListener("click", () => changeDirection("down"));
leftBtn.addEventListener("click", () => changeDirection("left"));
rightBtn.addEventListener("click", () => changeDirection("right"));

// Keyboard controls
window.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowUp":
      e.preventDefault();
      changeDirection("up");
      break;
    case "ArrowDown":
      e.preventDefault();
      changeDirection("down");
      break;
    case "ArrowLeft":
      e.preventDefault();
      changeDirection("left");
      break;
    case "ArrowRight":
      e.preventDefault();
      changeDirection("right");
      break;
    case " ": // Spacebar for pause
      e.preventDefault();
      togglePause();
      break;
    case "r":
    case "R":
      e.preventDefault();
      if (isGameRunning) startGame(); // Restart
      break;
  }
});

// Info modal listeners
infoBtn.addEventListener("click", () => {
  modalInfo.style.display = "flex";
});

closeInfo.addEventListener("click", () => {
  modalInfo.style.display = "none";
});

// Remove game over class when starting new game
function resetGameMessage() {
  gameMessage.classList.remove("game-over", "paused");
}

// Update startGame function to reset message
const originalStartGame = startGame;
startGame = function () {
  resetGameMessage();
  originalStartGame();
};