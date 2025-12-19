const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("scoreText");
const recipeModal = document.getElementById("recipeModal");

// --- 1. 圖片載入設定 ---
let loadedImages = 0;
const totalImages = 5;
function imageLoaded() {
    loadedImages++;
    // 當所有圖片都載入完成後，才開始遊戲迴圈
    if (loadedImages === totalImages) {
        gameLoop();
    }
}

const bearImg = new Image();
bearImg.src = "images/bear.png"; // 這裡放你的 gif 或 png
bearImg.onload = imageLoaded;

const bgImg = new Image();
bgImg.src = "images/bg.jpg"; 
bgImg.onload = imageLoaded;

const goodImg = new Image();
goodImg.src = "images/mushroom_good.png";
goodImg.onload = imageLoaded;

const poisonImg = new Image();
poisonImg.src = "images/mushroom_bad.png";
poisonImg.onload = imageLoaded;

const logImg = new Image();
logImg.src = "images/log.png";
logImg.onload = imageLoaded;

// --- 2. 遊戲變數 ---
let score = 0;
let isGameOver = false;
let obstacles = [];
let spawnTimer = 0;

// --- 3. 小熊物件 ---
let bear = {
    x: 80,
    y: 260,
    width: 80,   // 根據你的圖片調整大小
    height: 120,
    dy: 0,
    jumpForce: 13,
    gravity: 0.7,
    groundY: 260,
    isJumping: false,
    isFacingLeft: false // 控制水平翻轉的關鍵變數
};

// --- 4. 監聽按鍵 ---
window.addEventListener("keydown", (e) => {
    if (isGameOver) return;

    // 跳躍
    if (e.code === "Space" && !bear.isJumping) {
        bear.dy = -bear.jumpForce;
        bear.isJumping = true;
    }

    // 改變方向 (水平翻轉測試)
    if (e.code === "ArrowLeft") {
        bear.isFacingLeft = true;
    }
    if (e.code === "ArrowRight") {
        bear.isFacingLeft = false;
    }
});

// --- 5. 產生障礙物 ---
function spawnObstacle() {
    let typeRand = Math.random();
    let newObj = {
        x: 850,
        y: 320,
        width: 50,
        height: 50,
        speed: 6 + (score / 500)
    };

    if (typeRand < 0.4) {
        newObj.type = "good";
        newObj.img = goodImg;
    } else if (typeRand < 0.7) {
        newObj.type = "poison";
        newObj.img = poisonImg;
    } else {
        newObj.type = "trash";
        newObj.img = logImg;
        newObj.y = 330; 
    }
    obstacles.push(newObj);
}

// --- 6. 核心更新邏輯 ---
function update() {
    if (isGameOver) return;

    bear.dy += bear.gravity;
    bear.y += bear.dy;
    if (bear.y > bear.groundY) {
        bear.y = bear.groundY;
        bear.dy = 0;
        bear.isJumping = false;
    }

    spawnTimer++;
    if (spawnTimer > 80) {
        spawnObstacle();
        spawnTimer = 0;
    }

    for (let i = 0; i < obstacles.length; i++) {
        let o = obstacles[i];
        o.x -= o.speed;

        // 碰撞偵測 (稍微縮小判定範圍，比較好玩)
        if (
            bear.x < o.x + o.width - 10 &&
            bear.x + bear.width > o.x + 10 &&
            bear.y < o.y + o.height &&
            bear.y + bear.height > o.y
        ) {
            handleCollision(o.type);
            obstacles.splice(i, 1);
            i--;
            continue;
        }

        if (o.x + o.width < 0) {
            obstacles.splice(i, 1);
            i--;
        }
    }
}

function handleCollision(type) {
    if (type === "good") score += 100;
    else if (type === "trash") score -= 50;
    else if (type === "poison") endGame("噢不！你誤食了毒菇死亡...");
    
    scoreText.innerText = score;
    if (score >= 1000) winGame();
}

// --- 7. 繪製畫面 (包含水平翻轉邏輯) ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // A. 畫背景
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // B. 畫小熊 (處理水平翻轉)
    ctx.save(); // 儲存目前的畫布狀態
    if (bear.isFacingLeft) {
        // 翻轉邏輯：移動到物體中心 -> 縮放 -1 -> 畫圖
        ctx.translate(bear.x + bear.width / 2, bear.y + bear.height / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(bearImg, -bear.width / 2, -bear.height / 2, bear.width, bear.height);
    } else {
        ctx.drawImage(bearImg, bear.x, bear.y, bear.width, bear.height);
    }
    ctx.restore(); // 恢復畫布，確保接下來的東西不會被翻轉

    // C. 畫森林物件
    for (let o of obstacles) {
        ctx.drawImage(o.img, o.x, o.y, o.width, o.height);
    }
}

function endGame(msg) {
    isGameOver = true;
    setTimeout(() => {
        alert(msg + "\n你的分數: " + score);
        location.reload();
    }, 100);
}

function winGame() {
    isGameOver = true;
    recipeModal.style.display = "flex";
}

function gameLoop() {
    update();
    draw();
    if (!isGameOver) requestAnimationFrame(gameLoop);
}

// 初始提示（避免圖片還沒載好時一片黑）
ctx.fillStyle = "black";
ctx.fillRect(0,0,canvas.width, canvas.height);
ctx.fillStyle = "white";
ctx.fillText("載入中...", 380, 200);