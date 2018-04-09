(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const COLLISION_GROUPS = [0x0,
  0x1, 0x2, 0x4, 0x8]
  //0x10, 0x20, 0x40, 0x80,
  //0x100, 0x200, 0x400, 0x800,
  //0x1000, 0x2000, 0x4000, 0x8000];
const NO_COLLISION = COLLISION_GROUPS[0];
const C_GROUP1 = COLLISION_GROUPS[1];
const C_GROUP2 = COLLISION_GROUPS[2];
const C_GROUP3 = COLLISION_GROUPS[3];
const C_GROUP4 = COLLISION_GROUPS[4];
//const C_GROUP5 = COLLISION_GROUPS[5];

class CollisionDetector{

  constructor(){
    console.log('CollisionDetector initializing');
  }

  can_collide(obj1, obj2){

  }

  aabb_2_aabb_can_collide(aabb1, aabb2){

  }

  circle_2_aabb_can_collide(c, aabb){

  }

  cicle_2_bound_can_collide(c, b){

  }

  aabb_2_bound_can_collide(aabb, b){

  }

}

module.exports = CollisionDetector;
module.exports.NO_COLLISION = NO_COLLISION;
module.exports.C_GROUP1 = C_GROUP1;
module.exports.C_GROUP2 = C_GROUP2;
module.exports.C_GROUP3 = C_GROUP3;
module.exports.C_GROUP4 = C_GROUP4;

},{}],2:[function(require,module,exports){
class GameObject{
  constructor(collision_group){
    this.collision_group = collision_group;
  }



}
module.exports = GameObject;

},{}],3:[function(require,module,exports){
exports.hello = () => console.log('say hello to Test.js!');

},{}],4:[function(require,module,exports){
var canvas = document.getElementById("game_field");
var ctx = canvas.getContext('2d');

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
//document.addEventListener("keypress", keyPressHandler, false);

game_length = 1000;
current_game_tick = 0;
state_history = {};
ending_tick = 0;

game_started = false;
paused = false;
pause_start_at = 0;
total_paused = 0;
game_ended = false;
game_end_with_status = '';

GAME_WON_STATUS = 'win';
GAME_LOST_STATUS = 'lost';
IN_GAME_STATUS = 'in_game';

var friction = 0.001;
var acceleration = 0.03;
var fuel_efficiency = 5;
var state = {
  'pos_x': 10,
  'pos_y': 200,
  't_pos_x': 400,
  't_pos_y': 80,
  'f_pos_x': 0,
  'f_pos_y': 0,
  'radius': 5,
  'win_dist': 15,
  'v_x': 1,
  'v_y': 1,
  'a_x': 0,
  'a_y': 0,
  'field_width': canvas.width,
  'field_height': canvas.height,
  'field_top_left_x': 0,
  'field_top_left_y': 50,
}

var time_bar_width = 100;
var time_bar = {
  'width': time_bar_width,
  'height': 30,
  'pos_x': canvas.width - 10 - time_bar_width,
  'pos_y': 10,
  'fill': time_bar_width
}

var fuel_bar_width = 100;
var fuel_bar = {
  'width': fuel_bar_width,
  'height': 30,
  'pos_x': canvas.width - 10 - time_bar_width - fuel_bar_width - 10,
  'pos_y': 10,
  'fill': fuel_bar_width
}

function update_time_bar(){
  time_bar['fill'] = time_bar_width - (current_game_tick * time_bar_width / game_length);
}

function render_fuel_bar(ctx, fuel_bar){
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.rect(fuel_bar['pos_x'], fuel_bar['pos_y'], fuel_bar['width'], fuel_bar['height']);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = 'red';
  ctx.rect(fuel_bar['pos_x'] + 1, fuel_bar['pos_y'] + 1, fuel_bar['fill'] - 2, fuel_bar['height'] - 2);
  ctx.fill();
  ctx.closePath();
}

function render_time_bar(ctx, time_bar){
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.rect(time_bar['pos_x'], time_bar['pos_y'], time_bar['width'], time_bar['height']);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = 'grey';
  ctx.rect(time_bar['pos_x'] + 1, time_bar['pos_y'] + 1, time_bar['fill'] - 2, time_bar['height'] - 2);
  ctx.fill();
  ctx.closePath();
}

function render_game_end(ctx, status){
  var ending_text = 'You Win!';
  if(status == GAME_LOST_STATUS){
    ending_text = 'You lost!';
  }
  ctx.font = "30px Arial";
  ctx.fillText(ending_text, canvas.width / 2, canvas.height / 2);
}



var moves = {
  "ArrowDown": false,
  "ArrowUp": false,
  "ArrowLeft": false,
  "ArrowRight": false
}

function keyDownHandler(e){
  if(e.code in moves){
    moves[e.code] = true;
    if(fuel_bar['fill'] >= fuel_efficiency){
      switch(e.code){
        case "ArrowUp":
          state['a_y'] -= acceleration;
          break;
        case "ArrowDown":
          state['a_y'] += acceleration;
          break;
        case "ArrowLeft":
          state['a_x'] -= acceleration;
          break;
        case "ArrowRight":
          state['a_x'] += acceleration;
          break;
      }
      fuel_bar['fill'] -= fuel_efficiency;
    }else{
      fuel_bar['fill'] = 0;
    }
    state_prediction();
  }
}

function keyUpHandler(e){
  if(e.code in moves){
    moves[e.code] = false;
    switch(e.code){
      case "ArrowUp":
        state['a_y'] = 0;
        break;
      case "ArrowDown":
        state['a_y'] = 0;
        break;
      case "ArrowLeft":
        state['a_x'] = 0;
        break;
      case "ArrowRight":
        state['a_x'] = 0;
        break;
    }
    state_prediction();
  }
}

var min_velocity = 0.003;
function check_stopped(state){
  return Math.abs(state['v_x']) <= min_velocity && Math.abs(state['v_y']) <= min_velocity;
}

function state_prediction(){
  var state_copy = root_clone(state);
  state_history[current_game_tick] = state;
  var i = current_game_tick;
  while((Math.abs(state_copy['v_x']) > 0.003 || Math.abs(state_copy['v_y']) > 0.003) && i < game_length){
    state_copy = physics_engine_step(state_copy, undefined);
    state_history[i] = state_copy;
    i++;
  }
  ending_tick = i - 1;
}

function renderer(state){
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  render_time_bar(ctx, time_bar);
  render_fuel_bar(ctx, fuel_bar);

  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.rect(state['field_top_left_x'], state['field_top_left_y'], state['field_width'], state['field_height'] - state['field_top_left_y']);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.rect(100, 100, 30, 30);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = 'black';
  ctx.arc(state['pos_x'], state['pos_y'], state['radius'], 0, 2*Math.PI);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.setLineDash([2]);
  ctx.arc(state['f_pos_x'], state['f_pos_y'], state['radius'], 0, 2*Math.PI);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'red';
  ctx.arc(state['t_pos_x'], state['t_pos_y'], state['radius']*2, 0, 2*Math.PI);
  ctx.stroke();
  ctx.closePath();

  if(game_ended){
    render_game_end(ctx, game_end_with_status);
  }
  ctx.restore();
}

function check_game_end(state){
  var dist_to_goal = Math.sqrt(Math.pow(state['pos_x'] - state['t_pos_x'], 2) + Math.pow(state['pos_y'] - state['t_pos_y'], 2));
  if(current_game_tick >= game_length){
    if(dist_to_goal > state['win_dist']){
      return GAME_LOST_STATUS;
    }else{
      return GAME_WON_STATUS;
    }
  }else{
    if(check_stopped(state)  && dist_to_goal <= state['win_dist']){
      return GAME_WON_STATUS;
    }else if(check_stopped(state) && fuel_bar['fill'] < fuel_efficiency){
      return GAME_LOST_STATUS;
    }else{
      return IN_GAME_STATUS;
    }
  }
}

function mainLoop(){
  if(!game_started){
    game_started = true;
    state_prediction();
  }
  var game_end_status = check_game_end(state);
  if(game_end_status == IN_GAME_STATUS){
    if(current_game_tick < game_length){
      state['f_pos_x'] = state_history[ending_tick]['pos_x'];
      state['f_pos_y'] = state_history[ending_tick]['pos_y'];
      state = physics_engine_step(state, undefined);
      renderer(state);
      current_game_tick += 1;
    }
  }else{
    game_ended = true;
    game_end_with_status = game_end_status;
    renderer(state);
    //console.log(state);
    //var dist_to_goal = Math.sqrt(Math.pow(state['pos_x'] - state['t_pos_x'],2) + Math.pow(state['pos_y'] - state['t_pos_y'],2));
    //console.log(dist_to_goal);
  }
}



function root_clone(obj){
  var clone = {};
  for(var key in obj){
    clone[key] = obj[key];
  }
  return clone;
}

min_speed = 0.003;
/* state:
{'v_x': 1,
 'v_y': 1,
 'a_x': 0.1,
 'a_y': 0.1,
 'pos_x': 10,
 'pos_y': 10,
 'radius': 5,
 'field_width': 600,
 'field_height': 600,
 'num_of_ticks': 6000
}
*/
function physics_engine_step(state, renderer){
  var state_copy = root_clone(state);
  state_copy['pos_x'] += state_copy['v_x'];
  state_copy['pos_y'] += state_copy['v_y'];
  state_copy['v_x'] += state_copy['a_x'];
  state_copy['v_y'] += state_copy['a_y'];
  state_copy['v_x'] > 0 ? state_copy['v_x'] -= friction : state_copy['v_x'] += friction;
  state_copy['v_y'] > 0 ? state_copy['v_y'] -= friction : state_copy['v_y'] += friction;
  if(Math.abs(state_copy['v_x']) <= min_speed){
    state_copy['v_x'] = 0;
  }
  if(Math.abs(state_copy['v_y']) <= min_speed){
    state_copy['v_y'] = 0;
  }

  // rect[x, y, width, height]
  var list_of_rects = [];
  list_of_rects.push([state['field_top_left_x'], state['field_top_left_y'], state['field_width'], state['field_height'] - state['field_top_left_y']])
  list_of_rects.push([100, 100, 30, 30]);
  var ball_center = [state_copy['pos_x'], state_copy['pos_y']];
  var ball_radius = state_copy['radius'];

  for(var i = 0 ; i < list_of_rects.length ; i ++){
    var rect = list_of_rects[i];
    var left_x = rect[0];
    var right_x = rect[0] + rect[2];
    var top_y = rect[1];
    var bottom_y = rect[1] + rect[3];
    if(ball_center[1] > top_y
      && ball_center[1] < bottom_y
      &&( Math.abs(ball_center[0] - left_x) <= ball_radius 
        || Math.abs(right_x - ball_center[0]) <= ball_radius)){
      state_copy['v_x'] *= -1;
    }
    if(ball_center[0] > left_x
      && ball_center[0] < right_x
      &&( Math.abs(ball_center[1] - top_y) <= ball_radius 
      || Math.abs(bottom_y - ball_center[1]) <= ball_radius)){
      state_copy['v_y'] *= -1;
    }
  }
  if(renderer !== undefined){
    renderer(state_copy);
  }
  update_time_bar();
  return state_copy;
}

console.log('start!');

var tjs = require('./Test.js');
tjs.hello();

var GameObject = require('./GameObject.js');
var go = new GameObject('name', 123);

var CD = require('./CollisionDetector.js');
var cd = new CD();
console.log(CD.NO_COLLISION);


setInterval(mainLoop, 10);

},{"./CollisionDetector.js":1,"./GameObject.js":2,"./Test.js":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQ29sbGlzaW9uRGV0ZWN0b3IuanMiLCJzcmMvR2FtZU9iamVjdC5qcyIsInNyYy9UZXN0LmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgQ09MTElTSU9OX0dST1VQUyA9IFsweDAsXG4gIDB4MSwgMHgyLCAweDQsIDB4OF1cbiAgLy8weDEwLCAweDIwLCAweDQwLCAweDgwLFxuICAvLzB4MTAwLCAweDIwMCwgMHg0MDAsIDB4ODAwLFxuICAvLzB4MTAwMCwgMHgyMDAwLCAweDQwMDAsIDB4ODAwMF07XG5jb25zdCBOT19DT0xMSVNJT04gPSBDT0xMSVNJT05fR1JPVVBTWzBdO1xuY29uc3QgQ19HUk9VUDEgPSBDT0xMSVNJT05fR1JPVVBTWzFdO1xuY29uc3QgQ19HUk9VUDIgPSBDT0xMSVNJT05fR1JPVVBTWzJdO1xuY29uc3QgQ19HUk9VUDMgPSBDT0xMSVNJT05fR1JPVVBTWzNdO1xuY29uc3QgQ19HUk9VUDQgPSBDT0xMSVNJT05fR1JPVVBTWzRdO1xuLy9jb25zdCBDX0dST1VQNSA9IENPTExJU0lPTl9HUk9VUFNbNV07XG5cbmNsYXNzIENvbGxpc2lvbkRldGVjdG9ye1xuXG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgY29uc29sZS5sb2coJ0NvbGxpc2lvbkRldGVjdG9yIGluaXRpYWxpemluZycpO1xuICB9XG5cbiAgY2FuX2NvbGxpZGUob2JqMSwgb2JqMil7XG5cbiAgfVxuXG4gIGFhYmJfMl9hYWJiX2Nhbl9jb2xsaWRlKGFhYmIxLCBhYWJiMil7XG5cbiAgfVxuXG4gIGNpcmNsZV8yX2FhYmJfY2FuX2NvbGxpZGUoYywgYWFiYil7XG5cbiAgfVxuXG4gIGNpY2xlXzJfYm91bmRfY2FuX2NvbGxpZGUoYywgYil7XG5cbiAgfVxuXG4gIGFhYmJfMl9ib3VuZF9jYW5fY29sbGlkZShhYWJiLCBiKXtcblxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb25EZXRlY3Rvcjtcbm1vZHVsZS5leHBvcnRzLk5PX0NPTExJU0lPTiA9IE5PX0NPTExJU0lPTjtcbm1vZHVsZS5leHBvcnRzLkNfR1JPVVAxID0gQ19HUk9VUDE7XG5tb2R1bGUuZXhwb3J0cy5DX0dST1VQMiA9IENfR1JPVVAyO1xubW9kdWxlLmV4cG9ydHMuQ19HUk9VUDMgPSBDX0dST1VQMztcbm1vZHVsZS5leHBvcnRzLkNfR1JPVVA0ID0gQ19HUk9VUDQ7XG4iLCJjbGFzcyBHYW1lT2JqZWN0e1xuICBjb25zdHJ1Y3Rvcihjb2xsaXNpb25fZ3JvdXApe1xuICAgIHRoaXMuY29sbGlzaW9uX2dyb3VwID0gY29sbGlzaW9uX2dyb3VwO1xuICB9XG5cblxuXG59XG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPYmplY3Q7XG4iLCJleHBvcnRzLmhlbGxvID0gKCkgPT4gY29uc29sZS5sb2coJ3NheSBoZWxsbyB0byBUZXN0LmpzIScpO1xuIiwidmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZV9maWVsZFwiKTtcbnZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwga2V5RG93bkhhbmRsZXIsIGZhbHNlKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBrZXlVcEhhbmRsZXIsIGZhbHNlKTtcbi8vZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGtleVByZXNzSGFuZGxlciwgZmFsc2UpO1xuXG5nYW1lX2xlbmd0aCA9IDEwMDA7XG5jdXJyZW50X2dhbWVfdGljayA9IDA7XG5zdGF0ZV9oaXN0b3J5ID0ge307XG5lbmRpbmdfdGljayA9IDA7XG5cbmdhbWVfc3RhcnRlZCA9IGZhbHNlO1xucGF1c2VkID0gZmFsc2U7XG5wYXVzZV9zdGFydF9hdCA9IDA7XG50b3RhbF9wYXVzZWQgPSAwO1xuZ2FtZV9lbmRlZCA9IGZhbHNlO1xuZ2FtZV9lbmRfd2l0aF9zdGF0dXMgPSAnJztcblxuR0FNRV9XT05fU1RBVFVTID0gJ3dpbic7XG5HQU1FX0xPU1RfU1RBVFVTID0gJ2xvc3QnO1xuSU5fR0FNRV9TVEFUVVMgPSAnaW5fZ2FtZSc7XG5cbnZhciBmcmljdGlvbiA9IDAuMDAxO1xudmFyIGFjY2VsZXJhdGlvbiA9IDAuMDM7XG52YXIgZnVlbF9lZmZpY2llbmN5ID0gNTtcbnZhciBzdGF0ZSA9IHtcbiAgJ3Bvc194JzogMTAsXG4gICdwb3NfeSc6IDIwMCxcbiAgJ3RfcG9zX3gnOiA0MDAsXG4gICd0X3Bvc195JzogODAsXG4gICdmX3Bvc194JzogMCxcbiAgJ2ZfcG9zX3knOiAwLFxuICAncmFkaXVzJzogNSxcbiAgJ3dpbl9kaXN0JzogMTUsXG4gICd2X3gnOiAxLFxuICAndl95JzogMSxcbiAgJ2FfeCc6IDAsXG4gICdhX3knOiAwLFxuICAnZmllbGRfd2lkdGgnOiBjYW52YXMud2lkdGgsXG4gICdmaWVsZF9oZWlnaHQnOiBjYW52YXMuaGVpZ2h0LFxuICAnZmllbGRfdG9wX2xlZnRfeCc6IDAsXG4gICdmaWVsZF90b3BfbGVmdF95JzogNTAsXG59XG5cbnZhciB0aW1lX2Jhcl93aWR0aCA9IDEwMDtcbnZhciB0aW1lX2JhciA9IHtcbiAgJ3dpZHRoJzogdGltZV9iYXJfd2lkdGgsXG4gICdoZWlnaHQnOiAzMCxcbiAgJ3Bvc194JzogY2FudmFzLndpZHRoIC0gMTAgLSB0aW1lX2Jhcl93aWR0aCxcbiAgJ3Bvc195JzogMTAsXG4gICdmaWxsJzogdGltZV9iYXJfd2lkdGhcbn1cblxudmFyIGZ1ZWxfYmFyX3dpZHRoID0gMTAwO1xudmFyIGZ1ZWxfYmFyID0ge1xuICAnd2lkdGgnOiBmdWVsX2Jhcl93aWR0aCxcbiAgJ2hlaWdodCc6IDMwLFxuICAncG9zX3gnOiBjYW52YXMud2lkdGggLSAxMCAtIHRpbWVfYmFyX3dpZHRoIC0gZnVlbF9iYXJfd2lkdGggLSAxMCxcbiAgJ3Bvc195JzogMTAsXG4gICdmaWxsJzogZnVlbF9iYXJfd2lkdGhcbn1cblxuZnVuY3Rpb24gdXBkYXRlX3RpbWVfYmFyKCl7XG4gIHRpbWVfYmFyWydmaWxsJ10gPSB0aW1lX2Jhcl93aWR0aCAtIChjdXJyZW50X2dhbWVfdGljayAqIHRpbWVfYmFyX3dpZHRoIC8gZ2FtZV9sZW5ndGgpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJfZnVlbF9iYXIoY3R4LCBmdWVsX2Jhcil7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgY3R4LnJlY3QoZnVlbF9iYXJbJ3Bvc194J10sIGZ1ZWxfYmFyWydwb3NfeSddLCBmdWVsX2Jhclsnd2lkdGgnXSwgZnVlbF9iYXJbJ2hlaWdodCddKTtcbiAgY3R4LnN0cm9rZSgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguZmlsbFN0eWxlID0gJ3JlZCc7XG4gIGN0eC5yZWN0KGZ1ZWxfYmFyWydwb3NfeCddICsgMSwgZnVlbF9iYXJbJ3Bvc195J10gKyAxLCBmdWVsX2JhclsnZmlsbCddIC0gMiwgZnVlbF9iYXJbJ2hlaWdodCddIC0gMik7XG4gIGN0eC5maWxsKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyX3RpbWVfYmFyKGN0eCwgdGltZV9iYXIpe1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gIGN0eC5yZWN0KHRpbWVfYmFyWydwb3NfeCddLCB0aW1lX2JhclsncG9zX3knXSwgdGltZV9iYXJbJ3dpZHRoJ10sIHRpbWVfYmFyWydoZWlnaHQnXSk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmZpbGxTdHlsZSA9ICdncmV5JztcbiAgY3R4LnJlY3QodGltZV9iYXJbJ3Bvc194J10gKyAxLCB0aW1lX2JhclsncG9zX3knXSArIDEsIHRpbWVfYmFyWydmaWxsJ10gLSAyLCB0aW1lX2JhclsnaGVpZ2h0J10gLSAyKTtcbiAgY3R4LmZpbGwoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJfZ2FtZV9lbmQoY3R4LCBzdGF0dXMpe1xuICB2YXIgZW5kaW5nX3RleHQgPSAnWW91IFdpbiEnO1xuICBpZihzdGF0dXMgPT0gR0FNRV9MT1NUX1NUQVRVUyl7XG4gICAgZW5kaW5nX3RleHQgPSAnWW91IGxvc3QhJztcbiAgfVxuICBjdHguZm9udCA9IFwiMzBweCBBcmlhbFwiO1xuICBjdHguZmlsbFRleHQoZW5kaW5nX3RleHQsIGNhbnZhcy53aWR0aCAvIDIsIGNhbnZhcy5oZWlnaHQgLyAyKTtcbn1cblxuXG5cbnZhciBtb3ZlcyA9IHtcbiAgXCJBcnJvd0Rvd25cIjogZmFsc2UsXG4gIFwiQXJyb3dVcFwiOiBmYWxzZSxcbiAgXCJBcnJvd0xlZnRcIjogZmFsc2UsXG4gIFwiQXJyb3dSaWdodFwiOiBmYWxzZVxufVxuXG5mdW5jdGlvbiBrZXlEb3duSGFuZGxlcihlKXtcbiAgaWYoZS5jb2RlIGluIG1vdmVzKXtcbiAgICBtb3Zlc1tlLmNvZGVdID0gdHJ1ZTtcbiAgICBpZihmdWVsX2JhclsnZmlsbCddID49IGZ1ZWxfZWZmaWNpZW5jeSl7XG4gICAgICBzd2l0Y2goZS5jb2RlKXtcbiAgICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgICBzdGF0ZVsnYV95J10gLT0gYWNjZWxlcmF0aW9uO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiQXJyb3dEb3duXCI6XG4gICAgICAgICAgc3RhdGVbJ2FfeSddICs9IGFjY2VsZXJhdGlvbjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIkFycm93TGVmdFwiOlxuICAgICAgICAgIHN0YXRlWydhX3gnXSAtPSBhY2NlbGVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJBcnJvd1JpZ2h0XCI6XG4gICAgICAgICAgc3RhdGVbJ2FfeCddICs9IGFjY2VsZXJhdGlvbjtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGZ1ZWxfYmFyWydmaWxsJ10gLT0gZnVlbF9lZmZpY2llbmN5O1xuICAgIH1lbHNle1xuICAgICAgZnVlbF9iYXJbJ2ZpbGwnXSA9IDA7XG4gICAgfVxuICAgIHN0YXRlX3ByZWRpY3Rpb24oKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBrZXlVcEhhbmRsZXIoZSl7XG4gIGlmKGUuY29kZSBpbiBtb3Zlcyl7XG4gICAgbW92ZXNbZS5jb2RlXSA9IGZhbHNlO1xuICAgIHN3aXRjaChlLmNvZGUpe1xuICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgc3RhdGVbJ2FfeSddID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dEb3duXCI6XG4gICAgICAgIHN0YXRlWydhX3knXSA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93TGVmdFwiOlxuICAgICAgICBzdGF0ZVsnYV94J10gPSAwO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJBcnJvd1JpZ2h0XCI6XG4gICAgICAgIHN0YXRlWydhX3gnXSA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBzdGF0ZV9wcmVkaWN0aW9uKCk7XG4gIH1cbn1cblxudmFyIG1pbl92ZWxvY2l0eSA9IDAuMDAzO1xuZnVuY3Rpb24gY2hlY2tfc3RvcHBlZChzdGF0ZSl7XG4gIHJldHVybiBNYXRoLmFicyhzdGF0ZVsndl94J10pIDw9IG1pbl92ZWxvY2l0eSAmJiBNYXRoLmFicyhzdGF0ZVsndl95J10pIDw9IG1pbl92ZWxvY2l0eTtcbn1cblxuZnVuY3Rpb24gc3RhdGVfcHJlZGljdGlvbigpe1xuICB2YXIgc3RhdGVfY29weSA9IHJvb3RfY2xvbmUoc3RhdGUpO1xuICBzdGF0ZV9oaXN0b3J5W2N1cnJlbnRfZ2FtZV90aWNrXSA9IHN0YXRlO1xuICB2YXIgaSA9IGN1cnJlbnRfZ2FtZV90aWNrO1xuICB3aGlsZSgoTWF0aC5hYnMoc3RhdGVfY29weVsndl94J10pID4gMC4wMDMgfHwgTWF0aC5hYnMoc3RhdGVfY29weVsndl95J10pID4gMC4wMDMpICYmIGkgPCBnYW1lX2xlbmd0aCl7XG4gICAgc3RhdGVfY29weSA9IHBoeXNpY3NfZW5naW5lX3N0ZXAoc3RhdGVfY29weSwgdW5kZWZpbmVkKTtcbiAgICBzdGF0ZV9oaXN0b3J5W2ldID0gc3RhdGVfY29weTtcbiAgICBpKys7XG4gIH1cbiAgZW5kaW5nX3RpY2sgPSBpIC0gMTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyZXIoc3RhdGUpe1xuICBjdHguc2F2ZSgpO1xuICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgcmVuZGVyX3RpbWVfYmFyKGN0eCwgdGltZV9iYXIpO1xuICByZW5kZXJfZnVlbF9iYXIoY3R4LCBmdWVsX2Jhcik7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICBjdHgucmVjdChzdGF0ZVsnZmllbGRfdG9wX2xlZnRfeCddLCBzdGF0ZVsnZmllbGRfdG9wX2xlZnRfeSddLCBzdGF0ZVsnZmllbGRfd2lkdGgnXSwgc3RhdGVbJ2ZpZWxkX2hlaWdodCddIC0gc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3knXSk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgY3R4LnJlY3QoMTAwLCAxMDAsIDMwLCAzMCk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gIGN0eC5hcmMoc3RhdGVbJ3Bvc194J10sIHN0YXRlWydwb3NfeSddLCBzdGF0ZVsncmFkaXVzJ10sIDAsIDIqTWF0aC5QSSk7XG4gIGN0eC5maWxsKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gIGN0eC5zZXRMaW5lRGFzaChbMl0pO1xuICBjdHguYXJjKHN0YXRlWydmX3Bvc194J10sIHN0YXRlWydmX3Bvc195J10sIHN0YXRlWydyYWRpdXMnXSwgMCwgMipNYXRoLlBJKTtcbiAgY3R4LnN0cm9rZSgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc2V0TGluZURhc2goW10pO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAncmVkJztcbiAgY3R4LmFyYyhzdGF0ZVsndF9wb3NfeCddLCBzdGF0ZVsndF9wb3NfeSddLCBzdGF0ZVsncmFkaXVzJ10qMiwgMCwgMipNYXRoLlBJKTtcbiAgY3R4LnN0cm9rZSgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgaWYoZ2FtZV9lbmRlZCl7XG4gICAgcmVuZGVyX2dhbWVfZW5kKGN0eCwgZ2FtZV9lbmRfd2l0aF9zdGF0dXMpO1xuICB9XG4gIGN0eC5yZXN0b3JlKCk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrX2dhbWVfZW5kKHN0YXRlKXtcbiAgdmFyIGRpc3RfdG9fZ29hbCA9IE1hdGguc3FydChNYXRoLnBvdyhzdGF0ZVsncG9zX3gnXSAtIHN0YXRlWyd0X3Bvc194J10sIDIpICsgTWF0aC5wb3coc3RhdGVbJ3Bvc195J10gLSBzdGF0ZVsndF9wb3NfeSddLCAyKSk7XG4gIGlmKGN1cnJlbnRfZ2FtZV90aWNrID49IGdhbWVfbGVuZ3RoKXtcbiAgICBpZihkaXN0X3RvX2dvYWwgPiBzdGF0ZVsnd2luX2Rpc3QnXSl7XG4gICAgICByZXR1cm4gR0FNRV9MT1NUX1NUQVRVUztcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBHQU1FX1dPTl9TVEFUVVM7XG4gICAgfVxuICB9ZWxzZXtcbiAgICBpZihjaGVja19zdG9wcGVkKHN0YXRlKSAgJiYgZGlzdF90b19nb2FsIDw9IHN0YXRlWyd3aW5fZGlzdCddKXtcbiAgICAgIHJldHVybiBHQU1FX1dPTl9TVEFUVVM7XG4gICAgfWVsc2UgaWYoY2hlY2tfc3RvcHBlZChzdGF0ZSkgJiYgZnVlbF9iYXJbJ2ZpbGwnXSA8IGZ1ZWxfZWZmaWNpZW5jeSl7XG4gICAgICByZXR1cm4gR0FNRV9MT1NUX1NUQVRVUztcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBJTl9HQU1FX1NUQVRVUztcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFpbkxvb3AoKXtcbiAgaWYoIWdhbWVfc3RhcnRlZCl7XG4gICAgZ2FtZV9zdGFydGVkID0gdHJ1ZTtcbiAgICBzdGF0ZV9wcmVkaWN0aW9uKCk7XG4gIH1cbiAgdmFyIGdhbWVfZW5kX3N0YXR1cyA9IGNoZWNrX2dhbWVfZW5kKHN0YXRlKTtcbiAgaWYoZ2FtZV9lbmRfc3RhdHVzID09IElOX0dBTUVfU1RBVFVTKXtcbiAgICBpZihjdXJyZW50X2dhbWVfdGljayA8IGdhbWVfbGVuZ3RoKXtcbiAgICAgIHN0YXRlWydmX3Bvc194J10gPSBzdGF0ZV9oaXN0b3J5W2VuZGluZ190aWNrXVsncG9zX3gnXTtcbiAgICAgIHN0YXRlWydmX3Bvc195J10gPSBzdGF0ZV9oaXN0b3J5W2VuZGluZ190aWNrXVsncG9zX3knXTtcbiAgICAgIHN0YXRlID0gcGh5c2ljc19lbmdpbmVfc3RlcChzdGF0ZSwgdW5kZWZpbmVkKTtcbiAgICAgIHJlbmRlcmVyKHN0YXRlKTtcbiAgICAgIGN1cnJlbnRfZ2FtZV90aWNrICs9IDE7XG4gICAgfVxuICB9ZWxzZXtcbiAgICBnYW1lX2VuZGVkID0gdHJ1ZTtcbiAgICBnYW1lX2VuZF93aXRoX3N0YXR1cyA9IGdhbWVfZW5kX3N0YXR1cztcbiAgICByZW5kZXJlcihzdGF0ZSk7XG4gICAgLy9jb25zb2xlLmxvZyhzdGF0ZSk7XG4gICAgLy92YXIgZGlzdF90b19nb2FsID0gTWF0aC5zcXJ0KE1hdGgucG93KHN0YXRlWydwb3NfeCddIC0gc3RhdGVbJ3RfcG9zX3gnXSwyKSArIE1hdGgucG93KHN0YXRlWydwb3NfeSddIC0gc3RhdGVbJ3RfcG9zX3knXSwyKSk7XG4gICAgLy9jb25zb2xlLmxvZyhkaXN0X3RvX2dvYWwpO1xuICB9XG59XG5cblxuXG5mdW5jdGlvbiByb290X2Nsb25lKG9iail7XG4gIHZhciBjbG9uZSA9IHt9O1xuICBmb3IodmFyIGtleSBpbiBvYmope1xuICAgIGNsb25lW2tleV0gPSBvYmpba2V5XTtcbiAgfVxuICByZXR1cm4gY2xvbmU7XG59XG5cbm1pbl9zcGVlZCA9IDAuMDAzO1xuLyogc3RhdGU6XG57J3ZfeCc6IDEsXG4gJ3ZfeSc6IDEsXG4gJ2FfeCc6IDAuMSxcbiAnYV95JzogMC4xLFxuICdwb3NfeCc6IDEwLFxuICdwb3NfeSc6IDEwLFxuICdyYWRpdXMnOiA1LFxuICdmaWVsZF93aWR0aCc6IDYwMCxcbiAnZmllbGRfaGVpZ2h0JzogNjAwLFxuICdudW1fb2ZfdGlja3MnOiA2MDAwXG59XG4qL1xuZnVuY3Rpb24gcGh5c2ljc19lbmdpbmVfc3RlcChzdGF0ZSwgcmVuZGVyZXIpe1xuICB2YXIgc3RhdGVfY29weSA9IHJvb3RfY2xvbmUoc3RhdGUpO1xuICBzdGF0ZV9jb3B5Wydwb3NfeCddICs9IHN0YXRlX2NvcHlbJ3ZfeCddO1xuICBzdGF0ZV9jb3B5Wydwb3NfeSddICs9IHN0YXRlX2NvcHlbJ3ZfeSddO1xuICBzdGF0ZV9jb3B5Wyd2X3gnXSArPSBzdGF0ZV9jb3B5WydhX3gnXTtcbiAgc3RhdGVfY29weVsndl95J10gKz0gc3RhdGVfY29weVsnYV95J107XG4gIHN0YXRlX2NvcHlbJ3ZfeCddID4gMCA/IHN0YXRlX2NvcHlbJ3ZfeCddIC09IGZyaWN0aW9uIDogc3RhdGVfY29weVsndl94J10gKz0gZnJpY3Rpb247XG4gIHN0YXRlX2NvcHlbJ3ZfeSddID4gMCA/IHN0YXRlX2NvcHlbJ3ZfeSddIC09IGZyaWN0aW9uIDogc3RhdGVfY29weVsndl95J10gKz0gZnJpY3Rpb247XG4gIGlmKE1hdGguYWJzKHN0YXRlX2NvcHlbJ3ZfeCddKSA8PSBtaW5fc3BlZWQpe1xuICAgIHN0YXRlX2NvcHlbJ3ZfeCddID0gMDtcbiAgfVxuICBpZihNYXRoLmFicyhzdGF0ZV9jb3B5Wyd2X3knXSkgPD0gbWluX3NwZWVkKXtcbiAgICBzdGF0ZV9jb3B5Wyd2X3knXSA9IDA7XG4gIH1cblxuICAvLyByZWN0W3gsIHksIHdpZHRoLCBoZWlnaHRdXG4gIHZhciBsaXN0X29mX3JlY3RzID0gW107XG4gIGxpc3Rfb2ZfcmVjdHMucHVzaChbc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3gnXSwgc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3knXSwgc3RhdGVbJ2ZpZWxkX3dpZHRoJ10sIHN0YXRlWydmaWVsZF9oZWlnaHQnXSAtIHN0YXRlWydmaWVsZF90b3BfbGVmdF95J11dKVxuICBsaXN0X29mX3JlY3RzLnB1c2goWzEwMCwgMTAwLCAzMCwgMzBdKTtcbiAgdmFyIGJhbGxfY2VudGVyID0gW3N0YXRlX2NvcHlbJ3Bvc194J10sIHN0YXRlX2NvcHlbJ3Bvc195J11dO1xuICB2YXIgYmFsbF9yYWRpdXMgPSBzdGF0ZV9jb3B5WydyYWRpdXMnXTtcblxuICBmb3IodmFyIGkgPSAwIDsgaSA8IGxpc3Rfb2ZfcmVjdHMubGVuZ3RoIDsgaSArKyl7XG4gICAgdmFyIHJlY3QgPSBsaXN0X29mX3JlY3RzW2ldO1xuICAgIHZhciBsZWZ0X3ggPSByZWN0WzBdO1xuICAgIHZhciByaWdodF94ID0gcmVjdFswXSArIHJlY3RbMl07XG4gICAgdmFyIHRvcF95ID0gcmVjdFsxXTtcbiAgICB2YXIgYm90dG9tX3kgPSByZWN0WzFdICsgcmVjdFszXTtcbiAgICBpZihiYWxsX2NlbnRlclsxXSA+IHRvcF95XG4gICAgICAmJiBiYWxsX2NlbnRlclsxXSA8IGJvdHRvbV95XG4gICAgICAmJiggTWF0aC5hYnMoYmFsbF9jZW50ZXJbMF0gLSBsZWZ0X3gpIDw9IGJhbGxfcmFkaXVzIFxuICAgICAgICB8fCBNYXRoLmFicyhyaWdodF94IC0gYmFsbF9jZW50ZXJbMF0pIDw9IGJhbGxfcmFkaXVzKSl7XG4gICAgICBzdGF0ZV9jb3B5Wyd2X3gnXSAqPSAtMTtcbiAgICB9XG4gICAgaWYoYmFsbF9jZW50ZXJbMF0gPiBsZWZ0X3hcbiAgICAgICYmIGJhbGxfY2VudGVyWzBdIDwgcmlnaHRfeFxuICAgICAgJiYoIE1hdGguYWJzKGJhbGxfY2VudGVyWzFdIC0gdG9wX3kpIDw9IGJhbGxfcmFkaXVzIFxuICAgICAgfHwgTWF0aC5hYnMoYm90dG9tX3kgLSBiYWxsX2NlbnRlclsxXSkgPD0gYmFsbF9yYWRpdXMpKXtcbiAgICAgIHN0YXRlX2NvcHlbJ3ZfeSddICo9IC0xO1xuICAgIH1cbiAgfVxuICBpZihyZW5kZXJlciAhPT0gdW5kZWZpbmVkKXtcbiAgICByZW5kZXJlcihzdGF0ZV9jb3B5KTtcbiAgfVxuICB1cGRhdGVfdGltZV9iYXIoKTtcbiAgcmV0dXJuIHN0YXRlX2NvcHk7XG59XG5cbmNvbnNvbGUubG9nKCdzdGFydCEnKTtcblxudmFyIHRqcyA9IHJlcXVpcmUoJy4vVGVzdC5qcycpO1xudGpzLmhlbGxvKCk7XG5cbnZhciBHYW1lT2JqZWN0ID0gcmVxdWlyZSgnLi9HYW1lT2JqZWN0LmpzJyk7XG52YXIgZ28gPSBuZXcgR2FtZU9iamVjdCgnbmFtZScsIDEyMyk7XG5cbnZhciBDRCA9IHJlcXVpcmUoJy4vQ29sbGlzaW9uRGV0ZWN0b3IuanMnKTtcbnZhciBjZCA9IG5ldyBDRCgpO1xuY29uc29sZS5sb2coQ0QuTk9fQ09MTElTSU9OKTtcblxuXG5zZXRJbnRlcnZhbChtYWluTG9vcCwgMTApO1xuIl19
