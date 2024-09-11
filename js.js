const canvas = document.getElementById('Canvas');
const ctx = canvas.getContext('2d');

//configs gerais
const gameWidth = canvas.width;
const gameHeight = canvas.height;
let playerDead = false;
let score = 0;
let enemySpeed = 2;
let spawnRate = 0.0065;
let difficultyInterval = 15000;
let lastSpawnTime = 0; // isso é sobre o cooldown de spawnar inimigo
let spawnCooldown = 2000; // isso tbm

const playerIdleImage = new Image();
playerIdleImage.src = 'assets/images/voldado.png';

const playerJumpImage = new Image();
playerJumpImage.src = 'assets/images/pulavoldado.png';

const enemyGroundImage = new Image();
enemyGroundImage.src = 'assets/images/enemy_ground.jpg';

const enemyAirImage = new Image();
enemyAirImage.src = 'assets/images/enemy_air.jpg';

const player = {
    x: 305,
    y: gameHeight - 200,
    width: 200,
    height: 200,
    speed: 4.5,
    isJumping: false,
    jumpHeight: 150,
    jumpSpeed: 0,
    health: 3,
    isAttacking: false,
    attackHitbox: {
        x: 0,
        y: 0,
        width: 75,
        height: 30
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

const enemies = [];

const keys = {
    ArrowUp: false,
    ArrowDown: false,
};

function tocaGemidao(){
    var sound = document.getElementById("fornai");
    sound.play();
}

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
    };
    enemies.push(enemy);
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
                enemy.isDefeated = true;
                score += 10;
            }
        });
    }
}

//praticamente tudo que se mexe acontece dentro dessa função update, que basicamente atualiza frame por frame do jogo
function update() {
    if (playerDead) return;
    const currentTime = Date.now();

    // quando pula levanta o player e dps desce ele de novo
    if (player.isJumping) {
        player.jumpSpeed -= 1;
        player.y -= player.jumpSpeed;
        player.currentImage = playerJumpImage;

        if (player.y >= gameHeight - 200) {
            player.y = gameHeight - 200;
            player.isJumping = false;
            player.currentImage = playerIdleImage;
        }
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

        // tira vida e mata o player (caso queira, se tirar o .treasure a hitbox vai pro rei)
        if (checkCollision(player, enemy) && !enemy.isDefeated) {
            player.health -= 1;
            enemy.isDefeated = true;
            tocaGemidao();

            if (player.health <= 0) {
                playerDead = true;
                alert("Game Over! Sua pontuação: " + score);
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

}

// PRINTANDO O JOGO (perdi)
function draw() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // player
    ctx.drawImage(player.currentImage, player.x, player.y, player.width, player.height);

    if (player.isAttacking) { // hitbox do ataque
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(player.attackHitbox.x, player.attackHitbox.y, player.attackHitbox.width, player.attackHitbox.height);
    }

    // hitbox do TESOURO PIRATAA YARRRRRRRRR
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.treasure.x, player.treasure.y, player.treasure.width, player.treasure.height);


    // inimigos
    enemies.forEach(enemy => {
        ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);

        // hitbox deles
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // score
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Pontuação: ' + score, 10, 30);

    // vidas
    ctx.fillText('Ouro Pirata 🏴‍☠️🤑: ' + player.health, 10, 60);
}

// reinicia os status tudo certinho
function restartGame() {
    playerDead = false;
    player.health = 3;
    score = 0;
    enemySpeed = 4.5;
    spawnRate = 0.01;
    enemies.length = 0;
    player.currentImage = playerIdleImage;
    player.attackHitbox.x = player.x + player.width;
    player.attackHitbox.y = player.y + player.height;
    gameLoop();
}

// aumenta dificuldade
function increaseDifficulty() {
    enemySpeed += 0.07;
    spawnRate -= 0.001;
    spawnCooldown -= 200;
}

// se o player não ta morto então continua, se ele morreu então reinicia :)
function gameLoop() {
    update();
    draw();
    if (!playerDead) {
        requestAnimationFrame(gameLoop);
    } else {
        setTimeout(() => {
            if (confirm("Deseja reiniciar o jogo?")) {
                restartGame();
            }
        }, 1000);
    }
}

// teclas
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && !player.isJumping) {
        player.isJumping = true;
        player.jumpSpeed = 15;
    }
    if (e.key === 'ArrowDown') {
        if (Date.now() - player.lastAttack >= player.attackCooldown) {
            player.isAttacking = true;
            updateAttackHitbox(); //
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown') {
        player.isAttacking = false;
    }
});

// essa função aqui embaixo começa o jogo, a outra aumenta a dificuldade com o tempo
gameLoop();
setInterval(increaseDifficulty, difficultyInterval);