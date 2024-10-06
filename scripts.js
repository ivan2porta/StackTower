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

const BOX_HEIGHT = 40;
const INITIAL_Y_SPEED = 5;
const INITIAL_X_SPEED = 1;

//STATE
let boxes = [];
let scrollCounter, cameraY, current, mode, xSpeed, ySpeed;

function createStepColor (step){
    if (step == 0) return 'white'

    const red = Math.floor(Math.random() * 255);
    const green = Math.floor(Math.random() * 255);
    const blue = Math.floor(Math.random() * 255);

    return `rgb(${red}, ${green}, ${blue})`;
}

function updateCamera(){
    if(scrollCounter > 0){
        cameraY++;
        scrollCounter--;
    }
}

function initializeGameState(){
    boxes = [{
        x: canvas.width / 2 - INITIAL_BOX_WIDTH / 2,
        y: 50,
        width: INITIAL_BOX_WIDTH,
        color: "white"
    }]

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
}

function draw(){
    if (mode == MODES.GAMEOVER) return

    drawBackground();
    drawBoxes();

    if(mode == MODES.BOUNCE) {
        moveAndDetectCollision();
    } else if (mode == MODES.FALL){
        updateFallMode();
    }

    updateCamera();

    window.requestAnimationFrame(draw);
}

function drawBackground(){
    context.fillStyle = 'black';
    context.fillRect(0,0,canvas.width,canvas.height)
}

function drawBoxes() {
    boxes.forEach((box) => {
        
      const { x, y, width, color } = box;
      const newY = INITIAL_BOX_Y - y + cameraY;

      context.fillStyle = color
      context.fillRect(x, newY, width, BOX_HEIGHT)
    })
  }

  function createNewBox(){
    boxes[current] = {
        x: 0,
        y: (current + 10) * BOX_HEIGHT,
        width: boxes[current -1].width,
        color: createStepColor()
    }
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
    const currentBox = boxes[current]
    const previousBox = boxes[current - 1]

    if (currentBox.x > previousBox.x) {
      currentBox.width -= difference
    } else {
      currentBox.width += difference
      currentBox.x = previousBox.x
    }
  }

  function handleBoxLanding(){
    const currentBox = boxes[current];
    const previousBox = boxes[current - 1];

    const difference = currentBox.x - previousBox.x;

    if (Math.abs(difference) >= currentBox.width){
        mode = MODES.GAMEOVER;
        return;
    }

    adjustCurrentBox(difference);

    xSpeed = xSpeed + 0.2;
    current++;
    scrollCounter = BOX_HEIGHT;
    mode = MODES.BOUNCE;

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

  document.addEventListener('keydown', (event) => {
    if(event.key == ' ' && mode == MODES.BOUNCE){
        mode = MODES.FALL;

    }
  })

  

  restart();

}