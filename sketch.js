var state = "start";
let W = 800;
let H = 600;

// Background variables 
let bg, bg2;
let bgx = 0;
let bgy = 0;
let bg2x = W;
let bg2y = 0;
let sp2 = 1;
let sp = 1;

// Horse variables 
var horseX = W / 2 - 470;
var horsePicked;
let horses = [];
let raceOver = false;
let winner;

// Money / Betting 
let money = 100;
let betAmount = 0;

// Obstacles 
let obstacles = [];

// Power-ups 
let powerUps = [];
let freezeTimer = 0;

// Countdown 
let countdownStart = 0;
let raceStarted = false;

// Lane system — these are the horse object's .y values (GIF drawn at y-60)
// Visual center of each horse = LANE_Y[i] - 60 + 125 = LANE_Y[i] + 65
const LANE_Y = [355, 410, 465];

// Obstacles/powerups should appear at the visual center of each lane
// LANE_Y[i] + 65 puts them right in the middle of the horse GIF
const LANE_OB_Y = [LANE_Y[0] + 65, LANE_Y[1] + 65, LANE_Y[2] + 65];

let keyW = false;
let keyS = false;
let keyWprev = false;
let keySprev = false;


function preload() {
  bg    = loadImage('background.jpg');
  bg2   = loadImage('background.jpg');
  horse1 = loadImage('blue horse.png');
  horse2 = loadImage('red horse.png');
  horse3 = loadImage('yellow horse.png');
  horse1gif = loadImage('horse1.gif');
  horse2gif = loadImage('horse2.gif');
  horse3gif = loadImage('horse3.gif');
}

function setup() {
  createCanvas(W, H);
  resetRace();
}

function resetRace() {
  horses = [
    { name: 'horse1', x: 50, y: LANE_Y[0], lane: 0, currentSpeed: 0, maxSpeed: 1.4,  accel: 0.018, resistance: 0.5,  hitTimer: 0, shielded: false, shieldTimer: 0, boosted: false, boostTimer: 0 },
    { name: 'horse2', x: 50, y: LANE_Y[1], lane: 1, currentSpeed: 0, maxSpeed: 1.1,  accel: 0.035, resistance: 0.25, hitTimer: 0, shielded: false, shieldTimer: 0, boosted: false, boostTimer: 0 },
    { name: 'horse3', x: 50, y: LANE_Y[2], lane: 2, currentSpeed: 0, maxSpeed: 0.85, accel: 0.025, resistance: 0.85, hitTimer: 0, shielded: false, shieldTimer: 0, boosted: false, boostTimer: 0 },
  ];
  obstacles   = [];
  powerUps    = [];
  raceOver    = false;
  winner      = null;
  raceStarted = false;
  countdownStart = 0;
  freezeTimer = 0;
  keyW = false; keyS = false;
  keyWprev = false; keySprev = false;
}

function draw() {
  if      (state === "start")      startScreen();
  else if (state === "horse1")     horse1Screen();
  else if (state === "horse2")     horse2Screen();
  else if (state === "horse3")     horse3Screen();
  else if (state === "bet")        betScreen();
  else if (state === "game")       gameScreen();
  else if (state === "directions") directionScreen();
  else if (state === "win")        winScreen();
  else if (state === "lose")       loseScreen();
}

function moveBg() {
  image(bg,  bgx,  bgy,  W, H);
  image(bg2, bg2x, bg2y, W, H);
  bg2x -= sp2;
  bgx  -= sp;
  if (bg2x <= -W) bg2x = W;
  if (bgx  <= -W) bgx  = W;
}

function drawButtonR(buttonx, buttony, buttonw, buttonh, label, labelcolor, color) {
  fill(color);
  stroke(255);
  strokeWeight(1.5);
  rect(buttonx, buttony, buttonw, buttonh, 12);
  noStroke();
  fill(labelcolor);
  textAlign(CENTER, CENTER);
  textSize(20);
  textStyle(BOLD);
  text(label, buttonx + buttonw / 2, buttony + buttonh / 2);
}

function checkClick(buttonx, buttony, buttonw, buttonh) {
  return mouseX > buttonx && mouseX < buttonx + buttonw &&
         mouseY > buttony && mouseY < buttony + buttonh;
}

function pickWinner() {
  let r = random(0, 100);
  if (horsePicked == 'horse1') {
    if      (r <= 50) winner = 'horse1';
    else if (r <= 75) winner = 'horse2';
    else              winner = 'horse3';
  } else if (horsePicked == 'horse2') {
    if      (r <= 50) winner = 'horse2';
    else if (r <= 75) winner = 'horse1';
    else              winner = 'horse3';
  } else if (horsePicked == 'horse3') {
    if      (r <= 50) winner = 'horse3';
    else if (r <= 75) winner = 'horse2';
    else              winner = 'horse1';
  }
}

function startScreen() {
  background(0);
  moveBg();
  textStyle(BOLD);
  textAlign(CENTER);
  textSize(50);
  fill(255);
  stroke(0);
  strokeWeight(6);
  text("RACING", width / 2, 200);

  textSize(20);
  fill(255, 220, 50);
  text("$" + money, width / 2, 240);

  fill(255);
  drawButtonR(width / 2 - 75, height / 2 - 50, 150, 40, "START", 0, 255);
  drawButtonR(25, 25, 140, 35, "DIRECTIONS", 0, 255);
  horseX = horseX + 5;
  image(horse1gif, horseX,       height / 2, 300, 250);
  image(horse2gif, horseX - 150, height / 2 + 55,  300, 250);
  image(horse3gif, horseX - 300, height / 2 + 110, 300, 250);
  if (horseX > 1100) horseX = -450;
}

function horse1Screen() {
  background(0);
  image(bg, W, H);
  fill(255);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("BET ON YOUR HORSE", width / 2, 50);
  drawButtonR(width / 2 - 75, 550, 150, 30, 'THIS ONE', 0, 255);
  drawButtonR(25, 25, 100, 30, "BACK", 0, 255);
  fill(255);
  image(horse1, width / 2 - 600, height / 2 - 350, 1200, 750);
  drawButtonR(675, 550, 100, 30, "NEXT", 0, 255);
  drawHorseStats(0);
}

function horse2Screen() {
  background(0);
  fill(255);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("BET ON YOUR HORSE", width / 2, 50);
  drawButtonR(width / 2 - 75, 550, 150, 30, 'THIS ONE', 0, 255);
  drawButtonR(25, 25, 100, 30, "BACK", 0, 255);
  fill(255);
  image(horse2, width / 2 - 600, height / 2 - 350, 1200, 750);
  drawButtonR(675, 550, 100, 30, "NEXT", 0, 255);
  drawHorseStats(1);
}

function horse3Screen() {
  background(0);
  fill(255);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("BET ON YOUR HORSE", width / 2, 50);
  drawButtonR(width / 2 - 75, 550, 150, 30, 'THIS ONE', 0, 255);
  drawButtonR(25, 25, 100, 30, "BACK", 0, 255);
  fill(255);
  image(horse3, width / 2 - 600, height / 2 - 350, 1200, 750);
  drawHorseStats(2);
}

function drawHorseStats(idx) {
  let statData = [
    { label: 'Blue Horse',   topSpeed: 5, accel: 2, resistance: 3 },
    { label: 'Red Horse',    topSpeed: 4, accel: 5, resistance: 1 },
    { label: 'Yellow Horse', topSpeed: 2, accel: 3, resistance: 5 },
  ];
  let s = statData[idx];
  let bx = 20, by = 460, bw = 160, bh = 70;
  fill(0, 0, 0, 180); noStroke();
  rect(bx, by, bw, bh, 8);
  textSize(11); textStyle(BOLD); fill(255); textAlign(LEFT, TOP);
  text(s.label.toUpperCase(), bx + 8, by + 6);
  drawMiniBar("TOP SPEED",  s.topSpeed,   5, bx + 8, by + 22);
  drawMiniBar("ACCEL",      s.accel,      5, bx + 8, by + 37);
  drawMiniBar("RESISTANCE", s.resistance, 5, bx + 8, by + 52);
}

function drawMiniBar(label, val, maxVal, x, y) {
  fill(160); textSize(9); textStyle(NORMAL); textAlign(LEFT, TOP);
  text(label, x, y);
  fill(50); noStroke(); rect(x + 65, y + 1, 80, 8, 3);
  fill(255, 200, 50); rect(x + 65, y + 1, map(val, 0, maxVal, 0, 80), 8, 3);
}

function betScreen() {
  background(0);
  textStyle(BOLD); textAlign(CENTER, CENTER); textSize(30);
  fill(255); noStroke();
  text("PLACE YOUR BET", width / 2, 70);

  textSize(22); fill(255, 220, 50);
  text("Balance: $" + money, width / 2, 115);

  let opts = [10, 25, 50];
  for (let i = 0; i < opts.length; i++) {
    let bx = width / 2 - 195 + i * 130;
    let active = (betAmount === opts[i]);
    fill(active ? color(50, 180, 80) : color(60));
    stroke(255); strokeWeight(1.5);
    rect(bx, 160, 110, 50, 10);
    noStroke(); fill(255);
    textSize(22); textStyle(BOLD); textAlign(CENTER, CENTER);
    text("$" + opts[i], bx + 55, 185);
  }

  textSize(16); fill(180); noStroke(); textAlign(CENTER, CENTER);
  if (betAmount > 0) {
    text("Bet: $" + betAmount + "   Win returns: $" + (money - betAmount + betAmount * 2), width / 2, 235);
    drawButtonR(width / 2 - 75, 270, 150, 40, "RACE!", 0, 255);
  } else {
    text("Pick a bet amount above", width / 2, 235);
  }

  let idx = ['horse1','horse2','horse3'].indexOf(horsePicked);
  let gifs = [horse1gif, horse2gif, horse3gif];
  image(gifs[idx], width / 2 - 150, 320, 300, 250);

  drawButtonR(25, 25, 100, 30, "BACK", 0, 255);
}

function gameScreen() {
  background(0);
  sp = 9; sp2 = 9;
  moveBg();

  // Countdown
  if (!raceStarted) {
    if (countdownStart === 0) countdownStart = millis();
    let elapsed = (millis() - countdownStart) / 1000;
    let cd = 3 - floor(elapsed);
    if (cd > 0) {
      fill(0, 0, 0, 160); noStroke(); rect(0, 0, W, H);
      textStyle(BOLD); textAlign(CENTER, CENTER);
      textSize(120); fill(255, 220, 50); stroke(0); strokeWeight(8);
      text(cd, W / 2, H / 2);
      return;
    } else if (elapsed < 4) {
      fill(0, 0, 0, 160); noStroke(); rect(0, 0, W, H);
      textStyle(BOLD); textAlign(CENTER, CENTER);
      textSize(80); fill(50, 255, 100); stroke(0); strokeWeight(6);
      text("GO!", W / 2, H / 2);
      return;
    } else {
      raceStarted = true;
    }
  }

  // W/S lane switching
  let playerHorse = horses.find(h => h.name === horsePicked);
  let wNow = keyIsDown(87) || keyIsDown(UP_ARROW);
  let sNow = keyIsDown(83) || keyIsDown(DOWN_ARROW);
  if (wNow && !keyWprev && playerHorse && !raceOver) {
    playerHorse.lane = max(0, playerHorse.lane - 1);
    playerHorse.y = LANE_Y[playerHorse.lane];
  }
  if (sNow && !keySprev && playerHorse && !raceOver) {
    playerHorse.lane = min(2, playerHorse.lane + 1);
    playerHorse.y = LANE_Y[playerHorse.lane];
  }
  keyWprev = wNow;
  keySprev = sNow;

  // Spawn obstacles — use LANE_OB_Y so they sit at the visual center of the horse GIF
  if (frameCount % 90 === 0 && !raceOver) {
    let lane = floor(random(3));
    let obstacleTypes = [
      { label: 'Rock',  emoji: '🪨', hp: 3, maxHp: 3, col: [120, 100, 80] },
      { label: 'Mud',   emoji: '🟫', hp: 5, maxHp: 5, col: [100, 70,  40] },
      { label: 'Fence', emoji: '🚧', hp: 8, maxHp: 8, col: [220, 100, 30] },
    ];
    let t = random(obstacleTypes);
    // x starts off right edge; y = visual center of that lane
    obstacles.push({ x: W + 40, y: LANE_OB_Y[lane], lane: lane,
                     label: t.label, emoji: t.emoji,
                     hp: t.hp, maxHp: t.maxHp, col: t.col });
  }

  // Spawn power-ups — same fix
  if (frameCount % 160 === 0 && !raceOver) {
    let lane = floor(random(3));
    let puTypes = [
      { type: 'boost',  emoji: '⭐' },
      { type: 'shield', emoji: '🛡️' },
      { type: 'freeze', emoji: '❄️' },
    ];
    let t = random(puTypes);
    powerUps.push({ x: W + 40, y: LANE_OB_Y[lane], lane: lane,
                    type: t.type, emoji: t.emoji });
  }

  // Draw & move obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let ob = obstacles[i];
    ob.x -= 3;

    fill(ob.col[0], ob.col[1], ob.col[2]);
    stroke(255); strokeWeight(1);
    rect(ob.x - 22, ob.y - 18, 44, 36, 5);
    noStroke(); fill(255);
    textSize(18); textAlign(CENTER, CENTER); textStyle(NORMAL);
    text(ob.emoji, ob.x, ob.y);
    fill(60); rect(ob.x - 18, ob.y + 20, 36, 6, 3);
    fill(200, 60, 60); rect(ob.x - 18, ob.y + 20, 36 * (ob.hp / ob.maxHp), 6, 3);

    // Collision: compare ob.lane to playerHorse.lane (lane index, not y)
    if (playerHorse && !raceOver && ob.lane === playerHorse.lane &&
        ob.x < playerHorse.x + 200 && ob.x > playerHorse.x - 10) {
      if (playerHorse.shielded) {
        obstacles.splice(i, 1);
        continue;
      }
      playerHorse.hitTimer = 80;
    }
    if (ob.x < -60) obstacles.splice(i, 1);
  }

  // Click obstacles to smash
  if (mouseIsPressed && playerHorse && !raceOver) {
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let ob = obstacles[i];
      if (dist(mouseX, mouseY, ob.x, ob.y) < 30) {
        ob.hp -= playerHorse.resistance * 2;
        if (ob.hp <= 0) {
          obstacles.splice(i, 1);
          if (playerHorse) playerHorse.hitTimer = 0;
        }
      }
    }
  }

  // Draw & move power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    let pu = powerUps[i];
    pu.x -= 2.5;

    noFill(); stroke(255, 220, 50, 160); strokeWeight(2);
    ellipse(pu.x, pu.y, 38, 38);
    noStroke(); fill(255);
    textSize(20); textAlign(CENTER, CENTER); textStyle(NORMAL);
    text(pu.emoji, pu.x, pu.y);

    // Collect: same lane index check
    if (playerHorse && !raceOver && pu.lane === playerHorse.lane &&
        pu.x < playerHorse.x + 200 && pu.x > playerHorse.x - 10) {
      if (pu.type === 'boost')  { playerHorse.boosted = true;  playerHorse.boostTimer  = 180; }
      if (pu.type === 'shield') { playerHorse.shielded = true; playerHorse.shieldTimer = 240; }
      if (pu.type === 'freeze') { freezeTimer = 180; }
      powerUps.splice(i, 1);
      continue;
    }
    if (pu.x < -60) powerUps.splice(i, 1);
  }

  if (freezeTimer > 0) freezeTimer--;

  // Move & draw horses
  for (let h of horses) {
    let isPlayer = (h.name === horsePicked);
    let isFrozen = (freezeTimer > 0 && !isPlayer);

    if (!isFrozen && !raceOver) {
      if (h.hitTimer > 0) {
        h.hitTimer--;
        h.currentSpeed = max(0, h.currentSpeed - 0.015);
      } else {
        let target = (h.name === winner) ? h.maxSpeed * 1.15 : h.maxSpeed * 0.85;
        if (isPlayer && h.boosted) target = h.maxSpeed * 1.6;
        h.currentSpeed = min(target, h.currentSpeed + h.accel + random(-0.008, 0.008));
      }
      h.x += h.currentSpeed;
    }

    if (h.boostTimer  > 0) { h.boostTimer--;  if (h.boostTimer  <= 0) h.boosted  = false; }
    if (h.shieldTimer > 0) { h.shieldTimer--; if (h.shieldTimer <= 0) h.shielded = false; }

    if (h.shielded) {
      noFill(); stroke(50, 150, 220, 160 + sin(frameCount * 0.2) * 60);
      strokeWeight(4); ellipse(h.x + 150, h.y + 65, 340, 140);
    }
    if (h.boosted && isPlayer) {
      noFill(); stroke(255, 220, 50, 120);
      strokeWeight(3); rect(h.x - 4, h.y - 60, 310, 140, 8);
    }

    // Draw horses exactly as original (y - 60)
    if (h.name === "horse1") image(horse1gif, h.x, h.y - 60, 300, 250);
    if (h.name === "horse2") image(horse2gif, h.x, h.y - 60, 300, 250);
    if (h.name === "horse3") image(horse3gif, h.x, h.y - 60, 300, 250);

    if (isPlayer) {
      noStroke(); fill(255, 220, 50);
      textSize(13); textStyle(BOLD); textAlign(CENTER, BOTTOM);
      text("YOU ▼", h.x + 150, h.y - 62);
    }

    if (h.x > width - 150 && !raceOver) {
      raceOver = true;
      if (h.name === horsePicked) {
        money = money - betAmount + betAmount * 2;
        state = "win";
      } else {
        money = money - betAmount;
        state = "lose";
      }
    }
  }

  // HUD
  noStroke(); fill(0, 0, 0, 150); rect(0, 0, W, 34);
  fill(255, 220, 50); textSize(14); textStyle(BOLD); textAlign(LEFT, CENTER);
  text("$" + money, 10, 17);
  fill(200); textAlign(CENTER, CENTER);
  text("Bet: $" + betAmount, W / 2, 17);
  fill(120, 220, 120); textAlign(RIGHT, CENTER);
  text("W/S to dodge  |  Click obstacles!", W - 10, 17);
}

function winScreen() {
  background(0);
  textStyle(BOLD);
  textAlign(CENTER);
  textSize(50);
  fill(255);
  stroke(0);
  strokeWeight(6);
  text("YOU WON!", width / 2, 160);
  textSize(22); fill(255, 220, 50); noStroke();
  text("Balance: $" + money, width / 2, 220);
  drawButtonR(width / 2 - 75, height / 2 - 50, 150, 40, "PLAY AGAIN", 0, 255);
}

function loseScreen() {
  background(0);
  textStyle(BOLD);
  textAlign(CENTER);
  textSize(50);
  fill(255);
  stroke(0);
  strokeWeight(6);
  text("YOU LOST", width / 2, 160);
  textSize(22); fill(220, 100, 100); noStroke();
  text("Balance: $" + money, width / 2, 220);
  if (money <= 0) {
    textSize(18); fill(180);
    text("No money left — resetting to $100", width / 2, 255);
  }
  drawButtonR(width / 2 - 75, height / 2 - 50, 150, 40, "PLAY AGAIN", 0, 255);
}

function directionScreen() {
  background(66, 185, 245);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  textSize(50);
  fill(255);
  text("DIRECTIONS", width / 2, 50);
  drawButtonR(25, 25, 100, 30, "BACK", 0, 255);

  textSize(18); textStyle(NORMAL); fill(0, 0, 60);
  let lines = [
    "Pick a horse — each has unique stats!",
    "Place a bet: $10, $25, or $50.",
    "Press W / S (or arrow keys) to dodge obstacles.",
    "Click obstacles to smash them faster!",
    "Collect power-ups: ⭐ Boost  🛡️ Shield  ❄️ Freeze",
    "Win the race to double your bet!",
  ];
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], width / 2, 130 + i * 48);
  }
}

function mousePressed() {
  if (state === "start") {
    if (checkClick(width / 2 - 75, height / 2 - 50, 150, 40)) {
      state = "horse1";
    } else if (checkClick(25, 25, 140, 40)) {
      state = "directions";
    }
  }
  else if (state === "directions") {
    if (checkClick(25, 25, 100, 30)) state = "start";
  }
  else if (state === "horse1") {
    if (checkClick(25, 25, 100, 30))                          state = "start";
    else if (checkClick(675, 550, 100, 30))                   state = "horse2";
    else if (checkClick(width / 2 - 75, 550, 150, 30)) {
      horsePicked = 'horse1';
      betAmount = 0;
      state = "bet";
    }
  }
  else if (state === "horse2") {
    if (checkClick(25, 25, 100, 30))                          state = "horse1";
    else if (checkClick(675, 550, 100, 30))                   state = "horse3";
    else if (checkClick(width / 2 - 75, 550, 150, 30)) {
      horsePicked = 'horse2';
      betAmount = 0;
      state = "bet";
    }
  }
  else if (state === "horse3") {
    if (checkClick(25, 25, 100, 30))                          state = "horse2";
    else if (checkClick(width / 2 - 75, 550, 150, 30)) {
      horsePicked = 'horse3';
      betAmount = 0;
      state = "bet";
    }
  }
  else if (state === "bet") {
    if (checkClick(25, 25, 100, 30)) {
      state = horsePicked;
    }
    let opts = [10, 25, 50];
    for (let i = 0; i < opts.length; i++) {
      let bx = width / 2 - 195 + i * 130;
      if (checkClick(bx, 160, 110, 50)) {
        if (money >= opts[i]) betAmount = opts[i];
      }
    }
    if (betAmount > 0 && checkClick(width / 2 - 75, 270, 150, 40)) {
      resetRace();
      pickWinner();
      state = "game";
    }
  }
  else if (state === "win" || state === "lose") {
    if (checkClick(width / 2 - 75, height / 2 - 50, 150, 40)) {
      if (money <= 0) money = 100;
      betAmount = 0;
      state = "start";
      horseX = W / 2 - 470;
    }
  }
}