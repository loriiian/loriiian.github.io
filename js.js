const canvas = document.getElementById('Canvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const startGameBtn = document.getElementById('startGameBtn');
const instructionsBtn = document.getElementById('instructionsBtn');
const creditsBtn = document.getElementById('creditsBtn');
const optionsBtn = document.getElementById('optionsBtn');
const optionsMenu = document.getElementById('optionsMenu');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const volumeSlider = document.getElementById('volumeSlider');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const pauseButton = document.getElementById('pauseButton');
const backgroundImages = ['assets/backgrounds/castle/castle.png', 'assets/backgrounds/background1.png', 'assets/backgrounds/background2.png'];
let currentBackgroundImage = new Image();
currentBackgroundImage.src = backgroundImages[0];

//configs gerais
const gameWidth = canvas.width;
const gameHeight = canvas.height;
let isPaused = false;
let playerDead = false;
let score = 0;
let enemySpeed = 300;
let spawnRate = 0.0065;
let lastSpawnTime = 0; // cooldown inimigo
let spawnCooldown = 2000;
let lastProjectileTime = 0; // cooldown tiro
let projectileCooldown = 500;
let currentLevel = 1;
let pointsToNextLevel = 10;
let lastFrameTime = performance.now();

//carregar os elementos visuais e sonoros

const playerIdleImage = new Image();
playerIdleImage.src = 'assets/images/king/idle/frame1.png';

const playerJumpImage = new Image();
playerJumpImage.src = 'assets/images/king/jump/swordjump/frame1.png';

let slimeJumpVelocity = -370;
let slimeGravity = 620;

const skeletonSpritesheet = new Image();
skeletonSpritesheet.src = 'assets/images/enemies/skeleton_spritesheet.png';

const slimeSpritesheet = new Image();
slimeSpritesheet.src = 'assets/images/enemies/slime_spritesheet.png';

const batSpritesheet = new Image();
batSpritesheet.src = 'assets/images/enemies/bat_spritesheet.png';

const ratSpritesheet = new Image();
ratSpritesheet.src = 'assets/images/enemies/rat_spritesheet.png';

const playerAttackImage = new Image();
playerAttackImage.src = 'assets/images/elprimo.png';

const projectileImage = new Image();
projectileImage.src = 'assets/images/attack/ball2.png';

const jumpSound = new Audio('assets/sounds/jumpSound.mp3');
const attackSound = new Audio('assets/sounds/attackSound.mp3');
const enemyHitSound = new Audio('assets/sounds/enemyHit.mp3');
const backgroundOST = new Audio('assets/sounds/bossfight.mp3');
backgroundOST.loop = true;


//funcoes do menu inicial
//
//
function showInstructions() {
    alert("Instruções: Seta para cima para pular, seta para baixo para atacar, e seta para direita para atirar!");
}

function showCredits() {
    alert("Jogo feito por: andré zitos");
}

volumeSlider.addEventListener('input', function() {
    const volume = volumeSlider.value;
    backgroundOST.volume = volume; // Controle do volume da música de fundo
    attackSound.volume = volume; // Controle do volume do som de ataque
    jumpSound.volume = volume;   // Controle do volume do som de pulo
    enemyHitSound.volume = volume; // Controle do volume do som de hit
});

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

optionsBtn.addEventListener('click', function() {
    menu.style.display = 'none'; // Esconder menu principal
    optionsMenu.style.display = 'flex'; // Mostrar menu de opções
});

backToMenuBtn.addEventListener('click', function() {
    optionsMenu.style.display = 'none'; // Esconder menu de opções
    menu.style.display = 'flex'; // Mostrar menu principal
});

fullscreenBtn.addEventListener('click', toggleFullscreen);
startGameBtn.addEventListener('click', startGame);
instructionsBtn.addEventListener('click', showInstructions);
creditsBtn.addEventListener('click', showCredits);

//stats
const player = {
    x: 305,
    y: gameHeight - 85,
    width: 200,
    height: 200,
    speed: 4.5,
    isJumping: false,
    jumpHeight: 150,
    jumpSpeed: -8,
    gravity: 1150,
    velocityY: 0,
    health: 3,
    isAttacking: false,
    attackHitbox: {
        x: 0,
        y: 0,
        width: 75,
        height: 105
    },
    currentImage: playerIdleImage,
    attackCooldown: 350,
    lastAttack: 0,
    attackDuration: 200,
    attackStartTime: 0,

    treasure: {  // tesouro pirataaaaa proteger
        x: 0,
        y: 0,
        width: 200,
        height: 1050
    },
};

const keys = {
    ArrowUp: false,
    ArrowDown: false,
};

//stats dos inimigos
const slimes = [];
const bats = [];
const skeletons = [];
const rats = [];


function spawnEnemy() {
    let enemyType = Math.random() > 0.5 ? 'ground' : 'air';

    if (currentLevel === 2) {
        enemyType = 'ground';
    }

    if (enemyType === 'ground') {
        if (currentLevel === 2) {
            if (Math.random() < 0.5) { // Chance de spawn do slime
                const slime = {
                    x: gameWidth,
                    y: gameHeight - 100,
                    width: 115,
                    height: 100,
                    isDefeated: false,
                    isSlime: true,
                    jumping: false,
                    jumpHeight: 100,
                    groundY: gameHeight - 100,
                    health: 60,
                    maxHealth: 60,
                    frameIndex: 0,
                    frameCount: 4,
                    frameDelay: 100,
                    lastFrameTime: 0,
                };
                slimes.push(slime);
            } else if (Math.random() < 0.5) { // Chance de spawn do rato
                const rat = {
                    x: gameWidth,
                    y: gameHeight - 80,
                    width: 80,
                    height: 80,
                    isDefeated: false,
                    isRato: true,
                    health: 30,
                    maxHealth: 30,
                    frameIndex: 0,
                    frameCount: 6, // spritesheet frames
                    frameDelay: 100,
                    lastFrameTime: 0,
                    hitbox: {
                        x: 0,
                        y: 55,
                        width: 80,
                        height: 55,
                    }
                };
                rats.push(rat);
            }
        } else { // Para fases diferentes da 2
            const skeleton = {
                x: gameWidth,
                y: gameHeight - 125,
                width: 125,
                height: 125,
                tipo: 'ground',
                isDefeated: false,
                isSkeleton: true,
                health: 75,
                maxHealth: 75,
                frameIndex: 0,
                frameCount: 6,
                frameDelay: 100,
                lastFrameTime: 0,
            };
            skeletons.push(skeleton);
        }
    } else {
        if (currentLevel !== 2) {
            const bat = {
                x: gameWidth,
                y: gameHeight - 300,
                width: 100,
                height: 100,
                tipo: 'air',
                isDefeated: false,
                isBat: true,
                health: 50,
                maxHealth: 50,
                frameIndex: 0,
                frameCount: 6,
                frameDelay: 150,
                lastFrameTime: 0,
            };
            bats.push(bat);
        }
    }
}



function drawEnemies() {
    const enemies = [...slimes, ...bats, ...skeletons, ...rats];

    enemies.forEach(enemy => {
        let spriteWidth;

        if (enemy.isSkeleton) {
            spriteWidth = skeletonSpritesheet.width / enemy.frameCount;
            ctx.drawImage(skeletonSpritesheet, enemy.frameIndex * spriteWidth, 0, spriteWidth, skeletonSpritesheet.height, enemy.x, enemy.y, enemy.width, enemy.height);
        } else if (enemy.isBat) {
            spriteWidth = batSpritesheet.width / enemy.frameCount;
            ctx.drawImage(batSpritesheet, enemy.frameIndex * spriteWidth, 0, spriteWidth, batSpritesheet.height, enemy.x, enemy.y, enemy.width, enemy.height);
        } else if (enemy.isSlime) {
            spriteWidth = slimeSpritesheet.width / enemy.frameCount;
            ctx.drawImage(slimeSpritesheet, enemy.frameIndex * spriteWidth, 0, spriteWidth, slimeSpritesheet.height, enemy.x, enemy.y, enemy.width, enemy.height);
        } else if (enemy.isRato) {
            spriteWidth = ratSpritesheet.width / enemy.frameCount;
            ctx.drawImage(ratSpritesheet, enemy.frameIndex * spriteWidth, 0, spriteWidth, ratSpritesheet.height, enemy.x, enemy.y, enemy.width, enemy.height);
        }

        // Desenha a barra de vida do inimigo
        drawEnemyHealthBar(enemy);

        // Hitbox do inimigo
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function drawEnemyHealthBar(enemy) {
    const healthBarWidth = 50;
    const healthBarHeight = 5;
    const healthRatio = enemy.health / enemy.maxHealth;

    ctx.fillStyle = 'red';
    ctx.fillRect(enemy.x, enemy.y - 10, healthBarWidth, healthBarHeight);

    ctx.fillStyle = 'green';
    ctx.fillRect(enemy.x, enemy.y - 10, healthBarWidth * healthRatio, healthBarHeight);
}

function startJump() {
    if (player.y >= gameHeight - player.height) {
        player.velocityY = -550;
        player.isJumping = true;
    }
}


//sistema de magia
const projectiles = [];

function shootProjectile() {
    const currentTime = Date.now();

    if (currentTime - lastProjectileTime >= projectileCooldown) {
        const projectile = {
            x: player.x + player.width,
            y: player.y + player.height / 2,
            width: 45,
            height: 45,
            speed: 800,
            damage: 25,
            image: projectileImage
        };
        projectiles.push(projectile);
        lastProjectileTime = currentTime;
    }
}

function updateProjectiles(deltaTime) {
    projectiles.forEach((projectile, index) => {
        projectile.x += projectile.speed * deltaTime;

        const enemies = [...slimes, ...bats, ...skeletons];

        enemies.forEach((enemy) => {
            if (!enemy.isDefeated && checkCollision(projectile, enemy)) {
                enemy.health -= projectile.damage;
                if (enemy.health <= 0) {
                    enemy.isDefeated = true;
                    score += 10;
                    enemyHitSound.play();
                }
                projectiles.splice(index, 1);
            }
        });

        if (projectile.x > gameWidth) {
            projectiles.splice(index, 1);
        }
    });
}


function drawProjectiles() {
    projectiles.forEach(projectile => {
        ctx.drawImage(projectile.image, projectile.x, projectile.y, projectile.width, projectile.height);
    });
}

// sistema de colisões (basicamente ve se as bordas do inimigo tão em contato com as bordas do player)
function checkCollision(rect1, rect2) {
    const hitbox1 = rect1.isRato ? rect1.hitbox : rect1;
    return (
        hitbox1.x < rect2.x + rect2.width &&
        hitbox1.x + hitbox1.width > rect2.x &&
        hitbox1.y < rect2.y + rect2.height &&
        hitbox1.y + hitbox1.height > rect2.y
    );
}


//se o player tiver no ar por exemplo, a hitbox vai seguir ele
function updateAttackHitbox() {
    if (player.isAttacking) {
        player.attackHitbox.x = player.x + player.width;
        player.attackHitbox.y = player.y + player.height / 2 - player.attackHitbox.height / 2;
    }
}


// ataca
function attackEnemy() {
    if (player.isAttacking) {
        const enemies = [...slimes, ...bats, ...skeletons, ...rats];

        enemies.forEach((enemy) => {
            if (!enemy.isDefeated && checkCollision(player.attackHitbox, enemy)) {
                enemy.health -= 30;
                if (enemy.health <= 0) {
                    enemy.isDefeated = true;
                    score += 10;
                    enemyHitSound.play();
                }
            }
        });
    }
}


function playMusic() {
    backgroundOST.play();
}

function stopMusic() {
    backgroundOST.pause();
}

function pauseGame() {
    stopMusic();
    isPaused = true;
}

//pauseButton.addEventListener('click', togglePause);

function resumeGame() {
    isPaused = false;
    playMusic();
    lastTime = performance.now();
    gameLoop();
}

function togglePause() {
    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function showGameOverScreen() {
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'flex';
    isPaused = true;
}

document.getElementById('restartButton').addEventListener('click', restartGame);

function levelUp() {
    currentLevel++; // Aumenta o nível atual
    pointsToNextLevel += 100; // Aumenta os pontos necessários para o próximo nível
    
    // Trocar background
    if (currentLevel <= backgroundImages.length) {
        currentBackgroundImage.src = backgroundImages[currentLevel - 1];
    } else {
        currentBackgroundImage.src = backgroundImages[backgroundImages.length - 1];
    }
}

function updateEnemies(deltaTime) {
    // Atualiza Slimes
    slimes.forEach((slime, index) => {
        slime.x -= enemySpeed * deltaTime;

        if (!slime.jumping && slime.y === slime.groundY) {
            slime.jumping = true;
            slime.velocityY = slimeJumpVelocity;
        }
    
        // Atualiza a gravidade
        if (slime.jumping) {
            slime.velocityY += slimeGravity * deltaTime;
            slime.y += slime.velocityY * deltaTime;
    
            if (slime.y >= slime.groundY) {
                slime.y = slime.groundY;
                slime.jumping = false;
                slime.velocityY = 0;
            }
        }

        // Atualiza a animação
        const currentTime = Date.now();
        if (currentTime - slime.lastFrameTime >= slime.frameDelay) {
            slime.frameIndex = (slime.frameIndex + 1) % slime.frameCount;
            slime.lastFrameTime = currentTime;
        }

        if (checkCollision(player, slime) && !slime.isDefeated) {
            player.health -= 1;
            slime.isDefeated = true;

            if (player.health <= 0) {
                playerDead = true;
                showGameOverScreen();
            }
        }

        if (slime.x + slime.width < 0 || slime.isDefeated) {
            slimes.splice(index, 1);
        }
    });

    bats.forEach((bat, index) => {
        bat.x -= enemySpeed * deltaTime;

        const currentTime = Date.now();
        if (currentTime - bat.lastFrameTime >= bat.frameDelay) {
            bat.frameIndex = (bat.frameIndex + 1) % bat.frameCount;
            bat.lastFrameTime = currentTime;
        }

        if (checkCollision(player, bat) && !bat.isDefeated) {
            player.health -= 1;
            bat.isDefeated = true;

            if (player.health <= 0) {
                playerDead = true;
                showGameOverScreen();
            }
        }

        // Remove o morcego se ele sair da tela ou for derrotado
        if (bat.x + bat.width < 0 || bat.isDefeated) {
            bats.splice(index, 1);
        }
    });

    skeletons.forEach((skeleton, index) => {
        skeleton.x -= enemySpeed * deltaTime;

        const currentTime = Date.now();
        if (currentTime - skeleton.lastFrameTime >= skeleton.frameDelay) {
            skeleton.frameIndex = (skeleton.frameIndex + 1) % skeleton.frameCount;
            skeleton.lastFrameTime = currentTime;
        }

        if (checkCollision(player, skeleton) && !skeleton.isDefeated) {
            player.health -= 1;
            skeleton.isDefeated = true;

            if (player.health <= 0) {
                playerDead = true;
                showGameOverScreen();
            }
        }

        if (skeleton.x + skeleton.width < 0 || skeleton.isDefeated) {
            skeletons.splice(index, 1);
        }
    });

    rats.forEach((rat, index) => {
        rat.x -= enemySpeed * deltaTime;
    
        rat.hitbox.x = rat.x;
        rat.hitbox.y = rat.y + rat.hitbox.y;
    
        const currentTime = Date.now();
        if (currentTime - rat.lastFrameTime >= rat.frameDelay) {
            rat.frameIndex = (rat.frameIndex + 1) % rat.frameCount;
            rat.lastFrameTime = currentTime;
        }
    
        if (checkCollision(player, rat) && !rat.isDefeated) {
            player.health -= 1;
            rat.isDefeated = true;
    
            if (player.health <= 0) {
                playerDead = true;
                showGameOverScreen();
            }
        }
    
        if (rat.x + rat.width < 0 || rat.isDefeated) {
            rats.splice(index, 1);
        }
    });
    


}



//praticamente tudo que se mexe acontece dentro dessa função update, que basicamente atualiza frame por frame do jogo
function update() {
    if (playerDead) return;
    const currentTime = Date.now();

    player.velocityY += player.gravity * deltaTime;
    player.y += player.velocityY * deltaTime;

    if (player.y >= gameHeight - player.height) {
        player.y = gameHeight - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    if (player.isJumping) {
        player.currentImage = playerJumpImage;
    } else {
        player.currentImage = playerIdleImage;
    }

    updateAttackHitbox(); // cooldown do ataque, tipo, ele pega a ultima vez que vc atacou, e se ainda tiver dentro do cooldown n pode atacar dnv ainda

    if (player.isAttacking && Date.now() - player.lastAttack >= player.attackCooldown) { 
        player.attackStartTime = Date.now();
        attackEnemy();
        player.lastAttack = Date.now();
    }


    if (currentTime - lastSpawnTime >= spawnCooldown && Math.random() < spawnRate) { //pra n enche de bixo na tela
        spawnEnemy();
        lastSpawnTime = currentTime;
    }

    updateEnemies(deltaTime);
    updateProjectiles(deltaTime);

    if (score >= pointsToNextLevel) {
        levelUp();
    }

}

// PRINTANDO O JOGO (perdi)
function draw() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    ctx.drawImage(currentBackgroundImage, 0, 0, gameWidth, gameHeight);
    
    // player
    ctx.drawImage(player.currentImage, player.x, player.y, player.width, player.height);

    if (player.isAttacking) { // hitbox do ataque
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(player.attackHitbox.x, player.attackHitbox.y, player.attackHitbox.width, player.attackHitbox.height);
    }

    drawProjectiles();
    drawEnemies();



    // score
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Pontuação: ' + score, 10, 30);

    // vidas
    ctx.fillText('Vida do André: ' + player.health, 10, 60);
    ctx.fillText('Cima = pula', 10, 90);
    ctx.fillText('Baixo = ataca', 10, 120);
    ctx.fillText('Direita = atira', 10, 150);
    ctx.fillText('P = Pausa', 10, 180);
}

// reinicia os status tudo certinho
function restartGame() {
    playerDead = false;
    player.health = 3;
    score = 0;
    currentLevel = 1;
    currentBackgroundImage.src = backgroundImages[0];
    enemySpeed = 300;
    spawnRate = 0.01;
    enemies.length = 0;
    projectiles.length = 0;
    player.currentImage = playerIdleImage;
    player.attackHitbox.x = player.x + player.width;
    player.attackHitbox.y = player.y + player.height;
    document.getElementById('gameOverScreen').style.display = 'none';
    isPaused = false;
    lastFrameTime = performance.now();
    gameLoop();
}

// aumenta dificuldade
function increaseDifficulty() {
    enemySpeed += 6;
    spawnRate += 0.0020;
    if (spawnCooldown > 1500){
    spawnCooldown -= 100;
    }
}

function gameLoop() {

    let currentFrameTime = performance.now();
    deltaTime = (currentFrameTime - lastFrameTime) / 1000;
    lastFrameTime = currentFrameTime;
    deltaTime = Math.min(deltaTime, 0.0333);

    if (!isPaused) {
        update(deltaTime);
        draw();
    }

    requestAnimationFrame(gameLoop);
}


// teclas

document.addEventListener("keydown", function(event) {
    if (event.code === "ArrowUp"){
        startJump();
        jumpSound.play();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        if (Date.now() - player.lastAttack >= player.attackCooldown) {
            player.isAttacking = true;
            player.currentImage = playerAttackImage;
            updateAttackHitbox();
            attackSound.play();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown') {
        player.isAttacking = false;
        player.currentImage = playerIdleImage;
    }
});

document.addEventListener('keydown', (e) => { 
    if (e.key === 'ArrowRight') {
        shootProjectile();
    }

    if (e.key === 'p') {
        togglePause();
    }
});


function startGame() {
    menu.style.display = 'none';
    canvas.style.display = 'block';
    gameLoop();
    backgroundOST.play();
}

setInterval(increaseDifficulty, 10000);



