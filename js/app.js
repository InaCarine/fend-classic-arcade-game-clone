'use strict';

/*
* @description Represents an enemy
* @constructor
*/
var Enemy = function() {
    this.sprite = 'images/enemy-bug.png';
    this.x = Math.floor(Math.random() * (-500 + 105)) - 105;
    this.y = 60;
    this.speed = Math.floor(Math.random() * (350 - 200)) + 200;
    this.collided = 0;
};

/*
* @description updates the enemy's position
* @param {num} dt - dt, a time delta between ticks
*/
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += Math.floor(this.speed * dt);

    // If the enemy is leaving the canvas, reset pos
    if (this.x > ctx.canvas.width) {
        this.x = -101;
        this.speed = Math.floor(Math.random() * (500 - 200)) + 200;
    }
};

/*
* @description Draws the enemy on the canvas
*/
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    //ctx.strokeRect(this.x, this.y+75, 101, 70);
};



/*
* @description Represents a Player
* @constructor
*/
const Player = function() {
    this.sprite = 'images/char-horn-girl.png';
    this.height = 85;
    this.width = 101;

    this.startPos = [
        (ctx.canvas.width / 2) - (this.width / 2), ctx.canvas.height - (136 + this.height)
    ];

    this.x = this.startPos[0];
    this.y = 800;
    this.collided = 0;
};

/*
* @description updates the player's position
*/
Player.prototype.update = function () {
    // if player reaches the water the game is won
    if(this.y < 60 && !this.collided) {
        setTimeout(() => {
            game.paused = 1;
            game.status = 'won';
            canvas.addEventListener("mousemove", checkPos);
            canvas.addEventListener("mouseup", checkClick);
        }, 500);
    }
};

/*
* @description Draws the player on the canvas
*/
Player.prototype.render = function () {
    typeof game.charSelected === 'object' ? this.sprite = game.charSelected.sprite : this.sprite;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    //ctx.strokeRect(this.x+15, this.y + 60, 70, 80);
};

/*
* @description handles keyboard input to move the player
* @param {string} direction
*/
Player.prototype.handleInput = function (direction) {
    if(this.collided || game.paused) return;

    if(direction === 'up' && this.y > this.height) {
        this.y -= this.height;
    } else if(direction === 'down' && this.y < ctx.canvas.height - 136 - this.height) {
        this.y += this.height;
    } else if(direction === 'right' && this.x < ctx.canvas.width - this.width) {
        this.x += this.width;
    } else if(direction === 'left' && this.x >= this.width) {
        this.x -= this.width;
    }    
};



/*
* @description Represents a Timer
* @constructor
*/
const Timer = function() {
    this.startTime;
    this.endTime;
    this.startTimer;
    this.minutes = 0;
    this.seconds = 0;
};

/*
* @description Draws the timer on the canvas
*/
Timer.prototype.render = function() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Time: ${this.minutes}:${this.seconds}`, ctx.canvas.width-90, 80);
};

  /*
  * @description updates the timer in minutes:seconds
  * @credit https://stackoverflow.com/questions/1210701/compute-elapsed-time
  */
Timer.prototype.update = function() {
    if(game.paused) return;
    this.endTime = new Date();
    let timeDiff = this.endTime - this.startTime;
    // strip the ms
    timeDiff /= 1000;

    this.seconds = Math.round(timeDiff % 60);

    // remove seconds from the date
    timeDiff = Math.floor(timeDiff / 60);

    this.minutes = Math.round(timeDiff % 60);
};




/*
* @description Represents a gem that increses the score
* @constructor
*/
const Gem = function() {
    this.randomNum = Math.floor(Math.random()*100);

    if (this.randomNum >= 50 && this.randomNum < 80) {
        this.sprite = 'green'
        this.value = 10;
    } else if (this.randomNum >= 80) {
        this.sprite = 'orange'
        this.value = 20;
    } else {
        this.sprite = 'blue'
        this.value = 5;
    }

    this.cordsX = [28, 130, 232, 334, 436];
    this.cordsY = [210, 295, 376];

    this.x = this.cordsX[Math.floor(Math.random()*this.cordsX.length)];
    this.y = this.cordsY[Math.floor(Math.random() * this.cordsY.length)];
};

/*
* @description Renders the gem on the screen
*/
Gem.prototype.render = function() {    
    ctx.drawImage(Resources.get(`images/gem-${this.sprite}.png`), this.x, this.y, 40, 68);
};


/*
* @description Represents the game
* @constructor
*/
const Game = function() {
    this.timer = new Timer();
    this.allEnemies = [];
    this.numEnemies = 4;
    this.status = 'start';
    this.paused = 1;
    this.score = 0;
    this.life = 3;

    this.charPosY = 175;
    this.chars = [
        {sprite: `images/char-horn-girl.png`, posX: 90},
        {sprite: `images/char-cat-girl.png`, posX: 200},
        {sprite: `images/char-pink-girl.png`, posX: 310},
    ]
    this.charSelected = this.chars[0];

    this.gem = new Gem();
};

/*
* @description adds enemies to the game
* and making sure there's one in each row at start.
*/
Game.prototype.addEnemies = function() {
    let posY = 60;
    for (let i = 1; i <= this.numEnemies; i++) {
        let enemy = new Enemy();
        enemy.y = posY;
        this.allEnemies.push(enemy);
        posY += 85;
    }
    posY = 60;
};


/*
* @description checks if an enemy and the player collides
*/
Game.prototype.checkCollisions = function() {
    this.allEnemies.forEach(enemy => {
        const posX = enemy.x - 85 <= player.x && enemy.x + 90 >= player.x;
        const posY = enemy.y - 80 <= player.y && enemy.y + 65 >= player.y;

        if (posY && posX && !enemy.collided) {
            player.collided = 1;
            enemy.collided = 1;
            setTimeout(() => {
                player.x = player.startPos[0];
                player.y = player.startPos[1];
                player.collided = 0;
                enemy.collided = 0;
            }, 300);
            this.score -= 5;
            this.life--;
            if(this.life === 0) {
                game.paused = 1;
                game.status = 'over';
                canvas.addEventListener("mousemove", checkPos);
                canvas.addEventListener("mouseup", checkClick);
            }
        }
    });
    
    if(player.x > this.gem.x-35 && player.x < this.gem.x+35 &&
        player.y > this.gem.y-82 && player.y < this.gem.y
    ){
        this.score += this.gem.value;  
        this.gem = new Gem('blue');
    }
}

/*
* @description renders the different menus on the screen
*/
Game.prototype.renderMenus = function() {
    let sprite = `images/menu-${this.status}.png`;
    ctx.drawImage(Resources.get(sprite), 5, 101);

    if(this.status === 'won') {
        ctx.font = "30px Arial";
        ctx.fillStyle = "#555";
        ctx.fillText(`Time: ${this.timer.minutes}:${this.timer.seconds}`, 276, 322);

        ctx.fillText(`Score: ${this.score}`, 90, 322);
    } else if(this.status === 'start') {

        let selector = `images/Selector.png`;
        ctx.drawImage(Resources.get(selector), this.charSelected.posX, this.charPosY);

        this.chars.forEach(char => {
            ctx.drawImage(Resources.get(char.sprite), char.posX, this.charPosY);
        });
    }
}

/*
* @description renders the score on the screen
*/
Game.prototype.scoreLifeRender = function() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Score: ${this.score}`, ctx.canvas.width/2-30, 80);

    let lifeX = 12;
    for(let i = 1; i <= this.life; i++) {
        ctx.drawImage(Resources.get('images/Heart.png'), lifeX, 51, 27,46);
        lifeX +=25;
    }
};

/*
* @description renders all the different elements for the game
*/
Game.prototype.render = function() {

    if (!this.paused) {
        this.timer.render();
        this.scoreLifeRender();
        this.gem.render();
    }

    this.allEnemies.forEach(function (enemy) {
        enemy.render();
    });

    player.render();

    if (this.paused) this.renderMenus();
};

/*
* @description updates all the different elements in the game
*/
Game.prototype.update = function(dt) {
    if (!this.paused) {
        this.allEnemies.forEach(function (enemy) {
            enemy.update(dt);
        });
        this.checkCollisions();
        player.update();
        this.timer.update();
    }

    if (this.status === 'start') {
        let selector = `images/Selector.png`;
        ctx.drawImage(Resources.get(selector), this.charSelected.posX, this.charPosY);
    }
}

/*
* @description resets the game
*/
Game.prototype.reset = function() {
    canvas.removeEventListener("mousemove", checkPos);
    canvas.removeEventListener("mouseup", checkClick);
    
    player.x = player.startPos[0];
    player.y = player.startPos[1];
    
    this.allEnemies = [];
    this.addEnemies();
    this.score = 0;
    this.life = 3;
    
    this.paused = 0;
    this.timer.startTime = new Date();
}

/*
* @description Starts the game
*/
Game.prototype.start = function() {
    canvas.removeEventListener("mousemove", checkPos);
    canvas.removeEventListener("mouseup", checkClick);
    this.paused = 0;
    player.x = player.startPos[0];
    player.y = player.startPos[1];
    this.timer.startTime = new Date()
};



// https://code.tutsplus.com/tutorials/animating-game-menus-and-screen-transitions-in-html5-a-guide-for-flash-developers--active-11183
function checkPos(mouseEvent) {
    mouseX = mouseEvent.pageX - this.offsetLeft;
    mouseY = mouseEvent.pageY - this.offsetTop;
}

function checkClick(mouseEvent) {
    if (mouseX > 138 && mouseX < 368) {
        if (mouseY > 368 && mouseY < 412) {            
            if(game.status === 'won' || game.status === 'over'){
                game.reset();
            } else if(game.status === 'start') {
                game.start();
            }
        }
    }
    
    if(game.status === 'start') {        
        game.chars.forEach(char => {
            if (mouseX > char.posX && mouseX < char.posX + 101) {
                if (mouseY > 220 && mouseY < 220 + 101) {
                    game.charSelected = char;                    
                }
            }
        });
    }
}


const game = new Game();
const player = new Player();

game.addEnemies();

let mouseX;
let mouseY;

canvas.addEventListener("mousemove", checkPos);
canvas.addEventListener("mouseup", checkClick);



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    
    player.handleInput(allowedKeys[e.keyCode]);
});
