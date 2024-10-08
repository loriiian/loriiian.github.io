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

//configs gerais
const gameWidth = canvas.width;
const gameHeight = canvas.height;
let isPaused = false;
let playerDead = false;
let score = 0;
let enemySpeed = 2;
let spawnRate = 0.0065;
let lastSpawnTime = 0; // cooldown inimigo
let spawnCooldown = 2000; //
let lastProjectileTime = 0; // cooldown tiro
let projectileCooldown = 500;

//carregar os elementos visuais e sonoros
const playerIdleImage = new Image();
playerIdleImage.src = 'assets/images/enemy_air.jpg';

const playerJumpImage = new Image();
playerJumpImage.src = 'assets/images/enemy_air.jpg';

const enemyGroundImage = new Image();
enemyGroundImage.src = 'assets/images/enemy_ground.jpg';

const enemyAirImage = new Image();
enemyAirImage.src = 'assets/images/enemy_air.jpg';

const playerAttackImage = new Image();
playerAttackImage.src = 'assets/images/elprimo.png';

const projectileImage = new Image();
projectileImage.src = 'assets/images/projectile.png';

const tronoDoRei = new Image();
tronoDoRei.src = 'assets/images/tronorei.png';

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
    y: gameHeight - 90,
    width: 75,
    height: 75,
    speed: 4.5,
    isJumping: false,
    jumpHeight: 150,
    jumpSpeed: -8,
    gravity: 0.45,
    velocityY: 0,
    health: 3,
    isAttacking: false,
    attackHitbox: {
        x: 0,
        y: 0,
        width: 75,
        height: 95
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
const enemies = [];


function spawnEnemy() {
    const tipo = Math.random() > 0.5 ? 'ground' : 'air';
    const enemy = {
        x: gameWidth,
        y: tipo === 'ground' ? gameHeight - 75 : gameHeight - 225,
        width: 75,
        height: 75,
        color: tipo === 'ground' ? 'red' : 'green',
        tipo: tipo,
        isDefeated: false,
        image: tipo === 'ground' ? enemyGroundImage : enemyAirImage,
        health: tipo === 'ground' ? 75 : 50, //75 = vida do terrestre, 50 = vida do aéreo
        maxHealth: tipo === 'ground' ? 75 : 50,
    };
    enemies.push(enemy);
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


//sistema de magia
const projectiles = [];

function shootProjectile() {
    const currentTime = Date.now();

    if (currentTime - lastProjectileTime >= projectileCooldown) {
        const projectile = {
            x: player.x + player.width,
            y: player.y + player.height / 2,
            width: 100,
            height: 100,
            speed: 7,
            damage: 25,
            image: projectileImage
        };
        projectiles.push(projectile);
        lastProjectileTime = currentTime;
    }
}

function updateProjectiles() {
    projectiles.forEach((projectile, index) => {
        projectile.x += projectile.speed;

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
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
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
        enemies.forEach((enemy, index) => {
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
    backgroundMusic.play();
}

function stopMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function pauseGame() {
    isPaused = true;
    pauseButton.textContent = 'Retomar';
    stopMusic();
}

pauseButton.addEventListener('click', togglePause);

function resumeGame() {
    isPaused = false;
    pauseButton.textContent = 'Pausar';
    playMusic();
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


//praticamente tudo que se mexe acontece dentro dessa função update, que basicamente atualiza frame por frame do jogo
function update() {
    if (playerDead) return;
    const currentTime = Date.now();

    // pulo
    if (player.isJumping) {
        player.velocityY = -10;
        player.isJumping = false;
    }

    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // aqui quando ele chega na altura máxima começa a descer
    if (player.y >= gameHeight - 90) {
        player.y = gameHeight - 90;
        player.velocityY = 0;
    }

    // tocar animação de pulo
    if (player.velocityY < 0) {
        player.currentImage = playerJumpImage;
    } else if (player.velocityY > 0) {
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

    // movimentação
    enemies.forEach((enemy, index) => {
        enemy.x -= enemySpeed;

        // tira vida e mata o player (caso queira, se colocar player.treasure a hitbox vai la pra trás)
        if (checkCollision(player, enemy) && !enemy.isDefeated) {
            player.health -= 1;
            enemy.isDefeated = true;

            if (player.health <= 0) {
                playerDead = true;
                showGameOverScreen();
            }
        }

        // sumir da tela os inimigo quando mata
        if (enemy.x + enemy.width < 0 || enemy.isDefeated) {
            enemies.splice(index, 1);
        }
    });

    if (currentTime - lastSpawnTime >= spawnCooldown && Math.random() < spawnRate) { //pra n enche de bixo na tela
        spawnEnemy();
        lastSpawnTime = currentTime;
    }

    updateProjectiles();

}

// PRINTANDO O JOGO (perdi)
function draw() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // player
    ctx.drawImage(player.currentImage, player.x, player.y, player.width, player.height);
    ctx.drawImage(tronoDoRei, gameWidth - 1100, gameHeight - 250, 200, 300);

    if (player.isAttacking) { // hitbox do ataque
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(player.attackHitbox.x, player.attackHitbox.y, player.attackHitbox.width, player.attackHitbox.height);
    }

    drawProjectiles();

    // hitbox do TESOURO PIRATAA YARRRRRRRRR (tira as // se quiser mostrar a hitbox do tesouro)
    //ctx.strokeStyle = 'blue';
    //ctx.lineWidth = 2;
    //ctx.strokeRect(player.treasure.x, player.treasure.y, player.treasure.width, player.treasure.height);


    // inimigos
    enemies.forEach(enemy => {
        ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);

        drawEnemyHealthBar(enemy);

        // hitbox deles
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // score
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Pontuação: ' + score, 10, 30);

    // vidas
    ctx.fillText('Vida do André: ' + player.health, 10, 60);
    ctx.fillText('Cima = pula', 10, 90);
    ctx.fillText('Baixo = ataca', 10, 120);
    ctx.fillText('Direita = atira', 10, 150);
    ctx.fillText('H = para musica', 10, 180);
}

// reinicia os status tudo certinho
function restartGame() {
    playerDead = false;
    player.health = 3;
    score = 0;
    enemySpeed = 4.5;
    spawnRate = 0.01;
    enemies.length = 0;
    projectiles.length = 0;
    player.currentImage = playerIdleImage;
    player.attackHitbox.x = player.x + player.width;
    player.attackHitbox.y = player.y + player.height;
    document.getElementById('gameOverScreen').style.display = 'none';
    gameLoop();
}

// aumenta dificuldade
function increaseDifficulty() {
    enemySpeed += 0.08;
    spawnRate += 0.0015;
    if (spawnCooldown > 1500){
    spawnCooldown -= 100;
    }
}

// se o player não ta morto então continua, se ele morreu então o jogo para :)
function gameLoop() {
    if (!isPaused) {
        update();
        draw();
    }

    requestAnimationFrame(gameLoop);
}


// teclas
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && !player.isJumping && player.y >= gameHeight - 90) {
        player.isJumping = true;
        player.velocityY = -10;
        jumpSound.play();
    }
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

document.addEventListener('keydown', (e) => { // lembrar de otimizar essa parte do código e acoplar com a de cima
    if (e.key === 'ArrowRight') {
        shootProjectile();
    }

    if (e.key === 'h') {
        backgroundOST.pause();
    }
});

document.addEventListener('keydown', (e) => { //despausar
    if (e.key === 'Enter' && !isPaused) {
        playMusic();
        gameLoop();
    }
});


function startGame() {
    menu.style.display = 'none';
    canvas.style.display = 'block';
    gameLoop();
    backgroundOST.play();
}

setInterval(increaseDifficulty, 10000);