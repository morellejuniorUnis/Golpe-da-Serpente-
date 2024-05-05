const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");
const buttonNormal = document.querySelector('.btn-normal');
const buttonDifficult = document.querySelector('.btn-difficult');
const gameOverScreen = document.querySelector(".menu-screen.game-over-container");
const playAgainButton = gameOverScreen.querySelector(".btn-play");
const projectileDisplay = document.querySelector('.projectile-count');

const audio = new Audio("../assets/audio.mp3");
const losingAudio = new Audio("../assets/losing.wav");
const specialEatAudio = new Audio("../assets/specialEat.wav");
const spellMagicAudio = new Audio("../assets/spellMagic.wav");
const enemyHitAudio = new Audio("../assets/enemyHit.wav");
specialEatAudio.volume = 0.1; 


const bananaImage = new Image();
bananaImage.src = "../assets/eat/banana.png";
const appleImage = new Image();
appleImage.src = "../assets/eat/apple.png";
const grapeImage = new Image();
grapeImage.src = "../assets/eat/grape.png";
const pepperImage = new Image();
pepperImage.src = "../assets/eat/pepper.png";
const enemyImage = new Image();
enemyImage.src = "../assets/enemy/enemy.png";
const enemyBeeImage = new Image();
enemyBeeImage.src = "../assets/enemy/bee.png";
const bossImage = new Image();
bossImage.src = "../assets/boss/eagle.png";
const bossSpellImage = new Image();
bossSpellImage.src = "../assets/boss/bossSpell.png";
const snakeHeadImage = new Image();
snakeHeadImage.src = "../assets/player/player.png";
const snakeBodyImage = new Image();
snakeBodyImage.src = "../assets/player/bodyPlayer.png";
const snakePowerImage = new Image();
snakePowerImage.src = "../assets/player/powerPlayer.png";

const size = 30;
const initialPosition = getCenterPosition();
let gameSpeed = 300;
let isSpeedBoostActive = false;
let blinkState = true;
let hasLost = false;
let snake = [initialPosition];
let snakeGold = false;
let isPepperPowerActive = false;
let headX = initialPosition.x;
let headY = initialPosition.y;
let direction, loopId

let pepper = {
    x: 0,
    y: 0,
    active: false
};


const drawSnakeHead = () => {
    ctx.save(); 
    ctx.translate(headX + size / 2, headY + size / 2); 

    if (direction === "right") {
        ctx.rotate(0); 
    } else if (direction === "left") {
        ctx.rotate(Math.PI); 
        ctx.scale(1, -1);
    } else if (direction === "up") {
        ctx.rotate(-Math.PI / 2); 
    } else if (direction === "down") {
        ctx.rotate(Math.PI / 2);
    }

    ctx.drawImage(snakeHeadImage, -size / 2, -size / 2, size, size);

    ctx.restore();
}


buttonNormal.addEventListener('click', () => {
    gameSpeed = 300; 
    startGame();    
});

buttonDifficult.addEventListener('click', () => {
    gameSpeed = 150; 
    startGame();
});

function updateProjectileDisplay() {
    projectileDisplay.innerText = grapeFood.charges.toString();
}

const purpleProjectile = {
    x: 0,
    y: 0,
    active: false,
    width: size,
    height: size,
    direction: null,  
    speed: 50
};

function moveProjectile() {
    if (purpleProjectile.active) {
        switch (purpleProjectile.direction) {
            case "right":
            case "left":
                purpleProjectile.x += purpleProjectile.speed;
                break;
            case "up":
            case "down":
                purpleProjectile.y += purpleProjectile.speed;
                break;
        }

        if (purpleProjectile.x > canvas.width || purpleProjectile.x < 0 || purpleProjectile.y > canvas.height || purpleProjectile.y < 0) {
            purpleProjectile.active = false;
        }
    }
}

function drawProjectile() {
    if (purpleProjectile.active) {

        ctx.drawImage(snakePowerImage, purpleProjectile.x, purpleProjectile.y, purpleProjectile.width, purpleProjectile.height);
    }
}

function getCenterPosition() {
    const x = Math.floor((canvas.width / 2) / size) * size;
    const y = Math.floor((canvas.height / 2) / size) * size;
    return { x, y };
}

function startGame() {
    hasLost = false; 
    score.innerText = "00";
    menu.style.display = "none";
    canvas.style.filter = "none";
    

    const centerPosition = getCenterPosition();
    snake = [centerPosition];  
    headX = centerPosition.x;
    headY = centerPosition.y;
    direction = undefined;
    grapeFood.charges = 0; 
    updateProjectileDisplay();

    goldenFood.active = false;
    boss.active = false
    goldenFood.x = randomPosition();
    goldenFood.y = randomPosition();

    if (loopId) {
        clearTimeout(loopId);
    }
    loopId = setTimeout(gameLoop, gameSpeed); 
}

const incrementScore = () => {
    score.innerText = +score.innerText + 10;
    if (+score.innerText >= 50 && !goldenFood.active) {
        goldenFood.active = true;
        specialEatAudio.play();  
        activateLineEnemy(); 
    }

    if (+score.innerText >= 100 && !grapeFood.active) {
        grapeFood.active = true;
        specialEatAudio.play();  
        grapeFood.x = randomPosition();
        grapeFood.y = randomPosition();
    }

    buttonPlay.addEventListener('click', () => {
        startGame();
    });

    if (+score.innerText >= 180 && !boss.active) {
        boss.active = true;
        activatePepperPower(); 
    }

};

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / 30) * 30
}

const randomColor = () => {
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

const drawFood = () => {

    const { x, y } = food; 

    ctx.drawImage(appleImage, x, y, size, size);
}

const lineEnemy = {
    x: 0,
    y: 0,
    active: false,
    length: canvas.width,
    direction: 'horizontal',  
    velocity: size, 
    pathColor: 'lightcoral'
};;

function activateLineEnemy() {
    lineEnemy.active = true;
    lineEnemy.direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    if (lineEnemy.direction === 'horizontal') {
        lineEnemy.x = 0;
        lineEnemy.y = randomPosition();
    } else {
        lineEnemy.x = randomPosition(); 
        lineEnemy.y = 0;
    }
}

function deactivateLineEnemy() {
    lineEnemy.active = false;

    if (lineEnemy.direction === 'horizontal') {
        grapeFood.x = canvas.width - size; 
        grapeFood.y = lineEnemy.y;
    } else {
        grapeFood.x = lineEnemy.x;
        grapeFood.y = canvas.height - size; 
    }
    grapeFood.active = true;
}


function drawLineEnemy() {

    if (!lineEnemy.active || boss.active) return;  
    
    if (lineEnemy.direction === 'horizontal') {
        if (lineEnemy.x <= canvas.width) { 
            lineEnemy.x += lineEnemy.velocity;
            ctx.drawImage(enemyBeeImage, lineEnemy.x, lineEnemy.y, size, size);  
        } else {
            lineEnemy.active = false; 
        }
    } else {
        if (lineEnemy.y <= canvas.height) { 
            lineEnemy.y += lineEnemy.velocity;
            ctx.drawImage(enemyBeeImage, lineEnemy.x, lineEnemy.y, size, size);  
        } else {
            lineEnemy.active = false; 
            
        }
    }
}


const drawSnake = () => {
    ctx.fillStyle = snakeGold ? "gold" : "#ddd";


    drawSnakeHead();


    snake.forEach((position, index) => {

        if (index === snake.length - 1) return;


        ctx.drawImage(snakeBodyImage, position.x, position.y, size, size);

    });
}

const moveSnake = () => {
    if (!direction) return;

    if (direction == "right") {
        headX += size;
    } else if (direction == "left") {
        headX -= size;
    } else if (direction == "down") {
        headY += size;
    } else if (direction == "up") {
        headY -= size;
    }


    snake.push({ x: headX, y: headY });


    snake.shift();
}

const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = "#191919"

    for (let i = 30; i < canvas.width; i += 30) {
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }
}

const goldenFood = {
    x: randomPosition(),
    y: randomPosition(),
    active: false,
    blinkState: true 
};

const grapeFood = {
    x: 0,
    y: 0,
    active: false,
    blinkState: true,
    charges: 0
};

const drawGoldenFood = () => {
    if (!goldenFood.active) return;
    ctx.drawImage(bananaImage, goldenFood.x, goldenFood.y, size, size);
};

const drawGrapeFood = () => {
    if (!grapeFood.active) return;
    ctx.drawImage(grapeImage, grapeFood.x, grapeFood.y, size, size);
};

const checkEat = () => {
    const head = snake[snake.length - 1];

    if (head.x === food.x && head.y === food.y) {
        incrementScore();
        snake.push({ x: head.x, y: head.y });
        audio.play();
        resetFoodPosition();
    }

    if (goldenFood.active && head.x === goldenFood.x && head.y === goldenFood.y) {
        score.innerText = +score.innerText + 30;
        extendSnake(3);
        goldenFood.active = false;
        snakeGold = true;
        setTimeout(() => { snakeGold = false; }, 1200);
        specialEatAudio.play();
    }

    if (grapeFood.active && head.x === grapeFood.x && head.y === grapeFood.y) {
        grapeFood.charges += 3;
        grapeFood.active = false;
        updateProjectileDisplay();
        specialEatAudio.play();
    }

    if (pepper.active && head.x === pepper.x && head.y === pepper.y) {
        increaseSpeed();
        pepper.active = false;
    }
};

function extendSnake(extraLength) {
    for (let i = 0; i < extraLength; i++) {
        snake.unshift({ x: snake[0].x, y: snake[0].y });
    }
}

function increaseSpeed() {
    gameSpeed /= 2;  
    isSpeedBoostActive = true;  
    setTimeout(resetSpeed, 10000);  
}

function resetSpeed() {
    gameSpeed *= 2; 
    isSpeedBoostActive = false; 
}

function resetFoodPosition() {
    do {
        food.x = randomPosition();
        food.y = randomPosition();
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
    food.color = randomColor();
}


const blocker = {
    x: randomPosition(),
    y: randomPosition(),
    moveInterval: 5,
    moveCounter: 0,
    active: true,  

    move: function() {
        this.moveCounter++;
        if (this.moveCounter >= this.moveInterval) {
            const direction = randomNumber(1, 4);
            switch (direction) {
                case 1:
                    if (this.y - size >= 0) this.y -= size;
                    break;
                case 2:
                    if (this.y + size < canvas.height) this.y += size;
                    break;
                case 3:
                    if (this.x - size >= 0) this.x -= size;
                    break;
                case 4:
                    if (this.x + size < canvas.width) this.x += size;
                    break;
            }
            this.moveCounter = 0;
        }
    },

};

blocker.draw = function() {
    if (!this.active || boss.active) {  
        return;
    }
    ctx.drawImage(enemyImage, this.x, this.y, size, size);
};

function activatePepperPower() {
    isPepperPowerActive = true;

    pepper.x = headX;
    pepper.y = headY;
    pepper.active = true;

    setTimeout(() => {
        isPepperPowerActive = false;
        pepper.active = false;  
    }, 3000);
}

function deactivatePepperPower() {
    isPepperPowerActive = false;
}

const checkCollision = () => {
    const head = snake[snake.length - 1];
    const canvasLimit = canvas.width - size;
    const neckIndex = snake.length - 2;

    const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit;

    const selfCollision = isSpeedBoostActive ? false : snake.find((position, index) => {
        return index < neckIndex && position.x === head.x && position.y === head.y;
    });

    if (wallCollision || selfCollision) {
        gameOver();
    }

    if (!isSpeedBoostActive && lineEnemy.active) {
        if ((lineEnemy.direction === 'horizontal' && head.y === lineEnemy.y && head.x === lineEnemy.x) ||
            (lineEnemy.direction === 'vertical' && head.x === lineEnemy.x && head.y === lineEnemy.y)) {
            gameOver();
        }
    }

    if (!isSpeedBoostActive && boss.active) {
        if ((boss.x < head.x + size && boss.x + boss.width > head.x &&
            boss.y < head.y + size && boss.y + boss.height > head.y)) {
            gameOver();
        }
    }

    if (bossSpell.active && head.x < bossSpell.x + bossSpell.width && head.x + size > bossSpell.x &&
        head.y < bossSpell.y + bossSpell.height && head.y + size > bossSpell.y) {
        gameOver(); 
    }

    

}

const gameOver = () => {
    if (!hasLost) {
        losingAudio.play();
        hasLost = true;
    }

    direction = undefined;
    gameOverScreen.style.display = "flex"; 
    finalScore.innerText = score.innerText; 
    snake = [getCenterPosition()];
    canvas.style.filter = "blur(2px)";
};

function checkProjectileCollisions() {
    if (purpleProjectile.active && lineEnemy.active && purpleProjectile.x < lineEnemy.x + size &&
        purpleProjectile.x + purpleProjectile.width > lineEnemy.x &&
        purpleProjectile.y < lineEnemy.y + size &&
        purpleProjectile.height + purpleProjectile.y > lineEnemy.y) {

        purpleProjectile.active = false;  
        lineEnemy.active = false; 
        enemyHitAudio.play(); 

        pepper.x = lineEnemy.x;  
        pepper.y = lineEnemy.y;
        pepper.active = true;
    }
}

function checkProjectileBlockerCollision() {
    if (purpleProjectile.active && blocker.active) {
        if (purpleProjectile.x < blocker.x + size &&
            purpleProjectile.x + purpleProjectile.width > blocker.x &&
            purpleProjectile.y < blocker.y + size &&
            purpleProjectile.y + purpleProjectile.height > blocker.y) {
            purpleProjectile.active = false;
            blocker.active = false; 
            enemyHitAudio.play();
        }
    }
}

const boss = {
    x: canvas.width / 2 - size * 2,
    y: 50, 
    width: size * 4, 
    height: size * 4,
    health: 10, 
    active: false
};

const bossSpell = {
    x: boss.x + boss.width / 2, 
    y: boss.y + boss.height, 
    width: size,
    height: size * 2, 
    active: false,
    speed: 10 
};

function drawBoss() {
    if (boss.active) {
        ctx.drawImage(bossImage, boss.x, boss.y, boss.width, boss.height);
    }
}

function checkProjectileBossCollision() {
    if (purpleProjectile.active && boss.active) {
        if (purpleProjectile.x < boss.x + boss.width &&
            purpleProjectile.x + purpleProjectile.width > boss.x &&
            purpleProjectile.y < boss.y + boss.height &&
            purpleProjectile.y + purpleProjectile.height > boss.y) {
            purpleProjectile.active = false;
            boss.health -= 1; 
            if (boss.health <= 0) {
                boss.active = false; 
                incrementScoreBy(50); 
            }
        }
    }
}

function incrementScoreBy(value) {
    score.innerText = +score.innerText + value;
}

function moveBoss() {
    if (boss.active) {

        boss.x += Math.sin(Date.now() * 0.002) * 2;
    }
}

function checkBossActivation() {
    if (+score.innerText >= 130 && !boss.active) {
        boss.active = true;
        specialEatAudio.play(); 
        pepper.x = headX;
        pepper.y = headY;
        pepper.active = true;
    }
}

function drawBossHealth() {
    if (boss.active) {
        const healthWidth = 200; 
        const healthHeight = 20;
        const currentHealth = (boss.health / 10) * healthWidth; 

  
        ctx.fillStyle = 'gray';
        ctx.fillRect(boss.x, boss.y - 30, healthWidth, healthHeight);


        ctx.fillStyle = 'red';
        ctx.fillRect(boss.x, boss.y - 30, currentHealth, healthHeight);


        ctx.strokeStyle = 'black';
        ctx.strokeRect(boss.x, boss.y - 30, healthWidth, healthHeight);
    }
}

function drawBossSpell() {
    if (bossSpell.active) {
        ctx.drawImage(bossSpellImage, bossSpell.x, bossSpell.y, bossSpell.width, bossSpell.height);
    }
}

function moveBossSpell() {
    if (bossSpell.active) {
        bossSpell.y += bossSpell.speed;
        if (bossSpell.y > canvas.height) {
            bossSpell.active = false;
            grapeFood.x = Math.floor(bossSpell.x / size) * size; 
            grapeFood.y = canvas.height - size;
            grapeFood.active = true;
            updateProjectileDisplay(); 
        }
    }
}

function activateBossSpell() {
    if (boss.active && !bossSpell.active) {
        let startPosition = Math.floor(Math.random() * (boss.width / size)) * size;
        bossSpell.x = boss.x + startPosition; 
        bossSpell.y = boss.y + boss.height;
        bossSpell.active = true;
    }
}

const gameLoop = () => {
    clearInterval(loopId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    if (lineEnemy.active) {
        drawLinePath(); 
    }


    drawFood();
    drawGoldenFood();
    drawGrapeFood();
    drawPepper();

    drawBoss();
    drawBossHealth();
    drawBossSpell();
    moveBossSpell();
    activateBossSpell(); 

    drawLineEnemy();

    moveSnake();
    drawSnake();
    blocker.move();
    blocker.draw();

    drawProjectile(); 
    moveProjectile(); 

    checkEat();
    checkCollision();
    checkProjectileCollisions();
    checkProjectileBlockerCollision();  
    checkProjectileBossCollision(); 
    moveBoss(); 


    if (!lineEnemy.active && goldenFood.active) {
        activateLineEnemy();
    }

    if (!lineEnemy.active && grapeFood.active) {
        activateLineEnemy();
    }

    blinkState = !blinkState; 

    loopId = setTimeout(gameLoop, gameSpeed);
};

function drawPepper() {
    if (pepper.active) {
        ctx.drawImage(pepperImage, pepper.x, pepper.y, size, size);
    }
}

function drawLinePath() {
    if (!lineEnemy.active || boss.active) return;

    ctx.fillStyle = 'lightcoral';
    if (lineEnemy.direction === 'horizontal') {
        ctx.fillRect(0, lineEnemy.y, canvas.width, size);
    } else {
        ctx.fillRect(lineEnemy.x, 0, size, canvas.height);
    }
}

document.addEventListener("keydown", ({ key }) => {
    if (key == "ArrowRight" && direction != "left") {
        direction = "right"
    }

    if (key == "ArrowLeft" && direction != "right") {
        direction = "left"
    }

    if (key == "ArrowDown" && direction != "up") {
        direction = "down"
    }

    if (key == "ArrowUp" && direction != "down") {
        direction = "up"
    }
  
})

document.addEventListener("keydown", ({ code }) => {
    if (code === "Space" && grapeFood.charges > 0 && !purpleProjectile.active) {
        purpleProjectile.active = true;
        purpleProjectile.direction = direction;  

        switch (direction) {
            case "right":
                purpleProjectile.x = headX + size;
                purpleProjectile.y = headY + size / 2 - purpleProjectile.height / 2;
                purpleProjectile.speed = Math.abs(purpleProjectile.speed);
                break;
            case "left":
                purpleProjectile.x = headX - purpleProjectile.width;
                purpleProjectile.y = headY + size / 2 - purpleProjectile.height / 2;
                purpleProjectile.speed = -Math.abs(purpleProjectile.speed);
                break;
            case "up":
                purpleProjectile.x = headX + size / 2 - purpleProjectile.width / 2;
                purpleProjectile.y = headY - purpleProjectile.height;
                purpleProjectile.speed = -Math.abs(purpleProjectile.speed);
                break;
            case "down":
                purpleProjectile.x = headX + size / 2 - purpleProjectile.width / 2;
                purpleProjectile.y = headY + size;
                purpleProjectile.speed = Math.abs(purpleProjectile.speed);
                break;
        }
        grapeFood.charges--;
        updateProjectileDisplay();
        spellMagicAudio.play();
    }
});

buttonPlay.addEventListener("click", () => {
    score.innerText = "00";
    menu.style.display = "none";
    canvas.style.filter = "none";

    snake = [initialPosition];

    goldenFood.active = false; 
    grapeFood.active = false; 
    goldenFood.x = randomPosition(); 
    goldenFood.y = randomPosition();
    grapeFood.x = randomPosition(); 
    grapeFood.y = randomPosition();
});

document.addEventListener('DOMContentLoaded', () => {

    const playAgainButton = document.querySelector(".game-over-container .btn-play");
    playAgainButton.addEventListener('click', () => {
        gameOverScreen.style.display = "none";
        startGame(); 
    });

    const buttonNormal = document.querySelector('.btn-normal');
    const buttonDifficult = document.querySelector('.btn-difficult');

    buttonNormal.addEventListener('click', () => {
        gameSpeed = 300; 
        startGame();    
    });

    buttonDifficult.addEventListener('click', () => {
        gameSpeed = 150; 
        startGame();
    });


});

gameLoop()