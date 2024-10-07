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
    const INITIAL_Y_SPEED = 5;
    const INITIAL_X_SPEED = 1;

    const gameOverSound = new Audio ('./audio/gameover.mp3');
    const pop1 = new Audio ('./audio/pop(1).mp3');
    const pop2 = new Audio ('./audio/pop(2).mp3');
    const pop3 = new Audio ('./audio/pop(3).mp3');
    const pops = [pop1, pop2, pop3];

    let boxes = [];
    let debris = {x:0, y:0, width:0};
    let scrollCounter, cameraY, current, mode, xSpeed, ySpeed;
    
    // Nueva variable para controlar el sonido
    let hasPlayedSound = false;

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
        gameOverSound.play(); 
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

        // Cuando se crea una nueva caja, permitimos reproducir el sonido de nuevo
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

        xSpeed = xSpeed + 0.2;
        current++;
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
            xSpeed *= -1;
        }
    }

    function triggerFall() {
        mode = MODES.FALL;
    
        // Reproduce el sonido solo si no se ha reproducido ya
        if (!hasPlayedSound) {
            const randomIndex = Math.floor(Math.random() * pops.length);
            pops[randomIndex].currentTime = 0; // Reinicia el audio
            pops[randomIndex].play(); // Reproduce el sonido
            hasPlayedSound = true; // Evita que se reproduzca más de una vez
        }
    }

    document.addEventListener('keydown', (event) => {
        if(event.key == ' ' && mode == MODES.BOUNCE){
            mode = MODES.FALL;

            // Reproduce el sonido solo si no se ha reproducido ya
            if (!hasPlayedSound) {
                const randomIndex = Math.floor(Math.random() * pops.length);
                pops[randomIndex].currentTime = 0;
                pops[randomIndex].play();
                hasPlayedSound = true;  // Evita que se reproduzca más de una vez
            }
        }
    });

    function triggerFall() {
        if (!hasPlayedSound) {
            const randomIndex = Math.floor(Math.random() * pops.length);
            pops[randomIndex].currentTime = 0;
            pops[randomIndex].play();
            hasPlayedSound = true;  
        }
    }

    document.addEventListener('mousedown', (event) => {
        if(event.button == 0 && mode == MODES.BOUNCE){
            mode = MODES.FALL;
            triggerFall()
        }
    });

    canvas.onpointerdown = () => {
        if (mode == MODES.GAMEOVER){
            restart(); 
        } else if (mode == MODES.BOUNCE){
            mode = MODES.FALL;
            triggerFall()
        }
    }

    restart();
}
