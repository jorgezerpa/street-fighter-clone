const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

const player = new Fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/samuraiMack/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157
  },
  sprites: {
    idle: {
      imageSrc: './img/samuraiMack/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: './img/samuraiMack/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/samuraiMack/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/samuraiMack/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/samuraiMack/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/samuraiMack/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50
    },
    width: 160,
    height: 50
  }
})

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167
  },
  sprites: {
    idle: {
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: './img/kenji/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50
    },
    width: 170,
    height: 50
  }
})

console.log(player)

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

decreaseTimer()

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  // player movement

  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  // jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // Enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  // jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false

    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    })
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  // this is where our player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false

    gsap.to('#playerHealth', {
      width: player.health + '%'
    })
  }

  // if player misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
  }
}

animate()

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.velocity.y = -20
        break
      case ' ':
        player.attack()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        enemy.velocity.y = -20
        break
      case 'ArrowDown':
        enemy.attack()

        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  }

  // enemy keys
  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})

















































// const canvas = document.querySelector('canvas');
// const c = canvas.getContext('2d');
// canvas.width = 1024;
// canvas.height = 500;
// c.fillRect(0,0,canvas.width, canvas.height);

// const gravity = 0.7;
// const keys = {
//     a: {
//         pressed: false,
//     },
//     d: {
//         pressed: false,
//     },
//     ArrowRight: {
//         pressed: false,
//     },
//     ArrowLeft: {
//         pressed: false,
//     },
// }

// let timer = 10;
// let timerId;


// class Sprite {
//     constructor({ position, velocity, color='red', offset }){
//         this.position = position;
//         this.velocity = velocity;
//         this.height = 150;
//         this.width = 50;
//         this.lastKey;
//         this.attackBox = {
//             position: {
//                 x: this.position.x,
//                 y: this.position.y,
//             },
//             offset,
//             width: 100,
//             height: 50,
//         }
//         this.color = color;
//         this.isAttacking = false;
//         this.health = 100;
//     }

//     draw(){
//         // character Box draw
//         c.fillStyle = this.color;
//         c.fillRect(this.position.x, this.position.y, this.width, this.height);
//         // attack Box draw 
//         if(this.isAttacking){
//             c.fillStyle = 'green';
//             c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
//         }
//     }

//     update(){
//         this.draw();
//         this.position.x += this.velocity.x;
//         this.position.y += this.velocity.y;
//         this.attackBox.position.x = this.position.x + this.attackBox.offset.x; 
//         this.attackBox.position.y = this.position.y; 

//         if(this.position.y + this.height + this.velocity.y >= canvas.height ){
//             this.velocity.y = 0;
//         } else {
//             this.velocity.y += gravity;  //acceleration
//         }
//     }

//     attack(){
//         this.isAttacking = true;
//         setTimeout(()=>{
//             this.isAttacking = false;
//         }, 100)
//     }
// }

// const player = new Sprite({ position:{x:0, y:0},  velocity: { x: 0, y:0 }, offset: { x: 0, y:0 }});
// const enemy = new Sprite({ position:{x:400, y:100},  velocity: { x: 0, y:0 }, color:'blue', offset: { x: -50, y:0} });


// function determineWinner({ player, enemy, timerId }){
//     clearTimeout(timerId);
//     document.querySelector('#displayText').style.display = 'Flex';
//     if(player.health === enemy.health){
//         document.querySelector('#displayText').innerHTML = 'Tie';
//     } else if(player.health > enemy.health){
//         document.querySelector('#displayText').innerHTML = 'Player 1 wins';
//     } else if(enemy.health > player.health){
//         document.querySelector('#displayText').innerHTML = 'Player 2 wins';
//     }
// }

// function rectangularCollision({rectangle1, rectangle2}){
//     return(
//         rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x
//         && rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width
//         && rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y
//         && rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
//     )
// }

// function decreaseTimer(){
//     if(timer>0){
//         timerId = setTimeout(decreaseTimer, 1000);
//         document.querySelector('#timer').innerHTML = timer;
//         timer--;
//     } 
//     if(timer===0){
//         determineWinner({ player, enemy, timerId });
//     }
// }
// decreaseTimer();

// function animate(){
//     c.fillStyle='black';
//     c.fillRect(0,0,canvas.width, canvas.height)
//     player.update();
//     enemy.update();
    
//     // player movement 
//     player.velocity.x = 0; //default velocity value;
//     if(keys.a.pressed && player.lastKey === "a" ){
//             player.velocity.x = -5;
//         } else if(keys.d.pressed && player.lastKey === "d"){
//             player.velocity.x = 5;
//         }
        
//     // enemy movement 
//     enemy.velocity.x = 0; //default velocity value;
//     if(keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft" ){
//         enemy.velocity.x = -5;
//     } else if(keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight"){
//         enemy.velocity.x = 5;
//     }

//     // detect collision player 
//     if(rectangularCollision({rectangle1: player, rectangle2: enemy}) && player.isAttacking){
//         player.isAttacking = false;
//         enemy.health-=20;
//         document.querySelector('#enemyHealth').style.width = enemy.health+'%';
//     } 
//     // detect collision enemy 
//     if(rectangularCollision({rectangle1: enemy, rectangle2: player}) && enemy.isAttacking){
//         enemy.isAttacking = false;
//         player.health-=20;
//         document.querySelector('#playerHealth').style.width = player.health+'%';
//     } 


//     // endgame base on health 
//     if(player.health<=0 || enemy.health<=0){
//         determineWinner({player, enemy, timerId});
//     }


//     window.requestAnimationFrame(animate)
// }
// animate();


// window.addEventListener('keydown', (event)=>{
//     switch(event.key){
//         // player keys 
//         case 'd':
//             keys.d.pressed = true;
//             player.lastKey = 'd';
//             break;
//         case 'a':
//             keys.a.pressed = true;
//             player.lastKey = 'a';
//         break;
//         case 'w':
//             player.velocity.y = -15;
//         break;
//         case ' ': 
//             player.attack()
//         break;

//         // enemy keys 
//         case 'ArrowRight':
//             keys.ArrowRight.pressed = true;
//             enemy.lastKey = 'ArrowRight';
//             break;
//         case 'ArrowLeft':
//             keys.ArrowLeft.pressed = true;
//             enemy.lastKey = 'ArrowLeft';
//             break;
//         case 'ArrowUp':
//             enemy.velocity.y = -15;
//         break;
//         case 'ArrowDown':
//             enemy.attack()
//         break;
//     }
// })

// window.addEventListener('keyup', (event)=>{
//     switch(event.key){
//         // player keys 
//         case 'd':
//             keys.d.pressed = false;
//         break;
//         case 'a':
//             keys.a.pressed = false;
//         break;
//         //enemy keys
//         case 'ArrowRight':
//             keys.ArrowRight.pressed = false;
//         break;
//         case 'ArrowLeft':
//             keys.ArrowLeft.pressed = false;
//         break;
//     }
// })