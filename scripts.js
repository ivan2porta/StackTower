window.onload = function(){

    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d");

    const MODES = {
        FALL: 'fall',
        BOUNCE: 'bounce',
        GAMEOVER: 'gameover'
    }

    const INITIAL_BOX_WIDTH = 300;
    const INITIAL_BOX_Y = 500;

    const BOX_HEIGHT = 45;
    const INITIAL_Y_SPEED = 8;
    const INITIAL_X_SPEED = 2;

    const gameOverSound = new Audio ('./audio/gameover.mp3');
    const pop1 = new Audio ('./audio/pop(1).mp3');
    const pop2 = new Audio ('./audio/pop(2).mp3');
    const pop3 = new Audio ('./audio/pop(3).mp3');
    const pops = [pop1, pop2, pop3];
    let hasPlayedSound = false;
    let enableSound = true;

    let boxes = [];
    let debris = {x:0, y:0, width:0};
    let scrollCounter, cameraY, current, mode, xSpeed, ySpeed;

    const muteButtonMobile = document.getElementsByClassName("muteSound")[0];
    const unmuteButtonMobile = document.getElementsByClassName("unmuteSound")[0];
    const muteButton = document.getElementsByClassName("muteSound")[1];
    const unmuteButton = document.getElementsByClassName("unmuteSound")[1];

    const gameOverOverlay = document.getElementById("gameOverOverlay");

    document.addEventListener('keydown', (event) => {
        if(event.key == ' ' && mode == MODES.BOUNCE){
            mode = MODES.FALL;
            triggerFall();
        }
    });

    gameOverOverlay.addEventListener('click', (event) =>{
        restart();
    });

    muteButton.addEventListener('click', (event) =>{
        muteButton.classList.remove('visible');
        muteButton.classList.add('invisible');
        unmuteButton.classList.remove('invisible');
        unmuteButton.classList.add('visible');
        enableSound = false;
        hasPlayedSound = false;
    });

    unmuteButton.addEventListener('click', (event) =>{
        unmuteButton.classList.remove('visible');
        unmuteButton.classList.add('invisible');
        muteButton.classList.remove('invisible');
        muteButton.classList.add('visible');
        enableSound = true;
    });

    muteButtonMobile.addEventListener('click', (event) =>{
        muteButtonMobile.classList.remove('visible');
        muteButtonMobile.classList.add('invisible');
        unmuteButtonMobile.classList.remove('invisible');
        unmuteButtonMobile.classList.add('visible');
        enableSound = false;
        hasPlayedSound = false;
    });

    unmuteButtonMobile.addEventListener('click', (event) =>{
        unmuteButtonMobile.classList.remove('visible');
        unmuteButtonMobile.classList.add('invisible');
        muteButtonMobile.classList.remove('invisible');
        muteButtonMobile.classList.add('visible');
        enableSound = true;
    });

    canvas.addEventListener('click', (event) => {
        if (mode == MODES.GAMEOVER){
            restart(); 
        } else if (mode == MODES.BOUNCE){
            mode = MODES.FALL;
            triggerFall();
        }
    });

    function createStepColor(step) {
        const pastelColors = [
            '#f7909f', '#e2647f', '#d1698c', '#e8555f', '#da332a', '#fe672a',
            '#ff7a34', '#ffb22c', '#83ba69', '#4ca64e', '#2a897e', '#287f91',
            '#62b0dc', '#6492cb', '#4975c4', '#3b4f93', '#32436f', '#5f5395',
            '#6f4483'
        ];

        const randomIndex = Math.floor(Math.random() * pastelColors.length);
        return pastelColors[randomIndex];
    }

    function updateCamera(){
        if(scrollCounter > 0){
            cameraY++;
            scrollCounter--;
        }
    }

    function gameOver(){
        if(enableSound == true){
            gameOverSound.play(); 
        }
        mode = MODES.GAMEOVER;

        context.filter = 'blur(3px)'; 
        drawBackground(); 
        drawBoxes(); 
        drawDebris(); 

        context.filter = 'none'; 
        document.getElementById("gameOverOverlay").style.display = "block";
    }

    function initializeGameState(){
        boxes = [{
            x: canvas.width / 2 - INITIAL_BOX_WIDTH / 2,
            y: 50,
            width: INITIAL_BOX_WIDTH,
            color: "white"
        }];

        debris = {x:0, y:0, width:0};
        current = 1;
        mode = MODES.BOUNCE;
        xSpeed = INITIAL_X_SPEED;
        ySpeed = INITIAL_Y_SPEED;
        scrollCounter = 0;
        cameraY = 0;

        createNewBox();
    }

    function restart(){
        initializeGameState();
        draw();
        document.getElementById("gameOverOverlay").style.display = "none"; 
        document.getElementById("score").textContent = "0";
    }

    function draw(){
        if (mode == MODES.GAMEOVER) return;

        drawBackground();
        drawBoxes();
        drawDebris();

        if(mode == MODES.BOUNCE) {
            moveAndDetectCollision();
        } else if (mode == MODES.FALL){
            updateFallMode();
        }

        debris.y -= ySpeed;
        updateCamera();

        window.requestAnimationFrame(draw);
    }

    function drawBackground(){
        context.fillStyle = '#402525';
        context.fillRect(0,0,canvas.width,canvas.height);
    }

    function drawBoxes() {
        boxes.forEach((box) => {
            const { x, y, width, color } = box;
            const newY = INITIAL_BOX_Y - y + cameraY;

            context.fillStyle = color;
            context.fillRect(x, newY, width, BOX_HEIGHT);
        });
    }

    function drawDebris() {
        const { x, y, width } = debris;
        const newY = INITIAL_BOX_Y - y + cameraY;

        context.fillStyle = boxes[current - 1].color;
        context.fillRect(x, newY, width, BOX_HEIGHT);
    }

    function createNewBox(){
        boxes[current] = {
            x: 0,
            y: (current + 10) * BOX_HEIGHT,
            width: boxes[current - 1].width,
            color: createStepColor()
        };

        hasPlayedSound = false;
    }

    function createNewDebris(difference){
        const currentBox = boxes[current];
        const previousBox = boxes[current - 1];

        const debrisX = currentBox.x > previousBox.x 
            ? currentBox.x + currentBox.width
            : currentBox.x;

        debris = {
            x: debrisX,
            y: currentBox.y,
            width: difference
        };
    }

    function updateFallMode(){
        const currentBox = boxes[current];
        currentBox.y -= ySpeed;

        const positionPreviousBox = boxes[current - 1].y + BOX_HEIGHT;

        if(currentBox.y == positionPreviousBox){
            handleBoxLanding();
        }
    }

    function adjustCurrentBox(difference) {
        const currentBox = boxes[current];
        const previousBox = boxes[current - 1];

        if (currentBox.x > previousBox.x) {
            currentBox.width -= difference;
        } else {
            currentBox.width += difference;
            currentBox.x = previousBox.x;
        }
    }

    function handleBoxLanding(){
        const currentBox = boxes[current];
        const previousBox = boxes[current - 1];

        const difference = currentBox.x - previousBox.x;

        if (Math.abs(difference) >= currentBox.width){
            gameOver();
            return;
        }

        adjustCurrentBox(difference);
        createNewDebris(difference);

        
        current++;
        if ((xSpeed < 0 && xSpeed > -2) || (xSpeed > 0 && xSpeed < 2)){
            xSpeed += xSpeed > 0 ? 0.5 : -0.5;
        }
        if ((xSpeed < 0 && xSpeed > -4) || (xSpeed > 0 && xSpeed < 4)){
            xSpeed += xSpeed > 0 ? 0.2 : -0.2;
        }
        if ((xSpeed < 0 && xSpeed > -6) || (xSpeed > 0 && xSpeed < 6)){
            xSpeed += xSpeed > 0 ? 0.1 : -0.1;
        }
        console.log (xSpeed);
        scrollCounter = BOX_HEIGHT;
        mode = MODES.BOUNCE;

        score.textContent = current - 1;

        createNewBox();
    }

    function moveAndDetectCollision(){
        const currentBox = boxes[current];
        currentBox.x += xSpeed;

        const isMovingRight = xSpeed > 0;
        const isMovingLeft = xSpeed < 0;

        const hasHitRightSide = currentBox.x + currentBox.width > canvas.width;
        const hasHitLeftSide = currentBox.x < 0;

        if((isMovingRight && hasHitRightSide) || (isMovingLeft && hasHitLeftSide)) {
            xSpeed = -xSpeed;
        }
    }

    function triggerFall() {
        if (enableSound && !hasPlayedSound) {
            const randomIndex = Math.floor(Math.random() * pops.length);
            pops[randomIndex].currentTime = 0;
            pops[randomIndex].play();
        }
    }

    restart();
}
