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
const pauseMenu = document.getElementById('pauseMenu');
const resumeGameBtn = document.getElementById('resumeGameBtn');
const quitGameBtn = document.getElementById('quitGameBtn');
const backgroundImages = ['assets/backgrounds/castle/castle.png', 'assets/backgrounds/castle/castle2.png', 'assets/backgrounds/background1.png', 'assets/backgrounds/background12.png', 'assets/backgrounds/background2.png', 'assets/backgrounds/background22.png', 'assets/backgrounds/background23.png'];
let currentBackgroundImage = new Image();
currentBackgroundImage.src = backgroundImages[0];

//configs gerais
const gameWidth = canvas.width;
const gameHeight = canvas.height;
let isPaused = false;
let playerDead = false;
let score = 0;
let enemySpeed = 300;
let batSpeed = 220;
let spawnRate = 0.0065;
let lastSpawnTime = 0; // cooldown inimigo
let spawnCooldown = 2000;
let lastProjectileTime = 0; // cooldown tiro
let projectileCooldown = 500;
let currentLevel = 1;
let pointsToNextLevel = 100;
let lastFrameTime = performance.now();

//carregar os elementos visuais e sonoros

const playerIdleImage = new Image();
playerIdleImage.src = 'assets/images/king/idle/frame1.png';

const idleSpritesheet = new Image();
idleSpritesheet.src = 'assets/images/king/idle/idle_spritesheet.png';

const attackSpritesheet = new Image();
attackSpritesheet.src = 'assets/images/king/attack/attack_spritesheet.png';

const airAttackSpritesheet = new Image();
airAttackSpritesheet.src = 'assets/images/king/jump/swordjump/air_attack_spritesheet.png';

const playerJumpImage = new Image();
playerJumpImage.src = 'assets/images/king/jump/swordjump/frame1.png';

const heartImage = new Image();
heartImage.src = 'assets/images/heart.png';

let slimeJumpVelocity = -420;
let slimeGravity = 670;

const skeletonSpritesheet = new Image();
skeletonSpritesheet.src = 'assets/images/enemies/skeleton_spritesheet.png';

const slimeSpritesheet = new Image();
slimeSpritesheet.src = 'assets/images/enemies/slime_spritesheet.png';

const batSpritesheet = new Image();
batSpritesheet.src = 'assets/images/enemies/bat_spritesheet.png';

const ratSpritesheet = new Image();
ratSpritesheet.src = 'assets/images/enemies/rat_spritesheet.png';

const skeleton2Spritesheet = new Image();
skeleton2Spritesheet.src = 'assets/images/enemies/skeleton2_spritesheet.png';

const bat2Spritesheet = new Image();
bat2Spritesheet.src = 'assets/images/enemies/bat2_spritesheet.png';

const necromancerSpritesheet = new Image();
necromancerSpritesheet.src = 'assets/images/enemies/necromancer_spritesheet.png';

const necromancerThrowSpritesheet = new Image();
necromancerThrowSpritesheet.src = 'assets/images/enemies/necromancer_attackspritesheet.png';

const necromancerSummonSpritesheet = new Image();
necromancerSummonSpritesheet.src = 'assets/images/enemies/necromancer_summonspritesheet.png';

const amalgamSpritesheet = new Image();
amalgamSpritesheet.src = 'assets/images/enemies/amalgam_spritesheet.png';

const amalgamProjectileImage = new Image();
amalgamProjectileImage.src = 'assets/images/enemies/fireball.png';

const manfrediniSpritesheet = new Image();
manfrediniSpritesheet.src = 'assets/images/enemies/manfredini_idle.png';

const manfrediniProjectileImage = new Image();
manfrediniProjectileImage.src = 'assets/images/enemies/bomb.png';

const diceRollSpritesheet = new Image();
diceRollSpritesheet.src = 'assets/images/enemies/dado_spritesheet.png';

const manfrediniAttackSpritesheet = new Image();
manfrediniAttackSpritesheet.src = 'assets/images/enemies/manfredini_attack.png';

const manfredragonSpritesheet = new Image();
manfredragonSpritesheet.src = 'assets/images/enemies/manfredragon_idle.png';

const manfredragonSmokeImage = new Image();
manfredragonSmokeImage.src = 'assets/images/enemies/manfredragon_smoke.png';

const manfredragonFireImage = new Image();
manfredragonFireImage.src = 'assets/images/enemies/manfredragon_fire.png';


const diceImages = [
    'assets/images/dice1.png',
    'assets/images/dice2.png',
    'assets/images/dice3.png',
    'assets/images/dice4.png',
    'assets/images/dice5.png',
    'assets/images/dice6.png'
];

const playerAttackImage = new Image();
playerAttackImage.src = 'assets/images/elprimo.png';

const shootSpritesheet = new Image();
shootSpritesheet.src = 'assets/images/king/magic/magic_spritesheet.png';

const projectileImage = new Image();
projectileImage.src = 'assets/images/attack/ball2.png';

const fireballImage = new Image();
fireballImage.src = 'assets/images/fireball.png';

const jumpSound = new Audio('assets/sounds/jumpSound.mp3');
const attackSound = new Audio('assets/sounds/attackSound.mp3');
const enemyHitSound = new Audio('assets/sounds/enemyHit.mp3');
const backgroundOST = new Audio('assets/sounds/bossfight.mp3');
const magicSound = new Audio('assets/sounds/magicSound.mp3');
const soundtrack = new Audio('assets/sounds/soundtrack.mp3');
backgroundOST.loop = true;

optionsMenu.style.display = 'flex';


//funcoes do menu inicial
//
//
function showInstructions() {
    window.location.href = 'instructions.html';
}

function showCredits() {
    window.location.href = 'credits.html';
}

window.onload = function() { // salvar o volume mesmo se fechar a aba
    const savedVolume = localStorage.getItem('volume');
    if (savedVolume !== null) {
        volumeSlider.value = savedVolume;
    }
};

volumeSlider.addEventListener('input', function() {
    const volume = volumeSlider.value;
    backgroundOST.volume = volume; // Controle do volume da música de fundo
    attackSound.volume = volume; // Controle do volume do som de ataque
    jumpSound.volume = volume;   // Controle do volume do som de pulo
    enemyHitSound.volume = volume; // Controle do volume do som de hit
    magicSound.volume = volume;
    localStorage.setItem('volume', volume);
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
    window.location.href = 'index.html';
});

fullscreenBtn.addEventListener('click', toggleFullscreen);
startGameBtn.addEventListener('click', startGame);
instructionsBtn.addEventListener('click', showInstructions);
creditsBtn.addEventListener('click', showCredits);
resumeGameBtn.addEventListener('click', resumeGame);
quitGameBtn.addEventListener('click', function() {
    window.location.href = 'index.html';
});

//stats
const player = {
    x: 255,
    y: gameHeight - 67,
    width: 200,
    height: 200,
    speed: 4.5,
    isJumping: false,
    jumpHeight: 150,
    jumpSpeed: -8,
    gravity: 1150,
    velocityY: 0,
    health: 5,
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
    idleFrameIndex: 0,
    idleFrameCount: 4,
    idleFrameDelay: 200,
    lastIdleFrameTime: 0,

    attackAnimation: true,
    attackFrameIndex: 0,
    attackFrameCount: 4,
    attackFrameDelay: 50,
    lastAttackFrameTime: 0,

    isAirAttacking: false,
    airAttackFrameIndex: 0,
    airAttackFrameCount: 5, 
    airAttackFrameDelay: 50,
    lastAirAttackFrameTime: 0,

    isShooting: false,
    shootFrameIndex: 0,
    shootFrameCount: 4,
    shootFrameDelay: 70,
    lastShootFrameTime: 0,
};

const keys = {
    ArrowUp: false,
    ArrowDown: false,
};

//stats dos inimigos
let necromancer = {
    x: gameWidth - 200,
    y: gameHeight - 270,
    width: 200,
    height: 200,
    health: 400,
    maxHealth: 400,
    frameIndex: 0,
    frameCount: 2,
    frameDelay: 1000,
    lastFrameTime: 0,
    isDefeated: true,
    attackCooldown: 3000,
    lastAttackTime: 0,
    isThrowing: false,
    throwFrameIndex: 0,
    throwFrameCount: 4,
    throwFrameDelay: 80,
    lastThrowFrameTime: 0,
    isSummoning: false,
    summonFrameIndex: 0,
    summonFrameCount: 4,
    summonFrameDelay: 100,
    lastSummonFrameTime: 0,
    projectiles: []
};

const slimes = [];
const bats = [];
const skeletons = [];
const rats = [];


function spawnEnemy() {
    let enemyType = Math.random() > 0.5 ? 'ground' : 'air';

    if (currentLevel === 1 || currentLevel === 3 || currentLevel === 5) {
        enemyType = 'ground';
    }

    if (enemyType === 'ground') {
        if (currentLevel === 3) {
            if (Math.random() < 0.5) { // Chance de spawn do slime
                const slime = {
                    x: gameWidth,
                    y: gameHeight - 170,
                    width: 100,
                    height: 100,
                    isDefeated: false,
                    isSlime: true,
                    jumping: false,
                    jumpHeight: 100,
                    groundY: gameHeight - 170,
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
                    y: gameHeight - 150,
                    width: 100,
                    height: 75,
                    isDefeated: false,
                    isRato: true,
                    health: 30,
                    maxHealth: 30,
                    frameIndex: 0,
                    frameCount: 3, // spritesheet frames
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
        } else if (currentLevel === 1 || currentLevel === 5){ // Para fases diferentes da 2
            if (Math.random() < 0.7) {
                const skeleton = {
                x: gameWidth,
                y: gameHeight - 195,
                width: 125,
                height: 125,
                tipo: 'ground',
                isDefeated: false,
                isSkeleton: true,
                health: 75,
                maxHealth: 75,
                frameIndex: 0,
                frameCount: 6,
                frameDelay: 150,
                lastFrameTime: 0,
            };
            skeletons.push(skeleton);
        }
    else if (Math.random() < 0.7){
            const bat = {
                x: gameWidth,
                y: gameHeight - 370,
                width: 100,
                height: 100,
                tipo: 'air',
                isDefeated: false,
                isBat: true,
                health: 50,
                maxHealth: 50,
                frameIndex: 0,
                frameCount: 5,
                frameDelay: 150,
                lastFrameTime: 0,
            };
            bats.push(bat);
        }
    }
}
}


function drawEnemies() {
    const enemies = [...slimes, ...bats, ...skeletons, ...rats];

    enemies.forEach(enemy => {
        let spriteWidth;

        if (enemy.isSkeleton) {
            if (currentLevel === 5) {
                spriteWidth = skeleton2Spritesheet.width / enemy.frameCount;
                ctx.drawImage(skeleton2Spritesheet, enemy.frameIndex * spriteWidth, 0, spriteWidth, skeleton2Spritesheet.height, enemy.x, enemy.y, enemy.width, enemy.height);
            } else if (currentLevel === 1) {
                spriteWidth = skeletonSpritesheet.width / enemy.frameCount;
                ctx.drawImage(skeletonSpritesheet, enemy.frameIndex * spriteWidth, 0, spriteWidth, skeletonSpritesheet.height, enemy.x, enemy.y, enemy.width, enemy.height);
            }
        } else if (enemy.isBat) {
            if (currentLevel === 5) {
                spriteWidth = bat2Spritesheet.width / enemy.frameCount;
                ctx.drawImage(bat2Spritesheet, enemy.frameIndex * spriteWidth, 0, spriteWidth, bat2Spritesheet.height, enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                spriteWidth = batSpritesheet.width / enemy.frameCount;
                ctx.drawImage(batSpritesheet, enemy.frameIndex * spriteWidth, 0, spriteWidth, batSpritesheet.height, enemy.x, enemy.y, enemy.width, enemy.height);
            }
        } else if (enemy.isSlime) {
            spriteWidth = slimeSpritesheet.width / enemy.frameCount;
            ctx.drawImage(slimeSpritesheet, enemy.frameIndex * spriteWidth, 0, spriteWidth, slimeSpritesheet.height, enemy.x, enemy.y, enemy.width, enemy.height);
        } else if (enemy.isRato) {
            spriteWidth = ratSpritesheet.width / enemy.frameCount;
            ctx.drawImage(ratSpritesheet, enemy.frameIndex * spriteWidth, 0, spriteWidth, ratSpritesheet.height, enemy.x, enemy.y, enemy.width, enemy.height);
        }

        // Desenha a barra de vida do inimigo
        drawEnemyHealthBar(enemy);

        /* Hitbox do inimigo
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);*/
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
    if (player.y >= (gameHeight - 67) - player.height) {
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
            y: player.y + player.height / 4,
            width: 45,
            height: 45,
            speed: 800,
            damage: 25,
            image: projectileImage
        };
        projectiles.push(projectile);
        lastProjectileTime = currentTime;

        player.isShooting = true;
        player.shootFrameIndex = 0;
        player.lastShootFrameTime = currentTime;
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

        if (!necromancer.isDefeated && checkCollision(projectile, necromancer)) {
            necromancer.health -= projectile.damage;
            if (necromancer.health <= 0) {
                necromancer.isDefeated = true;
                score += 100;
                enemyHitSound.play();
            }
            projectiles.splice(index, 1);
        }

        if (!manfredini.isDefeated && checkCollision(projectile, manfredini)) {
            manfredini.health -= projectile.damage;
            if (manfredini.health <= 0) {
                manfredini.isDefeated = true;
                score += 100;
                enemyHitSound.play();
            }
            projectiles.splice(index, 1);
        }

        manfredini.projectiles.forEach((diceProjectile, diceIndex) => {
            if (checkCollision(projectile, diceProjectile)) {
                diceProjectile.hitCount--;
                projectiles.splice(index, 1);

                if (diceProjectile.hitCount <= 0) {
                    manfredini.projectiles.splice(diceIndex, 1);
                }
            }
        });

        if (!manfredragon.isDefeated && checkCollision(projectile, manfredragon)) {
            manfredragon.health -= projectile.damage;
            if (manfredragon.health <= 0) {
                manfredragon.isDefeated = true;
                score += 100;
                enemyHitSound.play();
            }
            projectiles.splice(index, 1);
        }

        manfredragon.projectiles.forEach((manfredProjectile, manfredIndex) => {
            if (checkCollision(projectile, manfredProjectile)) {
                projectiles.splice(index, 1);
                manfredragon.projectiles.splice(manfredIndex, 1);
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


function updateAirAttackHitbox() {
    if (player.isAirAttacking) {
        player.attackHitbox.x = player.x + player.width;
        player.attackHitbox.y = player.y + player.height / 2 - player.attackHitbox.height / 2;
    }
}



// bixo tomando ataque
function attackEnemy() {
    const enemies = [...slimes, ...bats, ...skeletons, ...rats, amalgam];

    if (player.isAttacking || player.isAirAttacking) {
        enemies.forEach((enemy) => {
            if (!enemy.isDefeated && checkCollision(player.attackHitbox, enemy)) {
                if (enemy === amalgam) {
                    if (!amalgam.invincible) {
                        amalgam.health -= 30;
                        amalgam.invincible = true;
                        amalgam.lastHitTime = Date.now();
                        amalgam.movingBack = true;

                        if (amalgam.health <= 0) {
                            amalgam.isDefeated = true;
                            score += 100;
                        }
                    }
                } else {
                    enemy.health -= 30;
                    if (enemy.health <= 0) {
                        enemy.isDefeated = true;
                        score += 10;
                    }
                }
            }
        });
    }
}



function playMusic() {
    backgroundOST.play();
}

function pauseMusic() {
    backgroundOST.pause();
}

function stopMusic() {
    backgroundOST.pause();
    backgroundOST.currentTime = 0;
}

function pauseGame() {
    pauseMusic();
    isPaused = true;
    pauseMenu.style.display = 'block';
}

//pauseButton.addEventListener('click', togglePause);

function resumeGame() {
    isPaused = false;
    playMusic();
    lastTime = performance.now();
    pauseMenu.style.display = 'none';
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
    currentLevel++;
    pointsToNextLevel += 100;
    
    // Trocar background
    if (currentLevel <= backgroundImages.length) {
        currentBackgroundImage.src = backgroundImages[currentLevel - 1];
    } else {
        currentBackgroundImage.src = backgroundImages[backgroundImages.length - 1];
    }

    if (currentLevel === 2) {
        necromancer.isDefeated = false;
    }

    if (currentLevel === 4) {
        amalgam.isDefeated = false;
    }

    if (currentLevel === 6) {
        manfredini.isDefeated = false;
    }

    if (currentLevel === 7){
        manfredragon.isDefeated = false;
    }

    if (currentLevel === 8){
        const victoryMenu = document.getElementById('victoryMenu');
        victoryMenu.style.display = 'block';
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
                stopMusic();
            }
        }

        if (slime.x + slime.width < 0 || slime.isDefeated) {
            slimes.splice(index, 1);
        }
    });

    bats.forEach((bat, index) => {
        bat.x -= batSpeed * deltaTime;

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
                stopMusic();
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
                stopMusic();
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
                stopMusic();
            }
        }
    
        if (rat.x + rat.width < 0 || rat.isDefeated) {
            rats.splice(index, 1);
        }
    });
    


}

function setupMobileControls() {
    const mobileControls = document.getElementById('mobileControls');

    if (window.matchMedia("(max-width: 800px)").matches) {
        mobileControls.style.display = 'block';

        document.getElementById('jumpButton').addEventListener('touchstart', startJump);
        document.getElementById('attackButton').addEventListener('touchstart', attackMobile);
        document.getElementById('shootButton').addEventListener('touchstart', shootProjectile);
        document.getElementById('pauseButtonMobile').addEventListener('touchstart', togglePause);
    }
}


function attackMobile() {
    if (Date.now() - player.lastAttack >= player.attackCooldown) {
        player.isAttacking = true;
        player.currentImage = playerAttackImage;
        updateAttackHitbox();
        attackSound.play();
    }
}

function drawHearts() {
    const heartSize = 70;
    for (let i = 0; i < player.health; i++) {
        ctx.drawImage(heartImage, 10 + i * (heartSize + 5), 10, heartSize, heartSize);
    }
}

function startAttack() {
    if (player.isJumping) {
        if (!player.isAirAttacking) {
            player.isAirAttacking = true;
            player.airAttackFrameIndex = 0;
            player.lastAirAttackFrameTime = Date.now();
            attackSound.play();
            updateAirAttackHitbox();
        }
    } else {
        if (!player.isAttacking) {
            player.isAttacking = true;
            player.attackFrameIndex = 0;
            player.lastAttackFrameTime = Date.now();
            attackSound.play();
            updateAttackHitbox();
        }
    }
}

function summonSkeletons() {
    if (currentLevel === 2){
    const skeleton = {
        x: gameWidth - 200,
        y: gameHeight - 195,
        width: 125,
        height: 125,
        health: 75,
        maxHealth: 75,
        frameIndex: 0,
        frameCount: 6,
        frameDelay: 100,
        lastFrameTime: 0,
        isDefeated: false,
    };
    skeletons.push(skeleton);
    necromancer.isSummoning = true;
    necromancer.summonFrameIndex = 0;
    necromancer.lastSummonFrameTime = Date.now();
}
}

function necromancerAttack() {
    const currentTime = Date.now();
    if (currentLevel === 2) {
        if (currentTime - necromancer.lastAttackTime >= necromancer.attackCooldown) {
            const fireball = {
                x: necromancer.x,
                y: necromancer.y + necromancer.height / 1.25,
                width: 30,
                height: 20,
                speed: -640,
                damage: 1,
            };
            necromancer.projectiles.push(fireball);
            necromancer.lastAttackTime = currentTime;
            necromancer.isThrowing = true;
            necromancer.throwFrameIndex = 0;
            necromancer.lastThrowFrameTime = currentTime;
        }
    }
}

function updateBoss(deltaTime) {
    if (!necromancer.isDefeated) {
        const currentTime = Date.now();
        if (currentTime - necromancer.lastFrameTime >= necromancer.frameDelay) {
            necromancer.frameIndex = (necromancer.frameIndex + 1) % necromancer.frameCount;
            necromancer.lastFrameTime = currentTime;
        }

        if (necromancer.isSummoning) {
            if (currentTime - necromancer.lastSummonFrameTime >= necromancer.summonFrameDelay) {
                necromancer.summonFrameIndex++;
                necromancer.lastSummonFrameTime = currentTime;

                if (necromancer.summonFrameIndex >= necromancer.summonFrameCount) {
                    necromancer.isSummoning = false;
                    necromancer.summonFrameIndex = 0;
                }
            }
        } else if (necromancer.isThrowing) {
            if (currentTime - necromancer.lastThrowFrameTime >= necromancer.throwFrameDelay) {
                necromancer.throwFrameIndex++;
                necromancer.lastThrowFrameTime = currentTime;

                if (necromancer.throwFrameIndex >= necromancer.throwFrameCount) {
                    necromancer.isThrowing = false;
                    necromancer.throwFrameIndex = 0;
                }
            }
        }

        if (Math.random() < 0.0009) {
            summonSkeletons();
        }

        necromancerAttack();
    }
}

function drawNecromancer() {
    if (!necromancer.isDefeated) {
        const spriteWidth = necromancerSpritesheet.width / necromancer.frameCount;
        
        if (necromancer.isSummoning) {
            const summonSpriteWidth = necromancerSummonSpritesheet.width / necromancer.summonFrameCount;
            ctx.drawImage(necromancerSummonSpritesheet, necromancer.summonFrameIndex * summonSpriteWidth, 0, summonSpriteWidth, necromancerSummonSpritesheet.height, necromancer.x, necromancer.y, necromancer.width, necromancer.height);
        } else if (necromancer.isThrowing) {
            const throwSpriteWidth = necromancerThrowSpritesheet.width / necromancer.throwFrameCount;
            ctx.drawImage(necromancerThrowSpritesheet, necromancer.throwFrameIndex * throwSpriteWidth, 0, throwSpriteWidth, necromancerThrowSpritesheet.height, necromancer.x, necromancer.y, necromancer.width, necromancer.height);
        } else {
            ctx.drawImage(necromancerSpritesheet, necromancer.frameIndex * spriteWidth, 0, spriteWidth, necromancerSpritesheet.height, necromancer.x, necromancer.y, necromancer.width, necromancer.height);
        }
    }
}
function drawFireballs() {
    necromancer.projectiles.forEach((fireball, index) => {
        fireball.x += fireball.speed * deltaTime;
        ctx.drawImage(fireballImage, fireball.x, fireball.y, fireball.width, fireball.height);

        if (checkCollision(player, fireball)) {
            player.health -= fireball.damage;
            necromancer.projectiles.splice(index, 1);
            if (player.health <= 0) {
                playerDead = true;
                showGameOverScreen();
                stopMusic();
            }
        }

        if (fireball.x < 0) {
            necromancer.projectiles.splice(index, 1);
        }
    });
}

function drawNecromancerHealthBar() {
    if (currentLevel === 2){
    const healthBarX = gameWidth / 2 - 100;
    const healthBarY = 20;
    const healthBarWidth = 200;
    const healthBarHeight = 20;

    ctx.fillStyle = 'red';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    const healthRatio = necromancer.health / necromancer.maxHealth;
    ctx.fillStyle = 'green';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthRatio, healthBarHeight);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeText('Emissário do Pecado', gameWidth / 2, healthBarY + 50);
    ctx.fillStyle = 'black';
    ctx.font = '30px "Pixelify Sans" ,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Emissário do Pecado', gameWidth / 2, healthBarY + 50);
    }
}

const amalgam = {
    x: gameWidth - 300,
    y: gameHeight - 250,
    width: 200,
    height: 200,
    health: 120,
    maxHealth: 120,
    frameIndex: 0,
    frameCount: 3,
    frameDelay: 200,
    lastFrameTime: 0,
    isDefeated: true,
    attackCooldown: 2000,
    lastAttackTime: 0,
    projectiles: [],
    speed: 175,
    attackDamage: 1,
    startPosition: { x: gameWidth - 300, y: gameHeight - 250 },
    movingBack: false,
    isMovingTowardsPlayer: false,
    returnSpeed: 250,
    invincible: false,
    invincibilityDuration: 1500,
    lastHitTime: 0,
};

function updateAmalgam(deltaTime) {
    if (!amalgam.isDefeated) {
        const currentTime = Date.now();

        if (currentTime - amalgam.lastFrameTime >= amalgam.frameDelay) {
            amalgam.frameIndex = (amalgam.frameIndex + 1) % amalgam.frameCount;
            amalgam.lastFrameTime = currentTime;
        }

        if (player.isAttacking || player.isAirAttacking) {
            amalgam.isMovingTowardsPlayer = false; // Prevent Amalgam from attacking
            return; // Exit the function early
        }

        if (amalgam.isMovingTowardsPlayer) {
            if (player.x < amalgam.x) {
                amalgam.x -= amalgam.speed * deltaTime;
            } else if (player.x > amalgam.x + amalgam.width) {
                amalgam.x += amalgam.speed * deltaTime;
            }

            if (checkCollision(player, amalgam)) {
                player.health -= amalgam.attackDamage;
                if (player.health <= 0) {
                    playerDead = true;
                    showGameOverScreen();
                    stopMusic();
                }
                amalgam.isMovingTowardsPlayer = false;
                amalgam.movingBack = true;
            }
        } else if (amalgam.movingBack) {
            const dx = amalgam.startPosition.x - amalgam.x;
            const dy = amalgam.startPosition.y - amalgam.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 1) {
                amalgam.x += (dx / distance) * amalgam.returnSpeed * deltaTime;
                amalgam.y += (dy / distance) * amalgam.returnSpeed * deltaTime;
            } else {
                amalgam.movingBack = false;
            }
        } else {
            if (Math.random() < 0.1) {
                amalgam.isMovingTowardsPlayer = true;
            } else {
                if (currentTime - amalgam.lastAttackTime >= amalgam.attackCooldown) {
                    const fireball = {
                        x: amalgam.x + amalgam.width / 2,
                        y: amalgam.y + amalgam.height / 1.25,
                        width: 30,
                        height: 20,
                        speed: 500,
                        damage: amalgam.attackDamage,
                    };
                    fireball.direction = player.x < amalgam.x ? -1 : 1;
                    amalgam.projectiles.push(fireball);
                    amalgam.lastAttackTime = currentTime;
                }
            }
        }

        updateAmalgamProjectiles(deltaTime);
    }
}

function updateAmalgamProjectiles(deltaTime) {
    amalgam.projectiles.forEach((fireball, index) => {
        fireball.x -= fireball.speed * deltaTime;

        if (checkCollision(player, fireball)) {
            player.health -= fireball.damage;
            amalgam.projectiles.splice(index, 1);
            if (player.health <= 0) {
                playerDead = true;
                showGameOverScreen();
                stopMusic();
            }
        }

        if (fireball.x < 0) {
            amalgam.projectiles.splice(index, 1);
        }
    });
}

function drawAmalgam() {
    if (!amalgam.isDefeated) {
        const spriteWidth = amalgamSpritesheet.width / amalgam.frameCount;

        ctx.save();

        if (amalgam.movingBack) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                amalgamSpritesheet,
                amalgam.frameIndex * spriteWidth,
                0,
                spriteWidth,
                amalgamSpritesheet.height,
                -amalgam.x - amalgam.width,
                amalgam.y,
                amalgam.width,
                amalgam.height
            );
        } else {
            ctx.drawImage(
                amalgamSpritesheet,
                amalgam.frameIndex * spriteWidth,
                0,
                spriteWidth,
                amalgamSpritesheet.height,
                amalgam.x,
                amalgam.y,
                amalgam.width,
                amalgam.height
            );
        }
        ctx.restore();
    }
}

function drawAmalgamProjectiles() {
    amalgam.projectiles.forEach(fireball => {
        ctx.drawImage(amalgamProjectileImage, fireball.x, fireball.y, fireball.width, fireball.height);
    });
}

function drawAmalgamHealthBar() {
    if (currentLevel === 4){
    const healthBarX = gameWidth / 2 - 100;
    const healthBarY = 20;
    const healthBarWidth = 200;
    const healthBarHeight = 20;

    ctx.fillStyle = 'red';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    const healthRatio = amalgam.health / amalgam.maxHealth;
    ctx.fillStyle = 'green';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthRatio, healthBarHeight);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeText('Ratorba', gameWidth / 2, healthBarY + 50);
    ctx.fillStyle = 'black';
    ctx.font = '30px "Pixelify Sans" ,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ratorba', gameWidth / 2, healthBarY + 50);
    }
}

let manfredini = {
    x: gameWidth - 300,
    y: gameHeight - 250,
    width: 200,
    height: 200,
    health: 300,
    maxHealth: 300,
    frameIndex: 0,
    frameCount: 1,
    frameDelay: 200,
    lastFrameTime: 0,
    isDefeated: true,
    attackCooldown: 3000,
    lastAttackTime: 0,
    projectiles: [],
    isShooting: false,
    shootFrameIndex: 0,
    shootFrameCount: 5,
    shootFrameDelay: 100,
    lastShootFrameTime: 0,
    isRollingDice: false,
    diceRoll: 0,
    diceRollFrameCount: 11,
    diceRollFrameIndex: 0,
    diceRollFrameDelay: 100,
    lastDiceRollFrameTime: 0,
};

function manfrediniShootProjectile() {
    const currentTime = Date.now();

    if (currentTime - manfredini.lastAttackTime >= manfredini.attackCooldown) {
        manfredini.isShooting = true;
        const projectile = {
            x: manfredini.x,
            y: manfredini.y + manfredini.height / 1.25,
            width: 45,
            height: 45,
            speed: 500,
            damage: 1,
            image: manfrediniProjectileImage
        };
        manfredini.projectiles.push(projectile);
        manfredini.lastAttackTime = currentTime;
    }
}

let dice = {
    x: gameWidth - 300,
    y: gameHeight - 250,
    width: 100,
    height: 100,
    isRolling: false,
    isBroken: false,
    damage: 1,
    rollSpeed: 80,
    hitCount: 0,
    hitbox: {
        x: gameWidth - 300,
        y: gameHeight - 250,
        width: 100,
        height: 100
    }
};

function manfrediniRollDice() {
    const currentTime = Date.now();

    if (currentTime - manfredini.lastAttackTime >= manfredini.attackCooldown) {
        manfredini.isRollingDice = true;
        manfredini.diceRollFrameIndex = 0;
        manfredini.lastDiceRollFrameTime = currentTime;

        manfredini.diceRoll = Math.floor(Math.random() * 6) + 1;
        dice.hitCount = manfredini.diceRoll;

        let diceProjectile = {
            x: manfredini.x,
            y: manfredini.y + manfredini.height / 3.5,
            width: 100,
            height: 100,
            speed: 110,
            damage: dice.damage,
            rollSpeed: dice.rollSpeed,
            image: new Image(),
            hitCount: manfredini.diceRoll
        };
        diceProjectile.image.src = diceImages[manfredini.diceRoll - 1];

        manfredini.projectiles.push(diceProjectile);
        manfredini.lastAttackTime = currentTime;

        dice.x = diceProjectile.x;
        dice.y = diceProjectile.y;
    }
}

function updateDiceProjectiles(deltaTime) {
    manfredini.projectiles.forEach((projectile, index) => {
        projectile.x -= projectile.speed * deltaTime;

        if (checkCollision(player, projectile)) {
            player.health -= projectile.damage;
            manfredini.projectiles.splice(index, 1);
            if (player.health <= 0) {
                playerDead = true;
                showGameOverScreen();
                stopMusic();
            }
        }

        if (projectile.x < 0) {
            manfredini.projectiles.splice(index, 1);
        }
    });
}
function updateDice(deltaTime) {
    if (dice.isRolling && !dice.isBroken) {
        dice.x -= dice.rollSpeed * deltaTime;

        dice.hitbox.x = dice.x;
        dice.hitbox.y = dice.y;

        if (dice.x < player.x + player.width) {
            player.health -= 1;
            dice.isRolling = false;
            dice.isBroken = true;
        }
    }
    
}
function updateManfredini(deltaTime) {
    if (!manfredini.isDefeated) {
        const currentTime = Date.now();

        if (manfredini.isShooting) {
            if (currentTime - manfredini.lastShootFrameTime >= manfredini.shootFrameDelay) {
                manfredini.shootFrameIndex++;
                manfredini.lastShootFrameTime = currentTime;

                if (manfredini.shootFrameIndex >= manfredini.shootFrameCount) {
                    manfredini.isShooting = false;
                    manfredini.shootFrameIndex = 0;
                }
            }
        }

        if (manfredini.isRollingDice) {
            if (currentTime - manfredini.lastDiceRollFrameTime >= manfredini.diceRollFrameDelay) {
                manfredini.diceRollFrameIndex++;
                manfredini.lastDiceRollFrameTime = currentTime;

                if (manfredini.diceRollFrameIndex >= manfredini.diceRollFrameCount) {
                    manfredini.isRollingDice = false;
                    manfredini.diceRollFrameIndex = 0;
                }
            }
        }

        if (Math.random() < 0.5) {
            manfrediniRollDice();
        }

        if (currentTime - manfredini.lastAttackTime >= manfredini.attackCooldown) {
            manfrediniShootProjectile();
        }

    }
}

function drawManfredini() {
    if (!manfredini.isDefeated) {
        const spriteWidth = manfrediniSpritesheet.width / manfredini.frameCount;

        if (manfredini.isShooting) {
            const shootSpriteWidth = manfrediniAttackSpritesheet.width / manfredini.shootFrameCount;
            ctx.drawImage(manfrediniAttackSpritesheet, manfredini.shootFrameIndex * shootSpriteWidth, 0, shootSpriteWidth, manfrediniAttackSpritesheet.height, manfredini.x, manfredini.y, manfredini.width, manfredini.height);
        } else if (manfredini.isRollingDice) {
            const diceSpriteWidth = diceRollSpritesheet.width / manfredini.diceRollFrameCount;
            ctx.drawImage(diceRollSpritesheet, manfredini.diceRollFrameIndex * diceSpriteWidth, 0, diceSpriteWidth, diceRollSpritesheet.height, manfredini.x, manfredini.y, manfredini.width, manfredini.height);
        } else {
            ctx.drawImage(manfrediniSpritesheet, manfredini.frameIndex * spriteWidth, 0, spriteWidth, manfrediniSpritesheet.height, manfredini.x, manfredini.y, manfredini.width, manfredini.height);
        }

        manfredini.projectiles.forEach(projectile => {
            ctx.drawImage(projectile.image, projectile.x, projectile.y, projectile.width, projectile.height);
        });
    }
}

function drawManfrediniHealthBar() {
    if (currentLevel === 6){
    const healthBarX = gameWidth / 2 - 100;
    const healthBarY = 20;
    const healthBarWidth = 200;
    const healthBarHeight = 20;

    ctx.fillStyle = 'red';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    const healthRatio = manfredini.health / manfredini.maxHealth;
    ctx.fillStyle = 'green';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthRatio, healthBarHeight);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeText('Manfredini', gameWidth / 2, healthBarY + 50);
    ctx.fillStyle = 'black';
    ctx.font = '30px "Pixelify Sans" ,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Manfredini', gameWidth / 2, healthBarY + 50);
    }
}

let manfredragon = {
    x: gameWidth - 300,
    y: gameHeight - 360,
    width: 296,
    height: 336,
    health: 400,
    maxHealth: 400,
    frameIndex: 0,
    frameCount: 7,
    frameDelay: 200,
    lastFrameTime: 0,
    isDefeated: true,
    attackCooldown: 2000,
    lastAttackTime: 0,
    projectiles: [],
    slamCooldown: 5000,
    lastSlamTime: 0,
};

function manfredragonShootProjectile() {
    const currentTime = Date.now();

    if (currentTime - manfredragon.lastAttackTime >= manfredragon.attackCooldown) {
        const projectile = {
            x: manfredragon.x,
            y: manfredragon.y + manfredragon.height / 3,
            width: 222,
            height: 222,
            speed: 500,
            damage: 1,
            image: manfredragonFireImage
        };
        manfredragon.projectiles.push(projectile);
        manfredragon.lastAttackTime = currentTime;
    }
}

function manfredragonSlam() {
    const currentTime = Date.now();

    if (currentTime - manfredragon.lastSlamTime >= manfredragon.slamCooldown) {
        const projectile = {
            x: manfredragon.x,
            y: manfredragon.y + manfredragon.height / 1.25,
            width: 45,
            height: 45,
            speed: 500,
            damage: 1,
            image: manfredragonSmokeImage
        };
        manfredragon.projectiles.push(projectile);
        manfredragon.lastSlamTime = currentTime;
    }
}

function updateManfredragon(deltaTime) {
    if (!manfredragon.isDefeated) {
        const currentTime = Date.now();

        if (currentTime - manfredragon.lastFrameTime >= manfredragon.frameDelay) {
            manfredragon.frameIndex = (manfredragon.frameIndex + 1) % manfredragon.frameCount;
            manfredragon.lastFrameTime = currentTime;
        }

        if (Math.random() < 0.5) {
            manfredragonSlam();
        } else {
            manfredragonShootProjectile();
        }

        updateManfredragonProjectiles(deltaTime);
    }
}

function drawManfredragon() {
    if (!manfredragon.isDefeated) {
        const spriteWidth = manfredragonSpritesheet.width / manfredragon.frameCount;
        ctx.drawImage(manfredragonSpritesheet, manfredragon.frameIndex * spriteWidth, 0, spriteWidth, manfredragonSpritesheet.height, manfredragon.x, manfredragon.y, manfredragon.width, manfredragon.height);
    }

    manfredragon.projectiles.forEach(projectile => {
        ctx.drawImage(projectile.image, projectile.x, projectile.y, projectile.width, projectile.height);
    });
}

function updateManfredragonProjectiles(deltaTime) {
    manfredragon.projectiles.forEach((projectile, index) => {
        projectile.x -= projectile.speed * deltaTime;

        if (checkCollision(player, projectile)) {
            player.health -= projectile.damage;
            manfredragon.projectiles.splice(index, 1);
            if (player.health <= 0) {
                playerDead = true;
                showGameOverScreen();
                stopMusic();
            }
        }

        if (projectile.x < 0) {
            manfredragon.projectiles.splice(index, 1);
        }
    });
}

function drawManfredagonHealthBar() {
    if (currentLevel === 7){
    const healthBarX = gameWidth / 2 - 100;
    const healthBarY = 20;
    const healthBarWidth = 200;
    const healthBarHeight = 20;

    ctx.fillStyle = 'red';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    const healthRatio = manfredragon.health / manfredragon.maxHealth;
    ctx.fillStyle = 'green';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthRatio, healthBarHeight);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeText('Manfredragon', gameWidth / 2, healthBarY + 50);
    ctx.fillStyle = 'black';
    ctx.font = '30px "Pixelify Sans" ,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Manfredragon', gameWidth / 2, healthBarY + 50);
    }
}

//praticamente tudo que se mexe acontece dentro dessa função update, que basicamente atualiza frame por frame do jogo
function update() {
    if (playerDead) return;
    const currentTime = Date.now();

    player.velocityY += player.gravity * deltaTime;
    player.y += player.velocityY * deltaTime;

    if (player.y >= (gameHeight - 67) - player.height) {
        player.y = (gameHeight - 67) - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    if (player.isJumping) {
        player.currentImage = playerJumpImage;
    } else {
        player.currentImage = playerIdleImage;
    }


    if (!player.isAttacking && !player.isAirAttacking && !player.isJumping) {
        const currentTime = Date.now();
        if (currentTime - player.lastIdleFrameTime >= player.idleFrameDelay) {
            player.idleFrameIndex++;
            if (player.idleFrameIndex >= player.idleFrameCount) {
                player.idleFrameIndex = 0;
            }
            player.lastIdleFrameTime = currentTime;
        }
    }
    
    // cooldown do ataque, tipo, ele pega a ultima vez que vc atacou, e se ainda tiver dentro do cooldown n pode atacar dnv ainda
    if (player.isAttacking) {
        updateAttackHitbox();
    } else if (player.isAirAttacking) {
        updateAirAttackHitbox();
    }

    if (player.isAttacking || player.isAirAttacking && Date.now() - player.lastAttack >= player.attackCooldown) { 
        player.attackStartTime = Date.now();
        attackEnemy();
        player.lastAttack = Date.now();
    }




    if (player.isAirAttacking) {
        const currentTime = Date.now();
        if (currentTime - player.lastAirAttackFrameTime >= player.airAttackFrameDelay) {
            player.airAttackFrameIndex++;
            player.lastAirAttackFrameTime = currentTime;

            if (player.airAttackFrameIndex >= player.airAttackFrameCount) {
                player.isAirAttacking = false;
                player.airAttackFrameIndex = 0;
            }
        }
    }

    if (player.isAttacking) {
        const currentTime = Date.now();
        if (currentTime - player.lastAttackFrameTime >= player.attackFrameDelay) {
            player.attackFrameIndex++;
            player.lastAttackFrameTime = currentTime;

            if (player.attackFrameIndex >= player.attackFrameCount) {
                player.isAttacking = false;
            }
        }
    }


    if (player.isShooting) {
        const currentTime = Date.now();
        if (currentTime - player.lastShootFrameTime >= player.shootFrameDelay) {
            player.shootFrameIndex++;
            if (player.shootFrameIndex >= player.shootFrameCount) {
                player.isShooting = false;
                player.shootFrameIndex = 0;
            }
            player.lastShootFrameTime = currentTime;
        }
    }

    if (currentTime - lastSpawnTime >= spawnCooldown && Math.random() < spawnRate) { //pra n enche de bixo na tela
        spawnEnemy();
        lastSpawnTime = currentTime;
    }

    if (amalgam.invincible) {
        const currentTime = Date.now();
        if (currentTime - amalgam.lastHitTime >= amalgam.invincibilityDuration) {
            amalgam.invincible = false;
        }
    }

    updateEnemies(deltaTime);
    updateProjectiles(deltaTime);
    updateBoss(deltaTime);

    if (currentLevel === 4) {
        updateAmalgam(deltaTime);
    }

    if (currentLevel === 6) {
        updateManfredini(deltaTime);
        updateDice(deltaTime);
        updateDiceProjectiles(deltaTime);
    }

    if (currentLevel === 7) {
        updateManfredragon(deltaTime);
    }

    if (score >= pointsToNextLevel) {
        levelUp();
    }

}

// PRINTANDO O JOGO (perdi)
function draw() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    ctx.drawImage(currentBackgroundImage, 0, 0, gameWidth, gameHeight);
    
    // player
    if (player.isShooting) {
        const spriteWidth = shootSpritesheet.width / player.shootFrameCount;
        ctx.drawImage(shootSpritesheet, player.shootFrameIndex * spriteWidth, 0, spriteWidth, shootSpritesheet.height, player.x, player.y, player.width, player.height);
    } else if (player.isAirAttacking) {
        const spriteWidth = airAttackSpritesheet.width / player.airAttackFrameCount;
        ctx.drawImage(airAttackSpritesheet, player.airAttackFrameIndex * spriteWidth, 0, spriteWidth, airAttackSpritesheet.height, player.x, player.y, player.width, player.height);
    } else if (player.isAttacking) {
        const spriteWidth = attackSpritesheet.width / player.attackFrameCount;
        ctx.drawImage(attackSpritesheet, player.attackFrameIndex * spriteWidth, 0, spriteWidth, attackSpritesheet.height, player.x, player.y, player.width, player.height);
    } else if (player.isJumping) {
        ctx.drawImage(playerJumpImage, player.x, player.y, player.width, player.height);
    } else {
        const spriteWidth = idleSpritesheet.width / player.idleFrameCount;
        ctx.drawImage(idleSpritesheet, player.idleFrameIndex * spriteWidth, 0, spriteWidth, idleSpritesheet.height, player.x, player.y, player.width, player.height);
    }


    /*if (player.isAttacking || player.isAirAttacking) { hitbox do ataque
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(player.attackHitbox.x, player.attackHitbox.y, player.attackHitbox.width, player.attackHitbox.height);
    }*/

    drawProjectiles();
    drawEnemies();
    drawHearts();
    drawNecromancer();
    drawFireballs();
    drawNecromancerHealthBar();

    if (currentLevel === 4) {
        drawAmalgam();
        drawAmalgamProjectiles();
        drawAmalgamHealthBar();
    }

    if (currentLevel === 6) {
        drawManfredini();
        drawManfrediniHealthBar();
    }

    if (currentLevel === 7){
        drawManfredragon();
        drawManfredagonHealthBar();
    }

    if (currentLevel != 5){
    skeletons.forEach(skeleton => {
        let spriteWidth = skeletonSpritesheet.width / skeleton.frameCount;
        ctx.drawImage(skeletonSpritesheet, skeleton.frameIndex * spriteWidth, 0, spriteWidth, skeletonSpritesheet.height, skeleton.x, skeleton.y, skeleton.width, skeleton.height);
    });
}


    // score
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeText('Pontuação: ' + score, 10, 100);

    ctx.fillStyle = 'black';
    ctx.font = '30px "Pixelify Sans" ,sans-serif';
    ctx.fillText('Pontuação: ' + score, 10, 100);

}

function restartGame() {
    playerDead = false;
    player.health = 5;
    score = 0;
    currentLevel = 1;
    currentBackgroundImage.src = backgroundImages[0];
    enemySpeed = 300;
    spawnRate = 0.01;
    pointsToNextLevel = 100;

    slimes.length = 0;
    bats.length = 0;
    skeletons.length = 0;
    rats.length = 0;
    projectiles.length = 0;
    necromancer.isDefeated = true;
    necromancer.health = necromancer.maxHealth;
    amalgam.isDefeated = true;
    amalgam.health = amalgam.maxHealth;
    manfredini.isDefeated = true;
    manfredini.health = manfredini.maxHealth;
    manfredragon.isDefeated = true;
    manfredragon.health = manfredragon.maxHealth;

    player.currentImage = playerIdleImage;
    player.attackHitbox.x = player.x + player.width;
    player.attackHitbox.y = player.y + player.height;
    document.getElementById('gameOverScreen').style.display = 'none';
    isPaused = false;
    lastFrameTime = performance.now();
    const victoryMenu = document.getElementById('victoryMenu');
    victoryMenu.style.display = 'none';
    stopMusic();
    playMusic();
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

document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowDown') {
        startAttack();
    }
    });

document.addEventListener('keydown', (e) => { 
    if (e.key === 'ArrowRight' || e.key === 'd') {
        shootProjectile();
        magicSound.play();
        }

        if (e.key === 's') {
            startAttack();
        }

        if (e.key === 'w') {
            startJump();
            jumpSound.play();
        }

    if (e.key === 'p') {
        togglePause();
    }

    if (e.key === 'End') { // lembrar de testar essa função de tocar som quando clica
        soundtrack.play();
    }
});




function startGame() {
    menu.style.display = 'none';
    canvas.style.display = 'block';
    backToMenuBtn.style.display = 'none';
    gameLoop();
    backgroundOST.play();
}

setInterval(increaseDifficulty, 10000);



