document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const startScreen = document.getElementById('start-screen');
    const endScreen = document.getElementById('end-screen');
    const themeMusic = document.getElementById('theme-music');
    const explosionSound = document.getElementById('explosion-sound');

    let score = 0;
    let gameInterval;
    let objectInterval;
    let speedMultiplier = 1;
    let playerPosition = 50; // percentage
    let isMovingLeft = false;
    let isMovingRight = false;
    let idleAnimationInterval;
    let walkAnimationInterval;
    let idleState = true;
    let walkState = true;
    let fallingObjects = [];

    const startGame = () => {
        score = 0;
        speedMultiplier = 1;
        playerPosition = 50;
        isMovingLeft = false;
        isMovingRight = false;
        fallingObjects = [];
        themeMusic.currentTime = 0;
        themeMusic.play();
        scoreDisplay.textContent = 'Score: 0';
        startScreen.style.display = 'none';
        endScreen.style.display = 'none';
        player.style.backgroundImage = 'url("players/idle.png")';
        player.style.left = playerPosition + '%';
        startCountdown();
    };

    const endGame = () => {
        clearInterval(gameInterval);
        clearInterval(objectInterval);
        clearInterval(idleAnimationInterval);
        clearInterval(walkAnimationInterval);
        themeMusic.pause();
        explosionSound.play();
        endScreen.style.display = 'block';
    };

    const startCountdown = () => {
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            if (countdown > 0) {
                scoreDisplay.textContent = `Starting in: ${countdown}`;
                countdown--;
            } else {
                clearInterval(countdownInterval);
                scoreDisplay.textContent = 'Score: 0';
                startGameLoop();
                startObjectFalling();
                setIdleAnimation();
            }
        }, 1000);
    };

    const startGameLoop = () => {
        gameInterval = setInterval(() => {
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
            speedMultiplier = 1 + score / 1000;
        }, 1000);
    };

    const startObjectFalling = () => {
        let baseSpawnRate = 1000; // Initial spawn rate in milliseconds
        let baseSpeed = 3; // Initial base speed
    
        objectInterval = setInterval(() => {
            createFallingObject();
    
            // Adjust spawn rate based on score
            const spawnRate = Math.max(200, baseSpawnRate - score); // Decrease spawn rate as score increases
            clearInterval(objectInterval);
            objectInterval = setInterval(() => {
                createFallingObject();
            }, spawnRate);
    
            // Adjust base speed based on score
            baseSpeed = 2 + score / 1000; // Increase base speed as score increases
    
        }, baseSpawnRate);
    };
    

    const createFallingObject = () => {
        const object = document.createElement('div');
        object.classList.add('falling-object');

        const baseSize = 50; // Initial size
        const sizeVariation = 30; // Maximum variation in size around baseSize
        let randomSize;

        const randomNumber = Math.random();

        if (randomNumber < 0.7) {
            randomSize = baseSize + Math.random() * sizeVariation;
        } else if (randomNumber < 0.9) {
            randomSize = baseSize + sizeVariation + Math.random() * sizeVariation * 2;
        } else {
            randomSize = baseSize + sizeVariation * 3 + Math.random() * sizeVariation * 3;
        }

        object.style.width = randomSize + 'px';
        object.style.height = randomSize + 'px';
        object.style.backgroundImage = `url('objects/object${Math.floor(Math.random() * 3) + 1}.png')`;
        object.style.left = Math.random() * 100 + '%';
        object.style.top = '-50px';

        document.getElementById('game-container').appendChild(object);
        fallingObjects.push(object);

        moveFallingObject(object);
    };

    const moveFallingObject = (object) => {
        let topPosition = -50;
        const fallInterval = setInterval(() => {
            topPosition += 1.5 * speedMultiplier;
            object.style.top = `${topPosition}px`;
    
            if (topPosition > window.innerHeight) {
                clearInterval(fallInterval);
                object.remove();
                fallingObjects = fallingObjects.filter(obj => obj !== object);
            }
    
            detectCollision(object, fallInterval);
    
            // Add expanding effect
            const expandChance = Math.random();
            if (expandChance <= 0.3 && topPosition > window.innerHeight - 100) {
                let expandCount = 0;
                const expandInterval = setInterval(() => {
                    if (expandCount < 3) {
                        object.style.width = `${parseFloat(object.style.width) * 1.02}px`;
                        object.style.height = `${parseFloat(object.style.height) * 1.02}px`;
                        expandCount++;
                    } else {
                        clearInterval(expandInterval);
                    }
                }, 30); // decrease stretching speed
            }
        }, 20);
    };

    const movePlayer = () => {
        const playerSpeed = 0.5;

        if (isMovingLeft) {
            playerPosition = Math.max(0, playerPosition - playerSpeed);
            player.style.left = playerPosition + '%';
        }
        if (isMovingRight) {
            playerPosition = Math.min(100, playerPosition + playerSpeed);
            player.style.left = playerPosition + '%';
        }
    };

    const detectCollision = (object, fallInterval) => {
        const playerRect = player.getBoundingClientRect();
        const objectRect = object.getBoundingClientRect();
        if (
            playerRect.left < objectRect.left + objectRect.width &&
            playerRect.left + playerRect.width > objectRect.left &&
            playerRect.top < objectRect.top + objectRect.height &&
            playerRect.top + playerRect.height > objectRect.top
        ) {
            clearInterval(fallInterval);
            object.remove();
            endGame();
        }
    };

    const setIdleAnimation = () => {
        clearInterval(idleAnimationInterval);
        clearInterval(walkAnimationInterval);
        idleAnimationInterval = setInterval(() => {
            player.style.backgroundImage = `url('players/idle${idleState ? '' : '2'}.png')`;
            idleState = !idleState;
        }, 300);
    };

    const setWalkAnimation = (direction) => {
        clearInterval(idleAnimationInterval);
        clearInterval(walkAnimationInterval);
        walkAnimationInterval = setInterval(() => {
            player.style.backgroundImage = `url('players/walk${direction}${walkState ? '1' : '2'}.png')`;
            walkState = !walkState;
        }, 200);
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'a' || e.key === 'ArrowLeft') {
            if (!isMovingLeft) {
                isMovingLeft = true;
                setWalkAnimation('left');
            }
        } else if (e.key === 'd' || e.key === 'ArrowRight') {
            if (!isMovingRight) {
                isMovingRight = true;
                setWalkAnimation('right');
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'a' || e.key === 'ArrowLeft') {
            isMovingLeft = false;
            if (!isMovingRight) setIdleAnimation();
        } else if (e.key === 'd' || e.key === 'ArrowRight') {
            isMovingRight = false;
            if (!isMovingLeft) setIdleAnimation();
        }
    });

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    setInterval(movePlayer, 1000 / 60);
});

