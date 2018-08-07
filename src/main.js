let isDebug = true;
let config = {
  type: Phaser.Auto,
  width: 800,
  height: 600,
  physics: {
    default: 'matter',
    matter: {
      debug: isDebug,
      gravity: { x: 0, y: 0 },
    }
  },
  scene: { preload, create, update, }
}

let game = new Phaser.Game(config);
let glider = null;
let altText = null;
let varioText = null;
let speed = new Phaser.Math.Vector2(0, 0);
let altitude = 1000;
let vario = 0;
let varioSound = new Vario();
let thermal = null;
let circle = null;
let circles = [];

const nPoints = 30;

function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('glider', 'assets/glider.png');
}

function create() {
  this.matter.world.setBounds();
  this.add.image(400, 300, 'sky');
  altText = this.add.text(16, 16, `${altitude}m`, { fontSize: '32px', fill: '#000' });
  varioText = this.add.text(16, 64, `${vario}m/s`, { fontSize: '32px', fill: '#000' });

  matter = this.matter

  thermal = this.matter.add.image(300, 200, undefined, null, { isStatic: true, collisionFilter: { mask: `ignore-thermal` } });
  thermal.setStatic(true);
  thermal.setCircle(100);

  glider = this.matter.add.image(400, 300, 'glider');
  glider.setBody({
    type: 'rectangle',
    width: 210,
    height: 19
  });
  glider.setVelocity(speed.x, speed.y);
  glider.setBounce(1, 1);

  if (isDebug) {
    for (i = 0; i < nPoints; ++i) {
      circles[i] = this.matter.add.image(0, 0, undefined, null, { isStatic: true, collisionFilter: { mask: `ignore${i}` } });
      circles[i].setCircle(1);
    }
  }

  this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
    // FIXME: Need to check if this is a glider : thermal colision
    // Can probably use a colision category for that!
    event.pairs.forEach( (p) => p.isActive = false)
  });
  //this.matter.add.overlap(glider, thermal, () => { altitude++ }, null, this);
}

function gridForRectangle(cx, cy, angle, width, height) {
  let nVPoints = 3;
  let nHPoints = nPoints / nVPoints;
  let hDist = width / (nHPoints - 1);
  let vDist = height / (nVPoints - 1);

  let topLeftX = cx + (sinDeg(angle - 90) * width / 2) + (sinDeg(angle) * height / 2);
  let topLeftY = cy - (cosDeg(angle - 90) * width / 2) - (cosDeg(angle) * height / 2);

  // FIXME: These should be thermals dinamically
  let tx = 300;
  let ty = 200;
  let tr = 100;

  let count = 0;
  let i = 0;
  for (let y = 0; y < nVPoints; ++y ) {
    for (let x = 0; x < nHPoints; ++x ) {
      px = topLeftX - sinDeg(angle) * y * vDist - sinDeg(angle - 90) * x * hDist;
      py = topLeftY + cosDeg(angle) * y * vDist + cosDeg(angle - 90) * x * hDist;

      if (isDebug) {
        circles[i].setX(px)
        circles[i].setY(py)
      }
      if (((px - tx)**2 + (py - ty)**2) < tr**2) {
        count = count + 1;
        if (isDebug) {
          circles[i].setCircle(10);
        }
      } else if (isDebug) {
        circles[i].setCircle(1);
      }
      ++i

    }
  }

  return count/nPoints;
}

function cosDeg(d) {
  return Math.cos(degToRad(d));
}

function sinDeg(d) {
  return Math.sin(degToRad(d));
}

function degToRad(d) {
  return d / 180 * Math.PI;
}

function update() {
  let cursors = this.input.keyboard.createCursorKeys();
  let angV = glider.getData('angV') || 0;

  if (cursors.left.isDown) {
    angV = angV - 0.001;
    if (angV < -0.01) { angV = -0.01; }
  } else if (cursors.right.isDown) {
    angV = angV + 0.001;
    if (angV > 0.01) { angV = 0.01; }
  } else if (cursors.up.isDown) {
    console.log("up");
  } else if (cursors.down.isDown) {
    console.log("down");
  }
  let inThermalPercent = gridForRectangle(glider.x, glider.y, glider.angle, 210, 19, 0.01);
  altitude = altitude + inThermalPercent * 0.1;

  glider.setAngularVelocity(angV);
  glider.setData('angV', angV);
  let angRad = (glider.angle - 90) / 180 * Math.PI;
  speed.setToPolar(angRad);
  glider.setVelocity(speed.x, speed.y);

  altText.setText( `${Math.round(altitude)}m`);
  varioSound.update(inThermalPercent*6);
  varioText.setText( `${Math.round(inThermalPercent*6)}m/s`);
}
