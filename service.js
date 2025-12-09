// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ----- WALLS (array of rectangles) -----
const walls = [
    // outer border (thickness 20)
    { x: 0,   y: 0,   w: 700, h: 20 },
    { x: 0,   y: 680, w: 700, h: 20 },
    { x: 0,   y: 0,   w: 20,  h: 700 },
    { x: 680, y: 0,   w: 20,  h: 700 },

    // some inner maze-like walls (example)
    { x: 60,  y: 60,  w: 580, h: 20 },
    { x: 60,  y: 60,  w: 20,  h: 180 },
    { x: 120, y: 140, w: 460, h: 20 },
    { x: 120, y: 140, w: 20,  h: 280 },
    { x: 180, y: 260, w: 340, h: 20 },
    { x: 500, y: 140, w: 20,  h: 280 },
    { x: 240, y: 200, w: 160, h: 20 },
    { x: 360, y: 300, w: 20,  h: 120 }
];

// ----- PAC-MAN -----
let pacX = 40;         // start position (outside walls)
let pacY = 40;
let pacSize = 12;      // radius
let pacSpeed = 1; //speed default nya
let pacDirection = "RIGHT"; // "LEFT","UP","DOWN"

// input: set direction on keydown
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") pacDirection = "RIGHT";
    if (e.key === "ArrowLeft")  pacDirection = "LEFT";
    if (e.key === "ArrowUp")    pacDirection = "UP";
    if (e.key === "ArrowDown")  pacDirection = "DOWN";
});

// ----- DRAW WALLS -----
function drawWalls() {
    ctx.fillStyle = "#2b6cff"; // blue walls
    for (const w of walls) {
        ctx.fillRect(w.x, w.y, w.w, w.h);
    }
}

// ----- CIRCLE vs RECT COLLISION -----
function circleRectCollision(cx, cy, r, rect) {
    // find closest point from circle center to rectangle
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) <= (r * r);
}

function isCollidingAny(cx, cy) {
    for (const r of walls) {
        if (circleRectCollision(cx, cy, pacSize, r)) return true;
    }
    return false;
}

let mouthAngle = 0.2;
let mouthDelta = 0.01; //kecepatan mengunyah

// ----- DRAW PAC-MAN -----
function drawPacman() {
    ctx.beginPath();
    ctx.fillStyle = "yellow";



    let startAngle ;
    let endAngle ;

    // set mouth orientation by angles
    if (pacDirection === "RIGHT") {
        startAngle = mouthAngle * Math.PI;
        endAngle   = (2- mouthAngle)* Math.PI;
    } else if (pacDirection === "LEFT") {
        startAngle = (1+ mouthAngle) * Math.PI;
        endAngle   = (1-mouthAngle) * Math.PI;
    } else if (pacDirection === "UP") {
        startAngle = (1.5 + mouthAngle) * Math.PI;
        endAngle   = (1.5 - mouthAngle) * Math.PI;
    } else if (pacDirection === "DOWN") {
        startAngle = (0.5 + mouthAngle) * Math.PI;
        endAngle   = (0.5 - mouthAngle) * Math.PI;
    }

    ctx.arc(pacX, pacY, pacSize, startAngle, endAngle);
    ctx.lineTo(pacX, pacY);
    ctx.fill();
    ctx.closePath();
}


//fungsi update mouth

function updateMouth(){
    mouthAngle += mouthDelta;
    if (mouthAngle > 0.35 || mouthAngle < 0.05) {
        mouthDelta *= -1;
    }
}

// ----- UPDATE PAC-MAN (with collision) -----
// move by axis separately so Pac-man can slide along walls
function updatePacman() {
    // compute intended moves
    const moveX = pacDirection === "RIGHT" ? pacSpeed : pacDirection === "LEFT" ? -pacSpeed : 0;
    const moveY = pacDirection === "DOWN"  ? pacSpeed : pacDirection === "UP"   ? -pacSpeed : 0;

    // try X movement first
    const nextX = pacX + moveX;
    if (!isCollidingAny(nextX, pacY)) {
        pacX = nextX;
    } // else keep pacX (blocked)

    // then Y
    const nextY = pacY + moveY;
    if (!isCollidingAny(pacX, nextY)) {
        pacY = nextY;
    } // else keep pacY (blocked)

    // safety clamp inside canvas (should be redundant because walls include border)
    pacX = Math.max(pacSize, Math.min(canvas.width - pacSize, pacX));
    pacY = Math.max(pacSize, Math.min(canvas.height - pacSize, pacY));
}

// ----- MAIN LOOP -----
function loop() {
    // update first (so drawing uses the latest pos)
    updatePacman();
    updateMouth();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWalls();
    drawPacman();

    requestAnimationFrame(loop);
}

loop();
