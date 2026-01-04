const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
const squareSize = 50;
let running = false;
let fps = 5;
let frameDuration = 1000 / fps;
let lastFrameTime = 0;
const backgroundColor = "lightgrey";
const appleImage = new Image();
appleImage.src = "assets/apple.png";
const bombImage = new Image();
bombImage.src = "assets/bomb.png";
const tailOverImage = new Image();
tailOverImage.src = "assets/tail-over.png";
const tailUnderImage = new Image();
tailUnderImage.src = "assets/tail-under.png";
const tailLeftImage = new Image();
tailLeftImage.src = "assets/tail-left.png";
const tailRightImage = new Image();
tailRightImage.src = "assets/tail-right.png";
const headImage = new Image();
headImage.src = "assets/head.png";


const apple = {
    x:null,
    y:null,
    width: squareSize,
    height: squareSize,
};

const bomb = {
    x:null,
    y:null,
    width: squareSize,
    height: squareSize,
};

const player = {
    x: 400,
    y: 400,
    width: squareSize,
    height: squareSize,
    color: "blue",
    tailColor: "darkblue",
    speed: {x:1, y:0}, // Moving right initially (1 square per frame)
    next:null,
}

function draw() {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    context.fillStyle = player.tailColor;
    let current = player.next;
    let previous = player;
    while (current) {
        if (current.x === null || current.y === null) break;
        // Detect if previous is over, under, left, or right of current
        if (previous.x === current.x && previous.y > current.y) {
            // previous is below current
            context.drawImage(tailUnderImage, current.x, current.y, player.width, player.height * 1.5);
            
        } else if (previous.x === current.x && previous.y < current.y) {
            // previous is above current
            context.drawImage(tailOverImage, current.x, current.y-player.height/2, player.width, player.height * 1.5);

        } else if (previous.y === current.y && previous.x > current.x) {
            // previous is right of current
            context.drawImage(tailRightImage, current.x, current.y, player.width * 1.5, player.height);
            
        } else if (previous.y === current.y && previous.x < current.x) {
            // previous is left of current
            context.drawImage(tailLeftImage, current.x - player.width/2, current.y, player.width * 1.5, player.height);
            
        }
        previous = current;
        current = current.next;
    }
    if (apple.x !== null && apple.y !== null) {
        context.drawImage(appleImage, apple.x, apple.y, apple.width, apple.height);
    }
    if (bomb.x !== null && bomb.y !== null) {
        context.drawImage(bombImage, bomb.x, bomb.y, bomb.width, bomb.height);
    }
    context.drawImage(headImage, player.x, player.y, player.width, player.height);
}

function updateTail(elem) {
    if (elem.next) {
        updateTail(elem.next);
        elem.next.x = elem.x;
        elem.next.y = elem.y;
    }
}

function addTailSegment() {
    let newSegment = {x: null, y: null, next: null};
    if (!player.next) {
        player.next = newSegment;
    } else {
        let current = player.next;
        while (current.next) {
            current = current.next;
        }
        current.next = newSegment;
    }
}

function update() {
    if (Math.random() < 0.1 && apple.x === null && apple.y === null) {
        apple.x = Math.floor(Math.random() * (width / squareSize)) * squareSize;
        apple.y = Math.floor(Math.random() * (height / squareSize)) * squareSize;
    }
    if (apple.x !== null && apple.y !== null) {
        if (player.x === apple.x && player.y === apple.y) {
            apple.x = null;
            apple.y = null;
            addTailSegment();
        }
    }
    if (Math.random() < 0.05 && bomb.x === null && bomb.y === null) {
        bomb.x = Math.floor(Math.random() * (width / squareSize)) * squareSize;
        bomb.y = Math.floor(Math.random() * (height / squareSize)) * squareSize;
    }
    if (Math.random() < 0.02) {
        bomb.x = null;
        bomb.y = null;
    }
    updateTail(player);
    player.x += player.speed.x * squareSize;
    player.y += player.speed.y * squareSize;
    // if the tail is over 10 segments, increase speed
    let tailLength = 0;
    let current = player.next;
    while (current) {
        tailLength++;
        current = current.next;
    }
    if (tailLength > 5) {
        fps = 5 + Math.floor((tailLength) / 5);
        frameDuration = 1000 / fps;
    }
    
}

function detectWinLoss() {
    if (player.x >= width || player.y >= height || player.x < 0 || player.y < 0) {
        console.log("Player moved out of bounds. Stopping the game.");
        running = false; // Stop the game loop
        displayLostMessage("You moved out of bounds! Game Over.");
        return;
    }
    const positions = new Set();
    let current = player;
    while (current) {
        if (current.x !== null && current.y !== null) {
            const posKey = `${current.x},${current.y}`;
            if (positions.has(posKey)) {
                console.log("Player collided with itself. Stopping the game.");
                running = false; // Stop the game loop
                displayLostMessage("You collided with yourself! Game Over.");
                return;
            }
            positions.add(posKey);
            current = current.next;
        } else {
            break;
        }  
    }
    if (bomb.x !== null && bomb.y !== null) {
        if (player.x === bomb.x && player.y === bomb.y) {
            console.log("Player hit a bomb. Stopping the game.");
            running = false; // Stop the game loop
            displayLostMessage("You hit a bomb! Game Over.");
            return;
        }
    }
}

function changeDirection(newSpeed) {
    player.speed = newSpeed;
}

document.addEventListener("keydown", (event) => {
    switch(event.key) {
        case "ArrowUp":
            if (player.speed.y === 1) break; // Prevent reversing
            changeDirection({x:0, y:-1});
            break;
        case "ArrowDown":
            if (player.speed.y === -1) break; // Prevent reversing
            changeDirection({x:0, y:1});
            break;
        case "ArrowLeft":
            if (player.speed.x === 1) break; // Prevent reversing
            changeDirection({x:-1, y:0});
            break;
        case "ArrowRight":
            if (player.speed.x === -1) break; // Prevent reversing
            changeDirection({x:1, y:0});
            break;
    }
});


function displayLostMessage(message) {
    context.fillStyle = "black";
    context.font = "30px Arial";
    context.fillText(message, 100, height / 2);
}

function gameLoop() {
    if (!running) return;
    if (Date.now() - lastFrameTime >= frameDuration) {
        lastFrameTime = Date.now();
        update();
        draw();
        detectWinLoss();
    }
    requestAnimationFrame(gameLoop);
}
const button = document.getElementById("startButton");
button.addEventListener("click", () => {
    if (!running) {
        // Reset game state
        player.x = 400;
        player.y = 400;
        player.speed = {x:1, y:0};
        player.next = null;
        apple.x = null;
        apple.y = null;
        bomb.x = null;
        bomb.y = null;
        fps = 5;
        frameDuration = 1000 / fps;
        lastFrameTime = 0;
        running = true;
        gameLoop();
    }
});


// Set initial draw
draw();
