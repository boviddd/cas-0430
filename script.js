const canvas = document.getElementById('gameCanvas');
const canvas2 = document.getElementById('hpbarCanvas');
const overlay = document.getElementById('overlay');
canvas.style.backgroundColor = 'rgb(40, 40, 60)';
const ctx = canvas.getContext('2d');
const ctx2 = canvas2.getContext('2d');
let counter = 0;
let enemies = []
let obstacles = []
let projectiles = []
let particles = []
let consumables = []
let bits = []
let rooms = []
let aggressiveEnemies = [];
let passiveEnemies = [];
let id = 0;
const frictionMultiplier = 0.9
const accelMultiplier = 0.2
let respawning = false;
// Add event listener for mousemove event
document.addEventListener('mousemove', handleMouseMove);
const enemyStatsDiv = document.getElementById('enemyStats');
// Function to handle mousemove event


let timeout = '';
function handleMouseMove(event) {
  const canvasRect = canvas.getBoundingClientRect();
  const scrollX = window.scrollX || document.documentElement.scrollLeft;
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const adjustedX = event.pageX -
    canvasRect.left - scrollX;
  const adjustedY = event.pageY - canvasRect.top - scrollY;

  const isMouseOverEnemy = checkIfMouseOverEnemy(adjustedX, adjustedY);

  const isMouseOverConsumable = checkIfMouseOverConsumable(adjustedX, adjustedY);

  const isMouseOverBit = checkIfMouseOverBit(adjustedX, adjustedY);

  const isMouseOverShopItem = checkIfMouseOverShopItem(adjustedX, adjustedY);
  if (isMouseOverEnemy) {
    clearTimeout(timeout);
    const enemy = checkIfMouseOverEnemy(adjustedX, adjustedY);
    if (enemy) {
      const speed = enemy.speed * 10;
      const attack = enemy.attack;
      const health = enemy.health;
      const maxhealth = enemy.maxhealth;
      const movestyle = enemy.movestyle;
      const speedString = speed.toString();
      const speedParts = speedString.split('.');
      let formattedSpeed;
      if (speedParts.length == 1) {
        formattedSpeed = speedParts;
      }
      else if (speedParts[1].length > 1) {
        formattedSpeed = speedParts[0] + '.' + speedParts[1].slice(0, 1);
      } else {
        formattedSpeed = speedParts[0] + '.' + speedParts[1];
      }

      enemyStatsDiv.innerHTML = `<b>Enemy</b><br>Hp: ${health}/${maxhealth}<br>Spd: ${formattedSpeed}<br>Atk: ${attack}<br> Movement: <br>${movestyle.charAt(0).toUpperCase() + movestyle.slice(1)}`;

      timeout = setTimeout(function() {
        enemyStatsDiv.innerHTML = '<span class="hoverToSee"><p><b>Hover over objects to see info</b></p></span>';
      }, 2000);
    }
  }

    else if (isMouseOverShopItem) {
      clearTimeout(timeout);
      const shopitem = checkIfMouseOverShopItem(adjustedX, adjustedY);
      if (shopitem) {
        const type = shopitem.type;
          enemyStatsDiv.innerHTML = `<b>Shop</b><br>Temporary Text`

        timeout = setTimeout(function() {
          enemyStatsDiv.innerHTML = '<span class="hoverToSee"><p><b>Hover over objects to see info</b></p></span>';
        }, 2000);
      }
    }

  else if (isMouseOverConsumable) {
    clearTimeout(timeout);
    const consumable = checkIfMouseOverConsumable(adjustedX, adjustedY);
    if (consumable) {
      const type = consumable.type;
      if (type == 1) {
        enemyStatsDiv.innerHTML = `<b>Consumable</b><br>Type: Healing`
      }
      else if (type == 2) {
        enemyStatsDiv.innerHTML = `<b>Consumable</b><br>Type: Speed`
      }

      timeout = setTimeout(function() {
        enemyStatsDiv.innerHTML = '<span class="hoverToSee"><p><b>Hover over objects to see info</b></p></span>';
      }, 2000);
    }
  }

  else if (isMouseOverBit) {
    clearTimeout(timeout);
    const bit = checkIfMouseOverBit(adjustedX, adjustedY);
    if (bit) {
      const value = bit.value;
       enemyStatsDiv.innerHTML = `<b>Bit</b><br>Value: ${value}`

      timeout = setTimeout(function() {
        enemyStatsDiv.innerHTML = '<span class="hoverToSee"><p><b>Hover over objects to see info</b></p></span>';
      }, 2000);
    }
  }

  // Function to check if mouse is over an enemy
  function checkIfMouseOverEnemy(x, y) {
    for (let i = 0; i < enemies.length; i++) {
      if (
        x >= enemies[i].x - 20 &&
        x <= enemies[i].x + enemies[i].size + 20 &&
        y >= enemies[i].y - 20 &&
        y <= enemies[i].y + enemies[i].size + 20
      ) {
        return enemies[i];
      }
    }
    return null;
  }

  function checkIfMouseOverConsumable(x, y) {
    let room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
    for (let i = 0; i < room.consumables.length; i++) {
      if (
        x >= room.consumables[i].x - 20 &&
        x <= room.consumables[i].x + room.consumables[i].size + 20 &&
        y >= room.consumables[i].y - 20 &&
        y <= room.consumables[i].y + room.consumables[i].size + 20
      ) {
        return room.consumables[i];
      }
    }
    return null;
  }

  function checkIfMouseOverBit(x, y) {
    let room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
    for (let i = 0; i < room.bits.length; i++) {
      if (
        x >= room.bits[i].x - 20 &&
        x <= room.bits[i].x + room.bits[i].size + 20 &&
        y >= room.bits[i].y - 20 &&
        y <= room.bits[i].y + room.bits[i].size + 20
      ) {
        return room.bits[i];
      }
    }
    return null;
  }

  function checkIfMouseOverShopItem(x, y) {
    let room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
    for (let i = 0; i < room.shopitems.length; i++) {
      if (
        x >= room.shopitems[i].x - 20 &&
        x <= room.shopitems[i].x + room.shopitems[i].size + 20 &&
        y >= room.shopitems[i].y - 20 &&
        y <= room.shopitems[i].y + room.shopitems[i].size + 20
      ) {
        return room.shopitems[i];
      }
    }
    return null;
  }
}



  function updateOverlay(roomx, roomy, roomtype, bits) {
    overlay.innerHTML =
      `<b>X: ${roomx}<br>
  Y: ${roomy}<br>
  <span class="type">Type: ${roomtype}</span><br>
  <span class="bits">Bits: ${bits}</span></b>`;
  }


  function updateOverlayPosition() {
    const canvasRect = canvas.getBoundingClientRect();
    overlay.style.top = `0px`;
    overlay.style.left = `${canvasRect.left}px`;
  }

  function updateEnemyStatsDivPosition() {
    const canvasRect = canvas.getBoundingClientRect();
    enemyStatsDiv.style.top = `${canvasRect.top}px`;
    enemyStatsDiv.style.left = `${canvasRect.right}px`;
  }




  const player = {
    basespeed: 3,
    baseboostedspeed: 5,
    level: 0,
    roomx: 0,
    roomy: 0,
    x: 380,
    y: 280,
    dx: 0,
    dy: 0,
    movingX: 0,
    movingY: 0,
    xvelocity: 0,
    yvelocity: 0,
    currentspeed: 0,
    size: 40,
    r: 80,
    g: 80,
    b: 255,
    color: 'rgba(80, 80, 255, 1)',
    originalColor: 'rgba(80, 80, 255, 1)',
    health: 10,
    maxHealth: 10,
    stamina: 100,
    attack: 5,
    bits: 0,
    keepPercentageOfBitsUponDeath: 10,
    projectileDamage: 1,
    cooldownTime: 400,
    lastShotTime: 0,
    roomsEntered: 0,
    roomsEnteredThisSession: 0,
    draw() {
      ctx.save();
      ctx.shadowBlur = 40;
      ctx.shadowColor = this.color;

      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.size, player.size);

      ctx.restore();

      ctx.save();
      ctx.shadowBlur = 50;
      ctx.shadowColor = `rgba(120, 255, 255, 0.4)`;

      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.size, player.size);

      ctx.restore();

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    },
    shootProjectile(event) {
      const currentTime = Date.now();
      if (currentTime - this.lastShotTime < this.cooldownTime) {
        return;
      }
      this.lastShotTime = currentTime;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const angle = Math.atan2(mouseY - this.y - 0.5 * this.size, mouseX - this.x - 0.5 * this.size);
      const speed = 7;

      const projectile = {
        x: this.x + 0.5 * this.size,
        y: this.y + 0.5 * this.size,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: 10,
        color: 'rgba(200, 200, 255, 1)',

        update() {
          let room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
          if (player.health <= 0) return;
          this.x += this.dx;
          this.y += this.dy;

          if (
            this.x < 0 ||
            this.x > room.width - this.size ||
            this.y < 0 ||
            this.y > room.height - this.size
          ) {
            const index = projectiles.indexOf(this);
            if (index != -1) {
              projectiles.splice(index, 1);
              for (let i = 0; i < 8; i++) {
                spawnParticle(Date.now(), projectile.x + projectile.size / 2, projectile.y + projectile.size / 2, Math.random() * 20 - 10, Math.random() * 20 - 10, 4, 'rgba(200, 200, 255, 0.6)', Math.random() * 200 + 100);
              }
            }
          }
          for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];

            if (
              projectile.x < obstacle.x + obstacle.width &&
              projectile.x + projectile.size > obstacle.x &&
              projectile.y < obstacle.y + obstacle.height &&
              projectile.y + projectile.size > obstacle.y
            ) {
              const index = projectiles.indexOf(projectile);
              if (index !== -1) {
                projectiles.splice(index, 1);
                for (let i = 0; i < 8; i++) {
                  spawnParticle(Date.now(), projectile.x, projectile.y, Math.random() * 20 - 10, Math.random() * 20 - 10, 4, 'rgba(200, 200, 255, 0.6)', Math.random() * 200 + 100);
                }
              }
            }
          }
          for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (
              projectile.x < enemy.x + enemy.size &&
              projectile.x + projectile.size > enemy.x &&
              projectile.y < enemy.y + enemy.size &&
              projectile.y + projectile.size > enemy.y
            ) {
              const index = projectiles.indexOf(projectile);
              if (index !== -1) {
                projectiles.splice(index, 1);
                for (let i = 0; i < 8; i++) {
                  spawnParticle(Date.now(), projectile.x + projectile.size / 2, projectile.y + projectile.size / 2, Math.random() * 20 - 10, Math.random() * 20 - 10, 4, 'rgba(200, 200, 255, 0.6)', Math.random() * 200 + 100);
                }

              }
              takeDamage(enemy, player.projectileDamage);
            }
          }
        },

        draw() {
          if (player.health <= 0) return;
          ctx.shadowBlur = 20;
          ctx.shadowColor = this.color;
          ctx.fillStyle = this.color;
          ctx.fillRect(this.x, this.y, this.size, this.size);
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        }
      };

      projectiles.push(projectile);
    }
  };

  function findRoomByCoordinates(rooms, x, y) {
    for (const room of rooms) {
      if (room.x === x && room.y === y) {
        return room;
      }
    }
    return null; // not found
  }
  class Consumable {
    constructor(x, y, size, color, type) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.color = color;
      this.type = type;
    }
    draw() {
      ctx.shadowBlur = 40;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }
  }


  class Obstacle {
    constructor(x, y, width, height, color, borderColor) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.borderColor = borderColor;
      this.borderWidth = 4;
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);


      const rightObstacle = obstacles.find(
        obstacle =>
          obstacle !== this &&
          obstacle.y === this.y &&
          obstacle.x === this.x + this.width
      );


      const bottomObstacle = obstacles.find(
        obstacle =>
          obstacle !== this &&
          obstacle.x === this.x &&
          obstacle.y === this.y + this.height
      );


      const leftObstacle = obstacles.find(
        obstacle =>
          obstacle !== this &&
          obstacle.y === this.y &&
          obstacle.x === this.x - obstacle.width
      );


      const topObstacle = obstacles.find(
        obstacle =>
          obstacle !== this &&
          obstacle.x === this.x &&
          obstacle.y === this.y - obstacle.height
      );

      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = this.borderWidth;


      if (!topObstacle) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.borderWidth / 2);
        ctx.lineTo(this.x + this.width, this.y + this.borderWidth / 2);
        ctx.stroke();
      }


      if (!rightObstacle) {
        ctx.beginPath();
        ctx.moveTo(this.x + this.width - this.borderWidth / 2, this.y);
        ctx.lineTo(this.x + this.width - this.borderWidth / 2, this.y + this.height);
        ctx.stroke();
      }


      if (!bottomObstacle) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height - this.borderWidth / 2);
        ctx.lineTo(this.x + this.width, this.y + this.height - this.borderWidth / 2);
        ctx.stroke();
      }


      if (!leftObstacle) {
        ctx.beginPath();
        ctx.moveTo(this.x + this.borderWidth / 2, this.y);
        ctx.lineTo(this.x + this.borderWidth / 2, this.y + this.height);
        ctx.stroke();
      }
    }
  }

  class Bit {
    constructor(x, y, xvelocity, yvelocity, value, id, copied) {
      this.x = x;
      this.y = y;
      this.xvelocity = xvelocity;
      this.yvelocity = yvelocity;
      this.value = value;
      this.size = Math.min(40, 10 + 2 * this.value);
      this.color = 'rgb(240, 200, 120)';
      this.r = 240;
      this.g = 200;
      this.b = 120;
      this.id = id;
      this.copied = copied;
    }
    draw() {
      ctx.shadowBlur = 20;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }
    moveTowardsPlayer() {
      let dx = (player.x + player.size / 2) - (this.x + this.size / 2);
      let dy = (player.y + player.size / 2) - (this.y + this.size / 2);

      const distance = Math.sqrt(dx ** 2 + dy ** 2);

      if (distance < 200) {
        const speedMultiplier = Math.min(2, 160 / distance);
        this.xvelocity = dx / distance * speedMultiplier;
        this.yvelocity = dy / distance * speedMultiplier;
      } else {
        this.xvelocity *= 0.9;
        this.yvelocity *= 0.9;
      }

      if (Math.abs(this.xvelocity) < 0.01) {
        this.xvelocity = 0;
      }
      if (Math.abs(this.yvelocity) < 0.01) {
        this.yvelocity = 0;
      }

      this.x += this.xvelocity;
      this.y += this.yvelocity;
      let room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
      let k = room.bits.findIndex(bit => bit.id === this.id)
      if (k == -1) return;
      room.bits[k].x = this.x;
      room.bits[k].y = this.y;
    }
    checkPlayerCollision() {
      const playerLeft = player.x;
      const playerRight = player.x + player.size;
      const playerTop = player.y;
      const playerBottom = player.y + player.size;

      for (let i = bits.length - 1; i >= 0; i--) {
        const bit = bits[i];

        const bitLeft = bit.x;
        const bitRight = bit.x + bit.size;
        const bitTop = bit.y;
        const bitBottom = bit.y + bit.size;

        if (
          bitRight > playerLeft &&
          bitLeft < playerRight &&
          bitBottom > playerTop &&
          bitTop < playerBottom
        ) {
          player.bits += bit.value;
          for (let j = 0; j < 4; j++) {
            spawnParticle(
              Date.now(),
              bit.x + bit.size / 2,
              bit.y + bit.size / 2,
              Math.random() * 20 - 10,
              Math.random() * 20 - 10,
              Math.max(4, bit.size * 0.1),
              `rgba(${bit.r}, ${bit.g}, ${bit.b}, 0.6)`,
              Math.random() * 200 + 100
            );
          }
          bits.splice(i, 1);

          const room = findRoomByCoordinates(rooms, player.roomx, player.roomy);
          const bitIndex = room.bits.findIndex((roomBit) => roomBit.id === bit.id);
          if (bitIndex !== -1) {
            room.bits.splice(bitIndex, 1);
          }
        }
      }
    }
  }
  function spawnBit(x, y, xvelocity, yvelocity, value, id, copied) {
    const room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
    const newBit = new Bit(x, y, xvelocity, yvelocity, value, id, copied);
    bits.push(newBit);
    if (!copied) room.bits.push(newBit);
    return newBit;
  }

  class Room {
    constructor(x, y, width, height, obstacleCount, enemyCount, consumableCount, bitsCount, bigBitsCount, topEntrances, bottomEntrances, leftEntrances, rightEntrances, roomType) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.obstacleCount = obstacleCount;
      this.enemyCount = enemyCount;
      this.consumableCount = consumableCount;
      this.bitsCount = bitsCount;
      this.bigBitsCount = bigBitsCount;
      this.topEntrances = topEntrances;
      this.bottomEntrances = bottomEntrances;
      this.leftEntrances = leftEntrances;
      this.rightEntrances = rightEntrances;
      this.roomType = roomType;
      this.visited = false;
      this.obstacles = [];
      this.consumables = [];
      this.bits = [];
      this.shopitems = [];
    }
    init(canvas) {
      const newRoom = new Room(0, 0, canvas.width, canvas.height, 3, 0, 1, 0, 0, 1, 1, 1, 1, 'Spawn')
      rooms.push(newRoom);
      player.roomsEntered++;
      player.roomsEnteredThisSession++;
      newRoom.enterRoom(0, 0)


    }
    enterRoom(x, y) { //initialize entered room'
      let currentRoom = findRoomByCoordinates(rooms, x, y)
      let roomAbove = findRoomByCoordinates(rooms, x, y - 1);
      let roomBelow = findRoomByCoordinates(rooms, x, y + 1);
      let roomLeft = findRoomByCoordinates(rooms, x - 1, y);
      let roomRight = findRoomByCoordinates(rooms, x + 1, y)
      if (!roomAbove && currentRoom?.topEntrances == 1) {
        this.spawnRoom(x, y - 1, 'bottom')
      }
      if (!roomBelow && currentRoom?.bottomEntrances == 1) {
        this.spawnRoom(x, y + 1, 'top')
      }
      if (!roomLeft && currentRoom?.leftEntrances == 1) {
        this.spawnRoom(x - 1, y, 'right')
      }
      if (!roomRight && currentRoom?.rightEntrances == 1) {
        this.spawnRoom(x + 1, y, 'left')
      }

      if (x != 0 || y != 0) {
        document.getElementById('tutorial').innerHTML = ''
      }
      const room = findRoomByCoordinates(rooms, x, y);
      if (!room) {
        return;
      }
      obstacles.splice(0, obstacles.length);
      consumables.splice(0, consumables.length);
      bits.splice(0, bits.length)
      passiveEnemies.splice(0, passiveEnemies.length)

      if (!room.visited) {
        if (room.topEntrances == 1) {
          spawnWallTop([[440, 560]], room.width, room.height);
        } else {
          spawnWallTop([], room.width, room.height)
        }
        if (room.bottomEntrances == 1) {
          spawnWallBottom([[440, 560]], room.width, room.height);
        } else {
          spawnWallBottom([], room.width, room.height)
        }
        if (room.leftEntrances == 1) {
          spawnWallLeft([[240, 360]], room.width, room.height);
        } else {
          spawnWallLeft([], room.width, room.height)
        }
        if (room.rightEntrances == 1) {
          spawnWallRight([[240, 360]], room.width, room.height);
        } else {
          spawnWallRight([[]], room.width, room.height);
        }
        for (let i = 0; i < room.obstacleCount; i++) {
          spawnObstacle(
            Math.floor(Math.random() * (Math.max(0, room.width - 280) / 40)) * 40 + 160,
            Math.floor(Math.random() * (Math.max(0, room.height - 280) / 40)) * 40 + 160,
            Math.floor(Math.random() * 2 + 1) * 40,
            Math.floor(Math.random() * 2 + 1) * 40,
            'rgb(80, 80, 100)',
            'rgb(20, 20, 40)')
        }
        for (let i = 0; i < room.enemyCount; i++) {
          spawnEnemy(player.x, player.y)
        }
        for (let i = 0; i < room.consumableCount; i++) {
          let tempVar = 0;
          if (Math.random() < 0.8) tempVar = 1;
          else tempVar = 2;
          spawnConsumable(
            40 + Math.random() * (room.width - 80),
            40 + Math.random() * (room.height - 80),
            tempVar
          )
        }
        for (let i = 0; i < obstacles.length; i++) {
          const obstacle = obstacles[i];
          room.obstacles.push(obstacle);
        }
        for (let i = 0; i < room.bitsCount; i++) {
          spawnBit(
            40 + Math.random() * (room.width - 80),
            40 + Math.random() * (room.height - 80),
            0,
            0,
            Math.floor(Math.random() * 2 + 1),
            bits.length,
            false)
        }
        for (let i = 0; i < room.bigBitsCount; i++) {
          spawnBit(
            40 + Math.random() * (room.width - 80),
            40 + Math.random() * (room.height - 80),
            0,
            0,
            Math.floor(Math.random() * 5 + 5),
            bits.length,
            false)
        }
        room.visited = true;
      } else {
        repositionObstacles(room);
        repositionConsumables(room);
        repositionBits(room);
      }
    }
    initializeShop(x, y) {
      if (findRoomByCoordinates(rooms, x, y).roomType !== "Shop") return;

    }



    static findRoomsAbove(rooms) { //find places where a room can be placed above
      const validRoomsAbove = [];
      if (rooms.length === 0) {
        return validRoomsAbove;
      }
      for (const room of rooms) {
        const roomAbove = rooms.find(r => r.x === room.x && r.y === room.y - 1);
        const hasEntranceAbove = rooms.find(r => r.topEntrances === 1)

        if (!roomAbove && hasEntranceAbove) {
          validRoomsAbove.push(room);
        }
      }

      return validRoomsAbove;
    }

    static findRoomsBelow(rooms) {
      const validRoomsBelow = [];
      if (rooms.length == 0) {
        return validRoomsBelow;
      }
      for (const room of rooms) {
        const roomBelow = rooms.find(r => r.x === room.x && r.y === room.y + 1);
        const hasEntranceBelow = rooms.find(r => r.bottomEntrances === 1)

        if (!roomBelow && hasEntranceBelow) {
          validRoomsBelow.push(room);
        }
      }

      return validRoomsBelow;
    }

    static findRoomsLeft(rooms) {
      const validRoomsLeft = [];
      if (rooms.length == 0) {
        return validRoomsLeft;
      }

      for (const room of rooms) {
        const roomLeft = rooms.find(r => r.x === room.x - 1 && r.y === room.y);
        const hasEntranceLeft = rooms.find(r => r.leftEntrances === 1)

        if (!roomLeft && hasEntranceLeft) {
          validRoomsLeft.push(room);
        }
      }

      return validRoomsLeft;
    }

    static findRoomsRight(rooms) {
      const validRoomsRight = [];
      if (rooms.length == 0) {
        return validRoomsRight;
      }

      for (const room of rooms) {
        const roomRight = rooms.find(r => r.x === room.x + 1 && r.y === room.y);
        const hasEntranceRight = rooms.find(r => r.rightEntrances == 1)

        if (!roomRight && hasEntranceRight) {
          validRoomsRight.push(room);
        }
      }

      return validRoomsRight;
    }


    spawnRoom(xToSpawnAt, yToSpawnAt, enterDirection) {
      let rng = Math.floor(Math.random() * 4 + 1);
      rng += counter;
      rng %= 4
      let roomTypeRng = Math.floor(Math.random() * 100 + 1); //1 to 100
      let roomType;
      let obstacleCount = Math.floor(Math.random() * 3 + 1);
      let enemyCount = Math.floor(Math.random() * 4 + 1);
      let consumableCount = Math.min(2, Math.round(Math.random() - 0.3 + enemyCount * 0.1));
      let bitsCount = Math.min(2, Math.round(Math.random() - 0.3 + enemyCount * 0.1));
      let bigBitsCount = 0;
      let topEntrances = Math.round(Math.random());
      let bottomEntrances = Math.round(Math.random());
      let leftEntrances = Math.round(Math.random());
      let rightEntrances = Math.round(Math.random());
      let width = 1000;
      let height = 600;
      if (player.roomsEnteredThisSession == 1) {

        enemyCount = 1;
        roomType = 'Combat';
        consumableCount = 1;
      }
      else if (roomTypeRng <= 82) {
        roomType = 'Combat';
      } else if (roomTypeRng <= 94) {
        roomType = 'Shop';
        obstacleCount = 0;
        enemyCount = 0;
      } else {
        roomType = 'Treasure';
        enemyCount = 0;
        bitsCount = Math.floor(Math.random() * 5 + 3)
        bigBitsCount = Math.floor(Math.random() * 3 + 2)
        consumableCount = Math.floor(Math.random() * 2 + 1)
      }
      if ((xToSpawnAt || xToSpawnAt == 0) && (yToSpawnAt || yToSpawnAt == 0) && enterDirection) {
        let roomAbove = findRoomByCoordinates(rooms, xToSpawnAt, yToSpawnAt - 1);
        let roomBelow = findRoomByCoordinates(rooms, xToSpawnAt, yToSpawnAt + 1);
        let roomLeft = findRoomByCoordinates(rooms, xToSpawnAt - 1, yToSpawnAt);
        let roomRight = findRoomByCoordinates(rooms, xToSpawnAt + 1, yToSpawnAt)

        if (enterDirection.trim() == 'top' || roomAbove?.bottomEntrances == 1) {
          topEntrances = 1;
        } else if (enterDirection.trim() == 'bottom' || roomBelow?.topEntrances == 1) {
          bottomEntrances = 1;
        } else if (enterDirection.trim() == 'left' || roomLeft?.rightEntrances == 1) {
          leftEntrances = 1;
        } else if (enterDirection.trim() == 'right' || roomRight?.leftEntrances == 1) {
          rightEntrances = 1;
        }

        if (roomAbove?.bottomEntrances == 0) {
          topEntrances = 0;
        } if (roomBelow?.topEntrances == 0) {
          bottomEntrances = 0;
        } if (roomLeft?.rightEntrances == 0) {
          leftEntrances = 0;
        } if (roomRight?.leftEntrances == 0) {
          rightEntrances = 0;
        }

        const newRoom = new Room(xToSpawnAt, yToSpawnAt, width, height, obstacleCount, enemyCount, consumableCount, bitsCount, bigBitsCount, topEntrances, bottomEntrances, leftEntrances, rightEntrances, roomType)
        rooms.push(newRoom)
      }
    }
  }
  function repositionObstacles(room) {
    for (let i = 0; i < room.obstacles.length; i++) {
      const obstacle = room.obstacles[i];
      spawnObstacle(obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.color, obstacle.borderColor)
    }
  }
  function repositionConsumables(room) {
    for (let i = 0; i < room.consumables.length; i++) {
      const consumable = room.consumables[i];
      spawnConsumable(consumable.x, consumable.y, consumable.type)
    }
  }
  function repositionBits(room) {
    for (let i = 0; i < room.bits.length; i++) {
      const bit = room.bits[i];
      spawnBit(bit.x, bit.y, 0, 0, bit.value, bit.id, true);
      //this wont be pushed into room.bits
    }
  }

  const room = new Room();
  room.init(canvas);

  function findRoomsAbove(rooms) {
    const validRoomsAbove = [];

    for (const room of rooms) {
      const roomAbove = rooms.find(r => r.x === room.x && r.y === room.y - 1);

      if (roomAbove) {
        validRoomsAbove.push(room);
      }
    }

    return validRoomsAbove;
  }

  function findRoomsBelow(rooms) {
    const validRoomsBelow = [];

    for (const room of rooms) {
      const roomBelow = rooms.find(r => r.x === room.x && r.y === room.y + 1);

      if (roomBelow) {
        validRoomsBelow.push(room);
      }
    }

    return validRoomsBelow;
  }

  function findRoomsLeft(rooms) {
    const validRoomsLeft = [];

    for (const room of rooms) {
      const roomLeft = rooms.find(r => r.x === room.x - 1 && r.y === room.y);

      if (roomLeft) {
        validRoomsLeft.push(room);
      }
    }

    return validRoomsLeft;
  }

  function findRoomsRight(rooms) {
    const validRoomsRight = [];

    for (const room of rooms) {
      const roomRight = rooms.find(r => r.x === room.x + 1 && r.y === room.y);

      if (roomRight) {
        validRoomsRight.push(room);
      }
    }

    return validRoomsRight;
  }



  updateOverlay(player.roomx, player.roomy, findRoomByCoordinates(rooms, player.roomx, player.roomy).roomType, player.bits);
  updateOverlayPosition();
  updateEnemyStatsDivPosition();



  function spawnConsumable(x, y, type) {
    let color;
    let size;
    if (type == 1) {
      color = 'rgb(115, 255, 180)'
      size = 20
    } else if (type == 2) {
      color = 'rgb(85, 205, 220)'
      size = 20
    }
    let room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
    const collidesWithObstacle = room.obstacles.some(obstacle => {
      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.width;
      const obstacleTop = obstacle.y;
      const obstacleBottom = obstacle.y + obstacle.height;

      let consumableLeft = x;
      let consumableRight = x + size;
      let consumableTop = y;
      let consumableBottom = y + size;

      if (
        consumableRight > obstacleLeft &&
        consumableLeft < obstacleRight &&
        consumableBottom > obstacleTop &&
        consumableTop < obstacleBottom
      ) {
        return true; // collision detected
      }

      return false;
    });
    
    if (!collidesWithObstacle) {
      let consumableToSpawn = new Consumable(x, y, size, color, type);
      consumables.push(consumableToSpawn);
      if (!room.visited) room.consumables.push(consumableToSpawn);
      return consumableToSpawn;
    } else {
      return spawnConsumable(Math.random() * room.width - size, Math.random() * room.height - size, type)
    }
  }

  class Particle {
    constructor(start, x, y, dx, dy, size, color, lifespan) {
      this.start = start;
      this.x = x;
      this.y = y;
      this.dx = dx;
      this.dy = dy;
      this.size = size;
      this.color = color;
      this.lifespan = lifespan;
    }
    update() {
      this.x += this.dx;
      this.y += this.dy
      this.dx *= 0.8;
      this.dy *= 0.8;
      if (Date.now() >= this.start + this.lifespan) {
        const index = particles.indexOf(this);
        if (index !== -1) {
          particles.splice(index, 1);
        }
      }
    }
    draw() {
      ctx.shadowBlur = 20;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }
  };

  function spawnParticle(start, x, y, dx, dy, size, color, lifespan) {
    if (respawning) return;
    const particleToSpawn = new Particle(start, x, y, dx, dy, size, color, lifespan);
    particles.push(particleToSpawn);
  }

  class ShopItem {
    constructor(x, y, size, type, price, name, description) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.type = type;
      this.price = price;
      this.name = name;
      this.description = description;
    }
  }

  class Enemy {
    constructor(x, y, xvelocity, yvelocity, r, g, b, color, size, speed, name, health, attack, showbossbar, id, movestyle) {
      this.x = x;
      this.y = y;
      this.xvelocity = xvelocity;
      this.yvelocity = yvelocity;
      this.r = r;
      this.g = g;
      this.b = b;
      this.color = color;
      this.size = size;
      this.speed = speed * 0.1;
      this.originalColor = color;
      this.name = name;
      this.health = health;
      this.maxhealth = health;
      this.attack = attack;
      this.showbossbar = showbossbar;
      this.id = id;
      this.movestyle = movestyle;
      this.passivemovetotarget = false;
      this.tempTimeout = null;
    }


    draw() {
      ctx.shadowBlur = 40;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }

    aggressivemove(target) {
      let xchange = 0;
      let ychange = 0;
      let xdiff = this.x - target.x;
      let ydiff = this.y - target.y;
      let totaldiff = Math.sqrt(xdiff * xdiff + ydiff * ydiff)
      if (totaldiff == 0) {
        xchange = 0;
        ychange = 0;
      } else {
        xchange = -this.speed * xdiff / totaldiff;
        ychange = -this.speed * ydiff / totaldiff;
      }

      return [xchange, ychange];
    }




    passivemove(target, forcetargetx, forcetargety) {
      if (Math.random() < 0.2) {
        return [0, 0, forcetargetx, forcetargety];
      }
      if (this.passivemovetotarget && forcetargetx && forcetargety) { //flag to determine if enemy is walking towards target/ on cooldown
        let xdiff1 = forcetargetx - (this.x + this.size / 2);
        let ydiff1 = forcetargety - (this.y + this.size / 2);
        let totaldiff1 = Math.sqrt(xdiff1 * xdiff1 + ydiff1 * ydiff1);

        let xchange = -this.speed * xdiff1 / totaldiff1;
        let ychange = -this.speed * ydiff1 / totaldiff1;

        return [xchange, ychange, forcetargetx, forcetargety];
      }

      let targetx;
      let targety;

      if (forcetargetx && forcetargety) {
        targetx = Math.max(40, Math.min(canvas.clientWidth - this.size - 40, forcetargetx));
        targety = Math.max(40, Math.min(canvas.clientHeight - this.size - 40, forcetargety));
      } else {
        targetx = Math.max(40, Math.min(canvas.clientWidth - this.size - 40, this.x + this.size / 2 + Math.random() * 180 - 90));
        targety = Math.max(40, Math.min(canvas.clientHeight - this.size - 40, this.y + this.size / 2 + Math.random() * 180 - 90));
      }

      for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        const obstacleLeft = obstacle.x;
        const obstacleRight = obstacle.x + obstacle.width;
        const obstacleTop = obstacle.y;
        const obstacleBottom = obstacle.y + obstacle.height;

        let left = targetx;
        let right = targetx + this.size;
        let top = targety;
        let bottom = targety + this.size;

        // Check for collision
        if (
          right > obstacleLeft - 40 &&
          left < obstacleRight + 40 &&
          bottom > obstacleTop - 40 &&
          top < obstacleBottom + 40
        ) {
          return this.passivemove(target, forcetargetx, forcetargety);
        }
      }

      let xchange = 0;
      let ychange = 0;
      let xdiff = this.x - targetx;
      let ydiff = this.y - targety;
      let totaldiff = Math.sqrt(xdiff * xdiff + ydiff * ydiff);

      xchange = -this.speed * xdiff / totaldiff;
      ychange = -this.speed * ydiff / totaldiff;

      return [xchange, ychange, targetx, targety];
    }


    move(enemy, forcetargetx, forcetargety) {
      let xchange;
      let ychange;
      let targetx;
      let targety;
      if (enemy.movestyle === "aggressive") {
        [xchange, ychange] = this.aggressivemove(player);
      } else if (enemy.movestyle === "passive" && !forcetargetx && !forcetargety) {
        [xchange, ychange, targetx, targety] = this.passivemove(player);
      } else if (enemy.movestyle === "passive" && forcetargetx && forcetargety) {
        [xchange, ychange, targetx, targety] = this.passivemove(player, forcetargetx, forcetargety);
      }

      targetx = targetx || this.x;
      targety = targety || this.y;

      this.xvelocity += xchange * (1 + accelMultiplier);
      this.yvelocity += ychange * (1 + accelMultiplier);
      this.xvelocity *= (frictionMultiplier * 0.7);
      this.yvelocity *= (frictionMultiplier * 0.7);

      if (Math.abs(this.xvelocity) < 0.02) {
        this.xvelocity = 0;
      }

      if (Math.abs(this.yvelocity) < 0.02) {
        this.yvelocity = 0;
      }
      this.x += this.xvelocity;
      this.y += this.yvelocity;
      this.x = Math.max(0, Math.min(canvas.clientWidth - this.size, this.x));
      this.y = Math.max(0, Math.min(canvas.clientHeight - this.size, this.y));

      if (enemy.movestyle === "passive" && (Math.abs(this.x + this.size / 2 - targetx) > 30 || Math.abs(this.y + this.size / 2 - targety) > 30)) {
        clearTimeout(this.tempTimeout);
        this.tempTimeout = setTimeout(() => {
          this.move(enemy, targetx, targety);
        }, 8);
      } else if (enemy.movestyle === "passive") {
        clearTimeout(this.tempTimeout);

        if (enemy.movestyle === "passive" && !this.passivemovetotarget) {
          this.passivemovetotarget = true;

          const checkTargetReached = setInterval(() => {
            const currentX = this.x + this.size / 2;
            const currentY = this.y + this.size / 2;
            const distance = Math.sqrt((currentX - targetx) ** 2 + (currentY - targety) ** 2);
            if (distance <= 10) {
              clearInterval(checkTargetReached);
              let rng = Math.floor(Math.random() * 6000 + 3000);
              setTimeout(() => {
                this.passivemovetotarget = false;
              }, rng);
            } else if (Date.now() - startTime >= 7000) {
              clearInterval(checkTargetReached);
              this.passivemovetotarget = false;
              this.move(enemy); // restart movement to find a new target
            }
          }, 100);

          const startTime = Date.now();
        }
      }
    }
  }



  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

  }
  const movementKeys = {
    w: { pressed: false, time: 0 },
    a: { pressed: false, time: 0 },
    s: { pressed: false, time: 0 },
    d: { pressed: false, time: 0 }
  };

  const testKeys = {
    e: { pressed: false, time: 0 },
    f: { pressed: false, time: 0 },
    l: { pressed: false, time: 0 },
    b: { pressed: false, time: 0 },
    p: { pressed: false, time: 0 },
  };

  let sprint = false;

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();

    if (movementKeys.hasOwnProperty(key)) {
      movementKeys[key].pressed = true;
    }

    if (key === ' ') {
      sprint = true;
    } else if (key === 'e' && !testKeys.e.pressed) {
      takeDamage(player, 1);
      testKeys.e.pressed = true;
    } else if (key === 'f' && !testKeys.f.pressed) {
      spawnEnemy();
      testKeys.f.pressed = true;
    } else if (key === 'l' && !testKeys.l.pressed) {
      testKeys.l.pressed = true;
      let room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
      let tempVar = 0;
      if (Math.random() < 0.8) tempVar = 1;
      else tempVar = 2;
      room.consumables.push(spawnConsumable(
        40 + Math.random() * (room.width - 80),
        40 + Math.random() * (room.height - 80),
        tempVar
      ));

    } else if (key === 'b' && !testKeys.b.pressed) {
      let room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
      testKeys.b.pressed = true;
      for (let i = 0; i < 5; i++) {
        room.bits.push(spawnBit(
          40 + Math.random() * (room.width - 80),
          40 + Math.random() * (room.height - 80),
          0,
          0,
          Math.floor(Math.random() * 2 + 1),
          bits.length,
          true))
      }
    } else if (key === "p" && !testKeys.p.pressed) {
      testKeys.p.pressed = true;
      player.health = player.maxHealth;
    }
  }

  function handleKeyUp(event) {
    const key = event.key.toLowerCase();

    if (movementKeys.hasOwnProperty(key)) {
      movementKeys[key].pressed = false;
      movementKeys[key].time = 0;
    } else if (testKeys.hasOwnProperty(key)) {
      testKeys[key].pressed = false;
    }

    if (key === ' ') {
      sprint = false;
    }
  }
  const messageElement = document.getElementById("message");
  const bitElement = document.getElementById("deathbits");
  function checkPlayerHealthAndStamina() {
    if (player.size == 0) return;
    if (player.health <= 0) {
      player.color = 'rgba(0, 0, 0, 0)'
      player.size = 0;
      player.attack = 0;
      player.xvelocity = 0;
      player.yvelocity = 0;

      messageElement.innerHTML = `<p>you died lol <br> Rooms visited: ${player.roomsEnteredThisSession}</p> <br>
    <button type="button" id="respawn">Respawn</button>`;
      bitElement.innerHTML = `<p>${Math.round(player.keepPercentageOfBitsUponDeath)}% of bits will transfer over to the next session</p>`
      const button = document.getElementById("respawn");
      button.addEventListener("click", respawn);
    }
  }

  function attemptEnterRoom() {
    let currentRoom = findRoomByCoordinates(rooms, player.roomx, player.roomy);


    if (!currentRoom || enemies.length !== 0) return;
    const room = new Room();
    player.roomsEntered++;
    player.roomsEnteredThisSession++;
    if (player.x == 0) { //attempt to enter room on the left
      player.x = findRoomByCoordinates(rooms, player.roomx, player.roomy).width - 2 * player.size
      room.spawnRoom(player.roomx - 1, player.roomy, 'right')

      player.roomx--;
      room.enterRoom(player.roomx, player.roomy)
    }
    else if (player.x == currentRoom.width - player.size) {
      player.x = 2 * player.size
      room.spawnRoom(player.roomx + 1, player.roomy, 'left')
      player.roomx++;

      room.enterRoom(player.roomx, player.roomy)
    }
    else if (player.y == 0) {
      player.y = findRoomByCoordinates(rooms, player.roomx, player.roomy).height - 2 * player.size
      room.spawnRoom(player.roomx, player.roomy - 1, 'bottom')

      player.roomy--;
      room.enterRoom(player.roomx, player.roomy)
    } else if (player.y == currentRoom.height - player.size) {
      player.y = 2 * player.size;
      room.spawnRoom(player.roomx, player.roomy + 1, 'top')

      player.roomy++;
      room.enterRoom(player.roomx, player.roomy)
    }
  }
  let normalSpeed = 3;
  let boostedSpeed = 5;
  function update() {
    player.dy = 0
    player.dx = 0
    if (player.health > 0) {
      if (movementKeys.w.pressed) {
        player.dy -= 1;
        player.dy = Math.sign(player.dy)
        movementKeys.w.time += 1;
      }
      if (movementKeys.s.pressed) {
        player.dy += 1;
        player.dy = Math.sign(player.dy)
        movementKeys.s.time += 1;
      }
      if (movementKeys.a.pressed) {
        player.dx -= 1;
        player.dx = Math.sign(player.dx)
        movementKeys.a.time += 1;
      }
      if (movementKeys.d.pressed) {
        player.dx += 1;
        player.dx = Math.sign(player.dx)
        movementKeys.d.time += 1;
      }
      const speed = sprint ? boostedSpeed : normalSpeed;

      if (player.dy != 0) {
        player.movingY++
        player.yvelocity = player.dy * speed * accelMultiplier * Math.min(5, Math.abs(player.movingY) / 8);
      } else {
        player.movingY = 0;
        player.yvelocity *= frictionMultiplier;
      }

      if (player.dx != 0) {
        player.movingX++
        player.xvelocity = player.dx * speed * accelMultiplier * Math.min(5, Math.abs(player.movingX) / 8);
      } else {
        player.movingX = 0;
        player.xvelocity *= frictionMultiplier;
      }
      let currentRoom = findRoomByCoordinates(rooms, player.roomx, player.roomy);

      player.x = Math.min((canvas.width - player.size), (Math.max(0, (player.x + player.xvelocity))));
      player.y = Math.min((canvas.height - player.size), (Math.max(0, (player.y + player.yvelocity))));

      if (!findRoomByCoordinates(rooms, player.roomx, player.roomy)) return;
      if (player.x == 0 || player.y == 0 || player.x == currentRoom.width - player.size || player.y == currentRoom.height - player.size) {
        attemptEnterRoom();
      }
    }
  }

  const movepassive = setInterval(() => {
    movePassiveEnemy();
  }, 3000)
  const moveaggro = setInterval(() => {
    moveAggressiveEnemy();
  },)

  function gameLoop() {
    if (respawning) return;
    updateOverlay(player.roomx, player.roomy, findRoomByCoordinates(rooms, player.roomx, player.roomy).roomType, player.bits);
    checkPlayerHealthAndStamina();
    updateHealthBar(player.health, player.maxHealth);
    update();
    draw();
    requestAnimationFrame(gameLoop);
    checkCollision();
    checkObstacleCollision();
    checkConsumableCollision();
    for (let i = 0; i < enemies.length; i++) {
      enemies[i].draw()
    }
    for (let i = 0; i < obstacles.length; i++) {
      obstacles[i].draw()
    }
    for (let i = 0; i < projectiles.length; i++) {
      projectiles[i].draw();
      projectiles[i].update();
    }
    for (let i = 0; i < particles.length; i++) {
      particles[i].draw();
      particles[i].update();
    }
    for (let i = 0; i < consumables.length; i++) {
      consumables[i].draw();

    }
    for (let i = 0; i < bits.length; i++) {
      bits[i].draw();
      bits[i].moveTowardsPlayer();
      bits[i].checkPlayerCollision();
    }
    if (player.health > 0) {
      player.draw()
    }


  }

  function applyKnockback(target, target2) {
    let room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
    targetWeight = Math.sqrt(target.size)
    target2Weight = Math.sqrt(target2.size)
    if (Math.sign(target.xvelocity * target2.xvelocity) == -1) {
      target.xvelocity *= -1
    }
    if (Math.sign(target.yvelocity * target2.yvelocity) == -1) {
      target.yvelocity *= -1
    }
    if (target.xvelocity <= 0.05) {
      target.xvelocity = target2.xvelocity
    }
    if (target.yvelocity <= 0.05) {
      target.yvelocity = target2.yvelocity
    }
    let i = 0;
    const kbInterval = setInterval(() => {
      target.x = Math.min((room.width - target.size), (Math.max(0, (target.x + target.xvelocity * (target2Weight) / (targetWeight + target2Weight)))));
      target2.x = Math.min((room.width - target.size), (Math.max(0, (target2.x - target.xvelocity * (targetWeight) / (targetWeight + target2Weight)))));
      target.y = Math.min((room.height - target.size), (Math.max(0, (target.y + target.yvelocity * (target2Weight) / (targetWeight + target2Weight)))));
      target2.y = Math.min((room.height - target.size), (Math.max(0, (target2.y - target.yvelocity * (targetWeight) / (targetWeight + target2Weight)))));
      i++
      if (i > 8) {
        clearInterval(kbInterval);
        i = 0;
      }
    }, 15)
    const kbInterval2 = setInterval(() => {
      target.xvelocity *= frictionMultiplier
      target.yvelocity *= frictionMultiplier
      target.x = Math.min((room.width - target.size), (Math.max(0, (target.x + target.xvelocity * (target2Weight) / (targetWeight + target2Weight)))));
      target2.x = Math.min((room.width - target.size), (Math.max(0, (target2.x - target.xvelocity * (targetWeight) / (targetWeight + target2Weight)))));
      target.y = Math.min((room.height - target.size), (Math.max(0, (target.y + target.yvelocity * (target2Weight) / (targetWeight + target2Weight)))));
      target2.y = Math.min((room.height - target.size), (Math.max(0, (target2.y - target.yvelocity * (targetWeight) / (targetWeight + target2Weight)))));
      i++
      if (i > 5) {
        clearInterval(kbInterval2);
        i = 0;
      }
    }, 10)
    try { target.movingY = 0 } catch { }
    try { target.movingX = 0 } catch { }
  }


  function updateHealthBar(health, maxHealth) {
    const healthBarWidth = canvas2.width;
    const healthBarHeight = canvas2.height;
    const healthBarX = (canvas2.width - healthBarWidth) / 2;
    const healthBarY = canvas2.height - healthBarHeight;
    let healthBarColor = 'rgb(175, 60, 60)';
    const healthBarDepletedColor = 'rgb(40, 40, 60)'
    const healthBarBorderColor = 'black';
    const healthBarBorderWidth = 6;
    const healthBarFillWidth = (health / maxHealth) * healthBarWidth;

    if (health / maxHealth < 0.3) {
      healthBarColor = 'rgb(240, 30, 30)'
    }

    ctx2.fillStyle = healthBarDepletedColor;
    ctx2.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    ctx2.shadowBlur = 40;
    ctx2.shadowColor = this.color;
    ctx2.fillStyle = healthBarColor;
    ctx2.fillRect(healthBarX, healthBarY, healthBarFillWidth, healthBarHeight);
    ctx2.shadowBlur = 0;
    ctx2.shadowColor = 'transparent';
    ctx2.strokeStyle = healthBarBorderColor;
    ctx2.lineWidth = healthBarBorderWidth;
    ctx2.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

  }


  function takeDamage(hurtEntity, amount) {
    if (amount <= 0) {
      return;
    }
    if (hurtEntity.isAnimating) {
      return;
    }
    hurtEntity.health -= amount;
    for (let i = 0; i < 4; i++) {
      spawnParticle(Date.now(), hurtEntity.x + hurtEntity.size / 2, hurtEntity.y + hurtEntity.size / 2, Math.random() * 20 - 10, Math.random() * 20 - 10, Math.max(4, hurtEntity.size * 0.1), `rgba(${hurtEntity.r}, ${hurtEntity.g}, ${hurtEntity.b}, 0.6)`, Math.random() * 200 + 100);
    }
    if (hurtEntity.health <= 0) {
      if (hurtEntity instanceof Enemy) {
        let rng = Math.floor(Math.random() * hurtEntity.maxhealth * 0.1 + 1);
        for (let i = 0; i < rng; i++) {
          spawnBit(hurtEntity.x + hurtEntity.size / 2 + Math.random() * 20 - 10, hurtEntity.y + hurtEntity.size / 2 + Math.random() * 20 - 10, Math.random() * 8, Math.random() * 8, Math.floor(Math.random() * 2) + 1, bits.length, false);
        }
        enemies.splice(enemies.indexOf(hurtEntity), 1);
        if (hurtEntity.movestyle == "aggressive") {

          aggressiveEnemies.splice(aggressiveEnemies.indexOf(hurtEntity), 1)
        }
        else if (hurtEntity.movestyle == "passive") {
          passiveEnemies.splice(passiveEnemies.indexOf(hurtEntity), 1)
        }

      }
    }
    hurtEntity.isAnimating = true;
    const originalColor = hurtEntity.originalColor;
    const temporaryColor = 'rgba(255, 0, 0, 1)';
    const transitionDuration = 300;
    const frameDuration = 15;
    const numFrames = transitionDuration / frameDuration;

    let currentFrame = 0;
    let currentColor = temporaryColor;

    function updateColor() {
      const progress = currentFrame / numFrames;
      const originalRGB = originalColor.substring(5, originalColor.length - 1).split(', ');
      const temporaryRGB = temporaryColor.substring(5, temporaryColor.length - 1).split(', ');
      const r = parseInt(Math.round((1 - progress) * parseInt(temporaryRGB[0]) + progress * parseInt(originalRGB[0])));
      const g = parseInt(Math.round((1 - progress) * parseInt(temporaryRGB[1]) + progress * parseInt(originalRGB[1])));
      const b = parseInt(Math.round((1 - progress) * parseInt(temporaryRGB[2]) + progress * parseInt(originalRGB[2])));
      currentColor = `rgb(${r}, ${g}, ${b})`;
      hurtEntity.color = currentColor;

      if (currentFrame < numFrames) {
        currentFrame++;
        requestAnimationFrame(updateColor);
      } else {
        hurtEntity.color = originalColor;
        hurtEntity.isAnimating = false;
      }
    }

    updateColor();
  }




  function spawnEnemy(playerFutureX, playerFutureY) {
    if (respawning) return;
    let room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
    let rng = Math.floor(Math.random() * 100 + 1);
    if (rng <= 90) {
      let size = Math.floor(Math.random() * 30 + 30)
      let x = 40 + Math.random() * (room.width - 80)
      let y = 40 + Math.random() * (room.height - 80)
      if (!validSpawn(player, x, y, size, playerFutureX, playerFutureY)) {
        spawnEnemy(playerFutureX, playerFutureY);
        return;
      }
      let r = Math.floor(Math.random() * 105 + 150)
      let g = Math.floor(Math.random() * 25 + 50)
      let b = Math.floor(Math.random() * 25 + 50)
      const enemy = new Enemy(x, y, 0, 0, r, g, b, `rgba(${r}, ${g}, ${b}, 1)`, size, Math.floor(Math.random() * 10 + 15) / 10, 'Aggressive Enemy', Math.floor(Math.random() * 10 + 5), Math.round(Math.random() * 5 + 10) / 10, false, id, "aggressive")
      id++;
      enemies.push(enemy);
      aggressiveEnemies.push(enemy);
    }
    else {
      spawnGroupOfPassiveEnemies(0, playerFutureX, playerFutureY, null, null);
    }
  }

  function spawnGroupOfPassiveEnemies(counter, playerFutureX, playerFutureY, firstX, firstY) {
    if (respawning) return;
    let room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
    let random = Math.floor(Math.random() * 100 + 1);

    let size = Math.floor(Math.random() * 15 + 25)
    let x = Math.random() * (room.width - size)
    let y = Math.random() * (room.height - size)
    if (firstX && firstY) {
      x = Math.max(2 * size, Math.min(room.width - 3 * size, firstX + Math.random() * 80 - 40));
      y = Math.max(2 * size, Math.min(room.height - 3 * size, firstY + Math.random() * 80 - 40));
    }
    if (!validSpawn(player, x, y, size, playerFutureX, playerFutureY)) {
      return spawnGroupOfPassiveEnemies(counter, playerFutureX, playerFutureY);
    }
    let r = Math.floor(Math.random() * 80 + 80)
    let g = Math.floor(Math.random() * 20 + 25)
    let b = Math.floor(Math.random() * 85 + 170)
    const enemy = new Enemy(x, y, 0, 0, r, g, b, `rgba(${r}, ${g}, ${b}, 1)`, size, Math.floor(Math.random() * 5 + 13) / 10, 'Passive Enemy', Math.floor(Math.random() * 6 + 4), Math.round(Math.random() * 5 + 5) / 10, false, id, "passive")
    id++;
    enemies.push(enemy);
    passiveEnemies.push(enemy);
    if (counter < 2 && random <= 60) {
      spawnGroupOfPassiveEnemies(counter + 1, playerFutureX, playerFutureY, x, y)
    }
  }


  function moveAggressiveEnemy() {
    for (let i = 0; i < aggressiveEnemies.length; i++) {
      let enemy = aggressiveEnemies[i];
      enemy.move(enemy)
    }
  }
  function movePassiveEnemy() {
    for (let i = 0; i < passiveEnemies.length; i++) {
      let enemy = passiveEnemies[i];
      enemy.move(enemy)
    }
  }


  function checkConsumableCollision() {
    for (let i = 0; i < consumables.length; i++) {
      const consumable = consumables[i];
      if (
        player.x + player.size > consumable.x &&
        player.x < consumable.x + consumable.size &&
        player.y + player.size > consumable.y &&
        player.y < consumable.y + consumable.size
      ) {
        for (let k = 0; k < 6; k++) {
          spawnParticle(Date.now(), consumable.x + consumable.size / 2, consumable.y + consumable.size / 2, Math.random() * 20 - 10, Math.random() * 20 - 10, 4, 'rgba(115, 255, 180, 0.6)', Math.random() * 200 + 100)
        }
        let type = consumable.type;
        consumables.splice(i, 1);
        findRoomByCoordinates(rooms, player.roomx, player.roomy).consumables.splice(i, 1)
        console.log(consumables);
        if (type == 1) {
          player.health = Math.min(player.maxHealth, player.health + player.maxHealth * 0.1)
          let j = 20;
          const healInterval = setInterval(() => {
            player.health = Math.min(player.maxHealth, player.health + 0.1)
            for (let k = 0; k < 4; k++) {
              spawnParticle(Date.now(), player.x + player.size / 2, player.y + player.size / 2, Math.random() * 20 - 10, Math.random() * 20 - 10, Math.max(4, player.size * 0.1), 'rgba(115, 255, 180, 0.4)', Math.random() * 200 + 100);
            }
            j--;
            if (j <= 0) {
              clearInterval(healInterval);
            }
          }, 400)
        }
        else if (type == 2) {
          player.health = Math.min(player.maxHealth, player.health + player.maxHealth * 0.05)
          normalSpeed = Math.min(2 * player.basespeed, normalSpeed * 1.3);
          boostedSpeed = Math.min(2 * player.baseboostedspeed, normalSpeed * 1.3);
          let j = 20;
          const healInterval = setInterval(() => {
            player.health = Math.min(player.maxHealth, player.health + 0.025)
            for (let k = 0; k < 4; k++) {
              spawnParticle(Date.now(), player.x + player.size / 2, player.y + player.size / 2, Math.random() * 20 - 10, Math.random() * 20 - 10, Math.max(4, player.size * 0.1), 'rgba(85, 205, 220, 0.4)', Math.random() * 200 + 100);
            }
            j--;
            if (j <= 0) {
              clearInterval(healInterval);
              normalSpeed /= 1.3;
              boostedSpeed /= 1.3;
            }
          }, 400)
        }
      }
    }
  }

  function spawnObstacle(x, y, width, height, color, borderColor) {
    const obstacle = new Obstacle(x, y, width, height, color, borderColor);
    obstacles.push(obstacle);
    let room = findRoomByCoordinates(rooms, player.roomx, player.roomy);
    if (!room.visited) room.obstacles.push(obstacle);
  }

  function checkObstacleCollision() {
    for (let i = 0; i < obstacles.length; i++) {
      const obstacle = obstacles[i];
      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.width;
      const obstacleTop = obstacle.y;
      const obstacleBottom = obstacle.y + obstacle.height;

      const playerLeft = player.x;
      const playerRight = player.x + player.size;
      const playerTop = player.y;
      const playerBottom = player.y + player.size;

      // Check for collision with player
      if (
        playerRight > obstacleLeft &&
        playerLeft < obstacleRight &&
        playerBottom > obstacleTop &&
        playerTop < obstacleBottom
      ) {
        // Adjust the player's position to prevent collision
        const playerHorizontalCenter = player.x + player.size / 2;
        const playerVerticalCenter = player.y + player.size / 2;
        const obstacleHorizontalCenter = obstacle.x + obstacle.width / 2;
        const obstacleVerticalCenter = obstacle.y + obstacle.height / 2;

        const dx = playerHorizontalCenter - obstacleHorizontalCenter;
        const dy = playerVerticalCenter - obstacleVerticalCenter;

        const widthSum = (player.size + obstacle.width) / 2;
        const heightSum = (player.size + obstacle.height) / 2;

        if (Math.abs(dx) < widthSum && Math.abs(dy) < heightSum) {
          const wy = widthSum * dy;
          const hx = heightSum * dx;

          if (wy > hx) {
            if (wy > -hx) {
              // Colliding from the bottom
              player.y = obstacleBottom;
            } else {
              // Colliding from the left
              player.x = obstacleLeft - player.size;
            }
          } else {
            if (wy > -hx) {
              // Colliding from the right
              player.x = obstacleRight;
            } else {
              // Colliding from the top
              player.y = obstacleTop - player.size;
            }
          }
        }
      }

      for (let k = 0; k < bits.length; k++) {
        const obstacle = obstacles[i];
        const obstacleLeft = obstacle.x;
        const obstacleRight = obstacle.x + obstacle.width;
        const obstacleTop = obstacle.y;
        const obstacleBottom = obstacle.y + obstacle.height;

        const bit = bits[k];
        const bitLeft = bit.x;
        const bitRight = bit.x + bit.size;
        const bitTop = bit.y;
        const bitBottom = bit.y + bit.size;

        if (
          bitRight > obstacleLeft &&
          bitLeft < obstacleRight &&
          bitBottom > obstacleTop &&
          bitTop < obstacleBottom
        ) {
          const bitHorizontalCenter = bit.x + bit.size / 2;
          const bitVerticalCenter = bit.y + bit.size / 2;
          const obstacleHorizontalCenter = obstacle.x + obstacle.width / 2;
          const obstacleVerticalCenter = obstacle.y + obstacle.height / 2;

          const dx = bitHorizontalCenter - obstacleHorizontalCenter;
          const dy = bitVerticalCenter - obstacleVerticalCenter;

          const widthSum = (bit.size + obstacle.width) / 2;
          const heightSum = (bit.size + obstacle.height) / 2;

          if (Math.abs(dx) < widthSum && Math.abs(dy) < heightSum) {
            const wy = widthSum * dy;
            const hx = heightSum * dx;

            if (wy > hx) {
              if (wy > -hx) {
                // Colliding from the bottom
                bit.y = obstacleBottom
              } else {
                // Colliding from the left
                bit.x = obstacleLeft - bit.size
              }
            } else {
              if (wy > -hx) {
                // Colliding from the right
                bit.x = obstacleRight
              } else {
                // Colliding from the top
                bit.y = obstacleTop - bit.size
              }
            }
          }
        }
      }


      // Check for collision with enemies
      for (let j = 0; j < enemies.length; j++) {
        const obstacle = obstacles[i];
        const obstacleLeft = obstacle.x;
        const obstacleRight = obstacle.x + obstacle.width;
        const obstacleTop = obstacle.y;
        const obstacleBottom = obstacle.y + obstacle.height;

        const enemy = enemies[j];
        const enemyLeft = enemy.x;
        const enemyRight = enemy.x + enemy.size;
        const enemyTop = enemy.y;
        const enemyBottom = enemy.y + enemy.size;

        if (
          enemyRight > obstacleLeft &&
          enemyLeft < obstacleRight &&
          enemyBottom > obstacleTop &&
          enemyTop < obstacleBottom
        ) {

          const enemyHorizontalCenter = enemy.x + enemy.size / 2;
          const enemyVerticalCenter = enemy.y + enemy.size / 2;
          const obstacleHorizontalCenter = obstacle.x + obstacle.width / 2;
          const obstacleVerticalCenter = obstacle.y + obstacle.height / 2;

          const dx = enemyHorizontalCenter - obstacleHorizontalCenter;
          const dy = enemyVerticalCenter - obstacleVerticalCenter;

          const widthSum = (enemy.size + obstacle.width) / 2;
          const heightSum = (enemy.size + obstacle.height) / 2;

          if (Math.abs(dx) < widthSum && Math.abs(dy) < heightSum) {
            const wy = widthSum * dy;
            const hx = heightSum * dx;

            if (wy > hx) {
              if (wy > -hx) {
                // Colliding from the bottom
                enemy.y = obstacleBottom
              } else {
                // Colliding from the left
                enemy.x = obstacleLeft - enemy.size
              }
            } else {
              if (wy > -hx) {
                // Colliding from the right
                enemy.x = obstacleRight
              } else {
                // Colliding from the top
                enemy.y = obstacleTop - enemy.size
              }
            }
          }
        }
      }
    }
  }

  function spawnWallTop(gaps, roomWidth, roomHeight) {
    if (gaps.length === 0) {
      for (let i = 0; i < roomWidth / 40; i++) {
        spawnObstacle(i * 40, 0, 40, 40, 'rgb(80, 80, 100)', 'rgb(20, 20, 40)');
      }
    } else {
      let currentX = 0;
      let j = 0;
      while (currentX < roomWidth) {
        if (j < gaps.length && currentX >= gaps[j][0] && currentX < gaps[j][1]) {
          currentX = gaps[j][1];
          j++;
        } else {
          spawnObstacle(currentX, 0, 40, 40, 'rgb(80, 80, 100)', 'rgb(20, 20, 40)');
          currentX += 40;
        }
      }
    }
  }

  function spawnWallLeft(gaps, roomWidth, roomHeight) {
    if (gaps.length === 0) {
      for (let i = 0; i < roomHeight / 40; i++) {
        spawnObstacle(0, i * 40, 40, 40, 'rgb(80, 80, 100)', 'rgb(20, 20, 40)');
      }
    } else {
      let currentY = 0;
      let j = 0;
      while (currentY < roomHeight) {
        if (j < gaps.length && currentY >= gaps[j][0] && currentY < gaps[j][1]) {
          currentY = gaps[j][1];
          j++;
        } else {
          spawnObstacle(0, currentY, 40, 40, 'rgb(80, 80, 100)', 'rgb(20, 20, 40)');
          currentY += 40;
        }
      }
    }
  }

  function spawnWallRight(gaps, roomWidth, roomHeight) {
    if (gaps.length === 0) {
      for (let i = 0; i < roomHeight / 40; i++) {
        spawnObstacle(roomWidth - 40, i * 40, 40, 40, 'rgb(80, 80, 100)', 'rgb(20, 20, 40)');
      }
    } else {
      let currentY = 0;
      let j = 0;
      while (currentY < roomHeight) {
        if (j < gaps.length && currentY >= gaps[j][0] && currentY < gaps[j][1]) {
          currentY = gaps[j][1];
          j++;
        } else {
          spawnObstacle(roomWidth - 40, currentY, 40, 40, 'rgb(80, 80, 100)', 'rgb(20, 20, 40)');
          currentY += 40;
        }
      }
    }
  }

  function spawnWallBottom(gaps, roomWidth, roomHeight) {
    if (gaps.length === 0) {
      for (let i = 0; i < roomWidth / 40; i++) {
        spawnObstacle(i * 40, roomHeight - 40, 40, 40, 'rgb(80, 80, 100)', 'rgb(20, 20, 40)');
      }
    } else {
      let currentX = 0;
      let j = 0;
      while (currentX < roomWidth) {
        if (j < gaps.length && currentX >= gaps[j][0] && currentX < gaps[j][1]) {
          currentX = gaps[j][1];
          j++;
        } else {
          spawnObstacle(currentX, roomHeight - 40, 40, 40, 'rgb(80, 80, 100)', 'rgb(20, 20, 40)');
          currentX += 40;
        }
      }
    }
  }
  function checkCollision() {
    let room = findRoomByCoordinates(rooms, player.roomx, player.roomy)
    for (let i = 0; i < enemies.length; i++) { // check player-mob
      const enemy = enemies[i];
      if (
        player.x <= enemy.x + enemy.size &&
        player.x + player.size >= enemy.x &&
        player.y <= enemy.y + enemy.size &&
        player.y + player.size >= enemy.y
      ) {
        takeDamage(player, enemy.attack);
        takeDamage(enemy, player.attack);
        applyKnockback(player, enemy);
      }

      if (enemy.x < 0) {
        enemy.x = 0;
      } else if (enemy.x > room.width - enemy.size) {
        enemy.x = room.width - enemy.size;
      }
      if (enemy.y < 0) {
        enemy.y = 0;
      } else if (enemy.y > room.height - enemy.size) {
        enemy.y = room.height - enemy.size;
      }

      for (let j = i + 1; j < enemies.length; j++) { // check mob-mob
        const enemy2 = enemies[j];
        const enemyWeight = Math.sqrt(enemy.size);
        const enemy2Weight = Math.sqrt(enemy2.size);

        if (
          enemy.x <= enemy2.x + enemy2.size &&
          enemy.x + enemy.size >= enemy2.x &&
          enemy.y <= enemy2.y + enemy2.size &&
          enemy.y + enemy.size >= enemy2.y
        ) {
          const deltaX = enemy.x + enemy.size / 2 - (enemy2.x + enemy2.size / 2);
          const deltaY = enemy.y + enemy.size / 2 - (enemy2.y + enemy2.size / 2);
          const overlapX = (enemy.size + enemy2.size) / 2 - Math.abs(deltaX);
          const overlapY = (enemy.size + enemy2.size) / 2 - Math.abs(deltaY);

          if (overlapX > 0 && overlapY > 0) {
            if (overlapX > overlapY) {
              if (deltaY > 0) {
                enemy.y += overlapY * (enemy2Weight / (enemyWeight + enemy2Weight));
                enemy2.y -= overlapY * (enemyWeight / (enemyWeight + enemy2Weight));
              } else {
                enemy.y -= overlapY * (enemy2Weight / (enemyWeight + enemy2Weight));
                enemy2.y += overlapY * (enemyWeight / (enemyWeight + enemy2Weight));
              }
            } else {
              if (deltaX > 0) {
                enemy.x += overlapX * (enemy2Weight / (enemyWeight + enemy2Weight));
                enemy2.x -= overlapX * (enemyWeight / (enemyWeight + enemy2Weight));
              } else {
                enemy.x -= overlapX * (enemy2Weight / (enemyWeight + enemy2Weight));
                enemy2.x += overlapX * (enemyWeight / (enemyWeight + enemy2Weight));
              }
            }
          }
        }
      }
    }
  }

  function validSpawn(player, x, y, size, playerFutureX, playerFutureY) {
    if (Math.sqrt((player.x - x) ** 2 + (player.y - y) ** 2) <
      Math.sqrt(2 * (player.size ** 2)) + Math.sqrt(2 * (size ** 2)) + 240) {
      return false;
    }
    return true;
  }

  function respawn() {
    respawning = true;
    enemies = []
    obstacles = []
    projectiles = []
    particles = []
    consumables = []
    bits = []
    aggressiveEnemies = [];
    passiveEnemies = [];
    rooms = [];
    let newrespawnroom = new Room();
    setTimeout(() => {
      newrespawnroom.init(canvas);
    }, 15)
    player.basespeed = 3;
    player.baseboostedspeed = 5;
    player.level = 0;
    player.roomx = 0;
    player.roomy = 0;
    player.x = 380;
    player.y = 280;
    player.dy = 0;
    player.dx = 0;
    player.movingX = 0;
    player.movingY = 0;
    player.xvelocity = 0;
    player.yvelocity = 0;
    player.currentspeed = 0;
    player.size = 40;
    player.r = 80;
    player.g = 80;
    player.b = 255;
    player.bits = Math.floor(player.bits * 0.01 * player.keepPercentageOfBitsUponDeath)
    player.color = 'rgb(80, 80, 255)';
    player.originalColor = 'rgb(80, 80, 255)';
    player.health = 10;
    player.maxHealth = 10;
    player.attack = 5;
    player.projectileDamage = 1;
    player.cooldownTime = 400;
    player.lastShotTime = 0;
    player.roomsEnteredThisSession = 0;
    counter = 0;
    id = 0;
    messageElement.innerHTML = ``
    bitElement.innerHTML = ``
    setTimeout(() => {
      respawning = false;
      gameLoop()
    }, 25)

  }

  gameLoop();


  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('click', player.shootProjectile.bind(player));
  window.addEventListener('resize', updateOverlayPosition);
  window.addEventListener('resize', updateEnemyStatsDivPosition);
