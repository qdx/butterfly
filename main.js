var canvas = document.getElementById("game_field");
var ctx = canvas.getContext('2d');

pos_x = 10;
pos_y = 10;
v_x = 1;
v_y = 1;
a_x = 0.1;
a_y = 0.1;
radius = 5;
game_length = 60000;

game_started = false;
start_time = -1;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

var moves = {
  "ArrowDown": false,
  "ArrowUp": false,
  "ArrowLeft": false,
  "ArrowRight": false
}

function keyDownHandler(e){
  if(e.code in moves){
    moves[e.code] = true;
  }
}

function keyUpHandler(e){
  if(e.code in moves){
    moves[e.code] = false;
  }
}

function drawCircle(){
  ctx.beginPath();
  ctx.arc(pos_x, pos_y, radius, 0, 2*Math.PI);
  ctx.fill();
  ctx.closePath();
}

function predict(){

}

function mainLoop(){
  if(!game_started){
    game_started = true;
    start_time = (new Date()).getTime();
    // TODO: implmenet a tick based system to overcome the 
    // timeing issue.
    // only move the ball at each tick

  }
  if(moves["ArrowUp"]){
    v_y -= a_y;
  }
  if(moves["ArrowDown"]){
    v_y += a_y;
  }
  if(moves["ArrowLeft"]){
    v_x -= a_x;
  }
  if(moves["ArrowRight"]){
    v_x += a_x;
  }
  pos_x += v_x;
  pos_y += v_y;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCircle();
}

setInterval(mainLoop, 10);
