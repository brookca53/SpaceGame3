const canvas = document.querySelector('canvas');
// c = context which is the API that alllows us to do the coding and artwork tghat are about to do.
const c = canvas.getContext('2d');   

//const enemySpawnRate = 2000;


// innerWidth is a property of the Window object.
// But you do not have to include the term 'Window' when using it because it is automatic.
canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');


// Now we have a giant API that specifies what everything is in our context and
// allow us to draw on top of it.
console.log(c);

// Create a class for our player
class Player {
     // Properties for the player
     constructor(x, y, radius, color) {
        this.x = x;  // for an X coordinate
        this.y = y;  // for a Y coordinate
        this.radius = radius;
        this.color = color;
     }

     draw() {
         c.beginPath();
         c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
         c.fillStyle = this.color;
         c.fill();
     }
}

// Create a class for our projectiles
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        //  Updating the X and Y coordinates
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

// Create a class for our enemies
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        //  Updating the X and Y coordinates
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;

// Create a class for our enemies
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    
    draw() {
        c.save();  // 1:22:58
        c.globalAlpha = this.alpha;  // 1:22:58
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();  // 1:22:58
    }

    update() {
        //  Updating the X and Y coordinates
        this.draw();
        this.velocity.x *= friction; // Slow the particle spread over time
        this.velocity.y *= friction; // Slow the particle spread over time
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}


const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'white');
player.draw();


let projectiles = [];
let enemies = [];
let particles = [];

function init() {
    player = new Player(x, y, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}


console.log(player);

function spawnEnemies() {
    setInterval(() => {

        let x;
        let y;
        const minEnemySize = 5;
        const radius = Math.random() * (40 - minEnemySize) + minEnemySize;
        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        

        const yDistance = canvas.height /2 - y;
        const xDistance = canvas.width /2 - x;
        const angle = Math.atan2(yDistance, xDistance);
    
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }


        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 2000);
}

let animationID;
let score = 0;
function animate() {
    animationID = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    // Remove particle explosion after alpha reaches zero or less
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
        
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();
        // remove projectiles from array once they are off screen.
        // This is done so no more computations are performed on them.
        if(projectile.x + projectile.radius < 0 ||
           projectile.x - projectile.radius > canvas.width ||
           projectile.y + projectile.radius < 0 ||
           projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        // End game
        if(dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationID);
            modalEl.style.display = 'flex';
            bigScoreEl.innerHTML = score;
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            // When projectiles touch enemy
            if(dist - enemy.radius - projectile.radius < 1) {

                // Create a particle explosion array
                for(let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2,enemy.color, 
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 6), 
                            y: (Math.random() - 0.5) * (Math.random() * 6)
                        }));
                }
                // This check makes sure that the enemy does not get too small to hit.
                if(enemy.radius - 10 > 5) {

                    // Increase our score
                    score += 100;
                    scoreEl.innerHTML = score;

                    gsap.to(enemy, { radius: enemy.radius - 10 });
                    // enemy.radius -= 10;
                    setTimeout(() => { projectiles.splice(projectileIndex, 1); }, 0);
                } else {
                    // Remove from scene altogether
                    score += 250;
                    scoreEl.innerHTML = score;
                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
                
            }
        });
    });
    
}

addEventListener('touchstart', (event) => {

    const yDistance = event.clientY - canvas.height /2;
    const xDistance = event.clientX - canvas.width /2;
    const angle = Math.atan2(yDistance, xDistance);

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity));
    
});

addEventListener('click', (event) => {

    const yDistance = event.clientY - canvas.height /2;
    const xDistance = event.clientX - canvas.width /2;
    const angle = Math.atan2(yDistance, xDistance);

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity));
    
});

startGameBtn.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    modalEl.style.display = 'none';
});
