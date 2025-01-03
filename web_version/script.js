const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// Game Variables
let level = 1;
let gameRunning = false;
let animationFrameId = null;
let startTime = null; // Track the game start time

// Speed Variables
let blockSpeed = 2;
let enemySpeed = 2;
const BASE_BLOCK_SPEED = 2;
const BASE_ENEMY_SPEED = 2;
const SPEED_INCREMENT = 0.5;

// Mario Variables
const mario = { x: 50, y: 300, width: 20, height: 20, color: 'red' };

// Enemy Variables
const enemy = { x: 750, y: 300, width: 20, height: 20, color: 'black' };

// Blocks Variables
const blocks = [];

// Controls
const keys = {};

// Leaderboard and User Input
const usernameInput = document.getElementById('username');
const startGameButton = document.getElementById('startGameButton');
const leaderboardTableBody = document.querySelector("#leaderboardTable tbody");
const userInputContainer = document.querySelector(".user-input");
let username = '';
const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// DOM Elements
let usernameDisplay = null;

// Disable Game Key Listeners When Typing in Username Input
function disableKeyListeners() {
    window.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("keyup", handleKeyup);
}

// Enable Game Key Listeners
function enableKeyListeners() {
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keyup", handleKeyup);
}

// Initialize Game
function init(reset = false) {
    console.log("Initializing game...");

    if (!username) {
        alert("Please enter a username!");
        return;
    }

    if (reset) {
        level = 1; // Reset levels to the beginning
        blockSpeed = BASE_BLOCK_SPEED; // Reset block speed
        enemySpeed = BASE_ENEMY_SPEED; // Reset enemy speed
        startTime = Date.now(); // Reset the start time
    } else {
        blockSpeed = BASE_BLOCK_SPEED + SPEED_INCREMENT * (level - 1);
        enemySpeed = BASE_ENEMY_SPEED + SPEED_INCREMENT * (level - 1);
    }

    // Display Username
    if (!usernameDisplay) {
        usernameDisplay = document.createElement('div');
        usernameDisplay.className = 'username-display';
        usernameDisplay.textContent = `Player: ${username}`;
        usernameDisplay.style.position = 'absolute';
        usernameDisplay.style.top = '10px';
        usernameDisplay.style.left = '10px';
        usernameDisplay.style.fontSize = '20px';
        usernameDisplay.style.fontWeight = 'bold';
        document.body.appendChild(usernameDisplay);
    }

    // Cancel Previous Animation Frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Reset Game State
    mario.x = 50;
    mario.y = 300;
    enemy.x = 750;
    enemy.y = 300;

    console.log(`Game reset: level=${level}, blockSpeed=${blockSpeed}, enemySpeed=${enemySpeed}`);

    // Reset Blocks
    blocks.length = 0;
    generateBlocks();

    // Clear key state
    Object.keys(keys).forEach((key) => (keys[key] = false));

    // Start Game
    gameRunning = true;
    startTime = startTime || Date.now(); // Record the start time if not already set
    animate();
}

// Generate Blocks
function generateBlocks() {
    for (let i = 0; i < 5; i++) {
        blocks.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height - 50),
            width: 50,
            height: 20,
            color: 'blue',
        });
    }
}

// Draw Rectangle
function drawRect({ x, y, width, height, color }) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Handle Mario Movement
function moveMario() {
    if (keys.ArrowUp && mario.y > 0) mario.y -= 5;
    if (keys.ArrowDown && mario.y < canvas.height - mario.height) mario.y += 5;
    if (keys.ArrowLeft && mario.x > 0) mario.x -= 5;
    if (keys.ArrowRight && mario.x < canvas.width - mario.width) mario.x += 5;

    drawRect(mario); // Draw Mario
}

// Move Enemy
function moveEnemy() {
    if (enemy.x > mario.x) enemy.x -= enemySpeed;
    if (enemy.y > mario.y) enemy.y -= enemySpeed;
    if (enemy.x < mario.x) enemy.x += enemySpeed;
    if (enemy.y < mario.y) enemy.y += enemySpeed;

    drawRect(enemy); // Draw Enemy
}

// Move Blocks
function moveBlocks() {
    blocks.forEach((block) => {
        block.x -= blockSpeed;
        if (block.x + block.width < 0) {
            block.x = canvas.width;
            block.y = Math.random() * (canvas.height - block.height);
        }
        drawRect(block); // Draw Block
    });
}

// Check Collisions
function checkCollisions() {
    if (
        mario.x < enemy.x + enemy.width &&
        mario.x + mario.width > enemy.x &&
        mario.y < enemy.y + enemy.height &&
        mario.y + mario.height > enemy.y
    ) {
        console.log("Collision detected: Mario and Enemy.");
        gameOver();
    }

    blocks.forEach((block) => {
        if (
            mario.x < block.x + block.width &&
            mario.x + mario.width > block.x &&
            mario.y < block.y + block.height &&
            mario.y + mario.height > block.y
        ) {
            console.log("Collision detected: Mario and Block.");
            gameOver();
        }
    });

    if (mario.x + mario.width >= canvas.width) {
        console.log("Mario reached the end of the screen. Level up.");
        levelUp();
    }
}

// Level Up
function levelUp() {
    level++;
    blockSpeed = BASE_BLOCK_SPEED + SPEED_INCREMENT * (level - 1);
    enemySpeed = BASE_ENEMY_SPEED + SPEED_INCREMENT * (level - 1);

    console.log(`Level up: level=${level}, blockSpeed=${blockSpeed}, enemySpeed=${enemySpeed}`);

    mario.x = 50;
    mario.y = 300;
    generateBlocks();
}

// Game Over
function gameOver() {
    gameRunning = false;

    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Calculate elapsed time in seconds

    leaderboard.push({ username, level, duration: elapsedTime });
    leaderboard.sort((a, b) => b.level - a.level || a.duration - b.duration);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    alert(`Game Over! Level: ${level}. Time: ${elapsedTime} seconds.`);
    updateLeaderboard();

    const restart = confirm("Game Over! Play again?");
    if (restart) {
        init(true); // Reset the game to level 1
    } else {
        window.location.reload(); // Reload page
    }
}

// Animate Game
function animate() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveMario();
    moveEnemy();
    moveBlocks();
    checkCollisions();

    animationFrameId = requestAnimationFrame(animate);
}

// Update Leaderboard Table
function updateLeaderboard() {
    leaderboardTableBody.innerHTML = ""; // Clear existing rows
    leaderboard.slice(0, 5).forEach((player, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.username}</td>
            <td>${player.level}</td>
            <td>${player.duration} s</td>
        `;
        leaderboardTableBody.appendChild(row);
    });
}

// Add Event Listeners
function handleKeydown(e) {
    keys[e.key] = true;
    e.preventDefault();
}

function handleKeyup(e) {
    keys[e.key] = false;
}

startGameButton.addEventListener("click", () => {
    const enteredUsername = usernameInput.value.trim();
    if (!enteredUsername) {
        alert("Please enter a username!");
        return;
    }
    username = enteredUsername;
    userInputContainer.style.display = "none"; // Hide input field
    enableKeyListeners(); // Enable game listeners
    init();
});

// Initial Setup
updateLeaderboard();
disableKeyListeners(); // Disable key listeners initially
usernameInput.focus(); // Focus input field for initial typing