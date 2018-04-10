(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Geometry = require('./Geometry.js');

class AABB extends Geometry{
  constructor(min_x, min_y, max_x, max_y){
    super(Geometry.AABB);
    this.min = {};
    this.min.x = min_x;
    this.min.y = min_y;
    this.max = {};
    this.max.x = max_x;
    this.max.y = max_y;
  }
}
module.exports = AABB;

},{"./Geometry.js":5}],2:[function(require,module,exports){
var Geometry = require('./Geometry.js');

class Circle extends Geometry{
  constructor(center_x, center_y, radius){
    super(Geometry.CIRCLE);
    this.center = {};
    this.center.x = center_x;
    this.center.y = center_y;
    this.r = radius;
  }
}
module.exports = Circle;

},{"./Geometry.js":5}],3:[function(require,module,exports){
var Geometry = require('./Geometry.js');

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
    console.log('[CollisionDetector] constructing');
  }

  can_collide(obj1, obj2){
    let group_can_collide = (obj1.collision_group & obj2.collision_group) > 0;
    if(!group_can_collide) return false;

    let collision_type = obj1.collision_body.shape + ':' + obj2.collision_body.shape;
    // FIXME: optimize with bit operation, bit comparison should be much faster than string
    switch(collision_type){
      case Geometry.AABB + ':' + Geometry.AABB:
        return aabb_2_aabb_can_collide(obj1, obj2);
        break;
      case Geometry.CIRCLE + ':' + Geometry.CIRCLE:
        return circle_2_circle_can_collide(obj1, obj2);
        break;
      case Geometry.AABB + ':' + Geometry.CIRCLE:
        return circle_2_aabb_can_collide(obj2, ojb1);
        break;
      case Geometry.CIRCLE + ':' + Geometry.AABB:
        return circle_2_aabb_can_collide(obj1, obj2);
        break;
      case Geometry.CIRCLE + ':' + Geometry.LINE:
        return circle_2_line_can_collide(obj1, obj2);
        break;
      case Geometry.LINE + ':' + Geometry.CIRCLE:
        return circle_2_line_can_collide(obj2, obj1);
        break;
      case Geometry.AABB + ':' + Geometry.LINE:
        return aabb_2_line_can_collide(obj1, obj2);
        break;
      case Geometry.LINE+ ':' + Geometry.AABB:
        return aabb_2_line_can_collide(obj2, obj1);
        break;
      default:
        return false;
    }
  }

  _distance(point1, point2){
    return Math.sqrt(
      Math.pow(point1.x-point2.x, 2)
      + Math.pow(point1.y - point2.y, 2)
    );
  }

  _distance_square(point1, point2){
    return Math.pow(point1.x-point2.x, 2)
      + Math.pow(point1.y - point2.y, 2);
  }

  aabb_2_aabb_can_collide(ab1, ab2){
    let min1 = ab1.collision_body.min;
    let max1 = ab1.collision_body.max;
    let min2 = ab2.collision_body.min;
    let max2 = ab2.collision_body.max;
    return (min1.x <= max2.x && max1.x >= min2.x)
      && (min1.y <= max2.y && max1.y >= min2.y);
  }

  circle_2_circle_can_collide(c1, c2){
    let center1 = c1.collision_body.center;
    let center2 = c2.collision_body.center;
    return _distance_square(center1, center2) <= Math.pow(c1.r + c2.r, 2);
  }

  // return x  when min < x < max, other wise return which ever is closer to x from (min, max)
  _clamp(x, min, max){
    return x < min ? min : x > max ? max : x;
  }

  circle_2_aabb_can_collide(c, ab){
    let center = c.collision_body.center;
    let clamp_x = _clamp(center.x, ab.min.x, ab.max.x);
    let clamp_y = _clamp(center.y, ab.min.y, ab.max.y);

    return Math.abs(center.x - clamp_x) < c.r
      && Math.abs(center.y - clamp_y) < c.r;
  }

  circle_2_line_can_collide(c, l){
    let center = c.collision_body.center;
    switch(l.parallel_to){
      case 'x':
        return Math.abs(center.y - l.pos) < c.r;
        break;
      case 'y':
        return Math.abs(center.x - l.pos) < c.r;
        break;
      default:
        return false;
    }
  }

  aabb_2_line_can_collide(ab, l){
    let min = ab.collision_body.min;
    let max = ab.collision_body.max;
    switch(l.parallel_to){
      case 'x':
        return center.y <= max.y && center.y >= min.y;
        break;
      case 'y':
        return center.x <= max.x && center.x >= min.x;
        break;
      default:
        return false;
    }
  }
}

module.exports = CollisionDetector;
module.exports.NO_COLLISION = NO_COLLISION;
module.exports.C_GROUP1 = C_GROUP1;
module.exports.C_GROUP2 = C_GROUP2;
module.exports.C_GROUP3 = C_GROUP3;
module.exports.C_GROUP4 = C_GROUP4;

},{"./Geometry.js":5}],4:[function(require,module,exports){
class GameObject{
  constructor(collision_group, collision_body){
    console.log('[GameObject] constructing');
    this.collision_group = collision_group;
    this.collision_body = collision_body;
  }
  // aabb should have:
  // min: {x: <>, y:<>}
  // max: {x: <>, y:<>}

  // circle should have:
  // center: {x: <>, y:<>}
  // r: <>

  // lines are infinite line, and should have:
  // parallel_to: ['x'|'y']
  // pos: <>


}
module.exports = GameObject;

},{}],5:[function(require,module,exports){
const LINE = 1;
const AABB = 2;
const CIRCLE = 3;

class Geometry{
  constructor(shape){
    this.shape = shape;
  }
}

module.exports = Geometry;
module.exports.LINE = LINE;
module.exports.AABB = AABB;
module.exports.CIRCLE = CIRCLE;

},{}],6:[function(require,module,exports){
var Geometry = require('./Geometry.js');

class Line extends Geometry{
  constructor(parallel_to, pos){
    super(Geometry.LINE);
    this.body_type = CollisionDetector.C_BODY_LINE;
    this.parallel_to = parallel_to;
    this.pos = pos;
  }
}
module.exports = Line;

},{"./Geometry.js":5}],7:[function(require,module,exports){
exports.hello = () => console.log('say hello to Test.js!');

},{}],8:[function(require,module,exports){
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

var CollisionDetector= require('./CollisionDetector.js');
var cd = new CollisionDetector();
console.log(CollisionDetector.NO_COLLISION);

var AABB = require('./AABB.js');
var Circle = require('./Circle.js');
var Line = require('./Line.js');

var aabb1 = new AABB(10, 10, 20, 20);
console.log(aabb1);

//setInterval(mainLoop, 10);

},{"./AABB.js":1,"./Circle.js":2,"./CollisionDetector.js":3,"./GameObject.js":4,"./Line.js":6,"./Test.js":7}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQUFCQi5qcyIsInNyYy9DaXJjbGUuanMiLCJzcmMvQ29sbGlzaW9uRGV0ZWN0b3IuanMiLCJzcmMvR2FtZU9iamVjdC5qcyIsInNyYy9HZW9tZXRyeS5qcyIsInNyYy9MaW5lLmpzIiwic3JjL1Rlc3QuanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIEdlb21ldHJ5ID0gcmVxdWlyZSgnLi9HZW9tZXRyeS5qcycpO1xuXG5jbGFzcyBBQUJCIGV4dGVuZHMgR2VvbWV0cnl7XG4gIGNvbnN0cnVjdG9yKG1pbl94LCBtaW5feSwgbWF4X3gsIG1heF95KXtcbiAgICBzdXBlcihHZW9tZXRyeS5BQUJCKTtcbiAgICB0aGlzLm1pbiA9IHt9O1xuICAgIHRoaXMubWluLnggPSBtaW5feDtcbiAgICB0aGlzLm1pbi55ID0gbWluX3k7XG4gICAgdGhpcy5tYXggPSB7fTtcbiAgICB0aGlzLm1heC54ID0gbWF4X3g7XG4gICAgdGhpcy5tYXgueSA9IG1heF95O1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IEFBQkI7XG4iLCJ2YXIgR2VvbWV0cnkgPSByZXF1aXJlKCcuL0dlb21ldHJ5LmpzJyk7XG5cbmNsYXNzIENpcmNsZSBleHRlbmRzIEdlb21ldHJ5e1xuICBjb25zdHJ1Y3RvcihjZW50ZXJfeCwgY2VudGVyX3ksIHJhZGl1cyl7XG4gICAgc3VwZXIoR2VvbWV0cnkuQ0lSQ0xFKTtcbiAgICB0aGlzLmNlbnRlciA9IHt9O1xuICAgIHRoaXMuY2VudGVyLnggPSBjZW50ZXJfeDtcbiAgICB0aGlzLmNlbnRlci55ID0gY2VudGVyX3k7XG4gICAgdGhpcy5yID0gcmFkaXVzO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IENpcmNsZTtcbiIsInZhciBHZW9tZXRyeSA9IHJlcXVpcmUoJy4vR2VvbWV0cnkuanMnKTtcblxuY29uc3QgQ09MTElTSU9OX0dST1VQUyA9IFsweDAsXG4gIDB4MSwgMHgyLCAweDQsIDB4OF1cbi8vMHgxMCwgMHgyMCwgMHg0MCwgMHg4MCxcbi8vMHgxMDAsIDB4MjAwLCAweDQwMCwgMHg4MDAsXG4vLzB4MTAwMCwgMHgyMDAwLCAweDQwMDAsIDB4ODAwMF07XG5jb25zdCBOT19DT0xMSVNJT04gPSBDT0xMSVNJT05fR1JPVVBTWzBdO1xuY29uc3QgQ19HUk9VUDEgPSBDT0xMSVNJT05fR1JPVVBTWzFdO1xuY29uc3QgQ19HUk9VUDIgPSBDT0xMSVNJT05fR1JPVVBTWzJdO1xuY29uc3QgQ19HUk9VUDMgPSBDT0xMSVNJT05fR1JPVVBTWzNdO1xuY29uc3QgQ19HUk9VUDQgPSBDT0xMSVNJT05fR1JPVVBTWzRdO1xuLy9jb25zdCBDX0dST1VQNSA9IENPTExJU0lPTl9HUk9VUFNbNV07XG5cbmNsYXNzIENvbGxpc2lvbkRldGVjdG9ye1xuXG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgY29uc29sZS5sb2coJ1tDb2xsaXNpb25EZXRlY3Rvcl0gY29uc3RydWN0aW5nJyk7XG4gIH1cblxuICBjYW5fY29sbGlkZShvYmoxLCBvYmoyKXtcbiAgICBsZXQgZ3JvdXBfY2FuX2NvbGxpZGUgPSAob2JqMS5jb2xsaXNpb25fZ3JvdXAgJiBvYmoyLmNvbGxpc2lvbl9ncm91cCkgPiAwO1xuICAgIGlmKCFncm91cF9jYW5fY29sbGlkZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IGNvbGxpc2lvbl90eXBlID0gb2JqMS5jb2xsaXNpb25fYm9keS5zaGFwZSArICc6JyArIG9iajIuY29sbGlzaW9uX2JvZHkuc2hhcGU7XG4gICAgLy8gRklYTUU6IG9wdGltaXplIHdpdGggYml0IG9wZXJhdGlvbiwgYml0IGNvbXBhcmlzb24gc2hvdWxkIGJlIG11Y2ggZmFzdGVyIHRoYW4gc3RyaW5nXG4gICAgc3dpdGNoKGNvbGxpc2lvbl90eXBlKXtcbiAgICAgIGNhc2UgR2VvbWV0cnkuQUFCQiArICc6JyArIEdlb21ldHJ5LkFBQkI6XG4gICAgICAgIHJldHVybiBhYWJiXzJfYWFiYl9jYW5fY29sbGlkZShvYmoxLCBvYmoyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkNJUkNMRSArICc6JyArIEdlb21ldHJ5LkNJUkNMRTpcbiAgICAgICAgcmV0dXJuIGNpcmNsZV8yX2NpcmNsZV9jYW5fY29sbGlkZShvYmoxLCBvYmoyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkFBQkIgKyAnOicgKyBHZW9tZXRyeS5DSVJDTEU6XG4gICAgICAgIHJldHVybiBjaXJjbGVfMl9hYWJiX2Nhbl9jb2xsaWRlKG9iajIsIG9qYjEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuQ0lSQ0xFICsgJzonICsgR2VvbWV0cnkuQUFCQjpcbiAgICAgICAgcmV0dXJuIGNpcmNsZV8yX2FhYmJfY2FuX2NvbGxpZGUob2JqMSwgb2JqMik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5DSVJDTEUgKyAnOicgKyBHZW9tZXRyeS5MSU5FOlxuICAgICAgICByZXR1cm4gY2lyY2xlXzJfbGluZV9jYW5fY29sbGlkZShvYmoxLCBvYmoyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkxJTkUgKyAnOicgKyBHZW9tZXRyeS5DSVJDTEU6XG4gICAgICAgIHJldHVybiBjaXJjbGVfMl9saW5lX2Nhbl9jb2xsaWRlKG9iajIsIG9iajEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuQUFCQiArICc6JyArIEdlb21ldHJ5LkxJTkU6XG4gICAgICAgIHJldHVybiBhYWJiXzJfbGluZV9jYW5fY29sbGlkZShvYmoxLCBvYmoyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkxJTkUrICc6JyArIEdlb21ldHJ5LkFBQkI6XG4gICAgICAgIHJldHVybiBhYWJiXzJfbGluZV9jYW5fY29sbGlkZShvYmoyLCBvYmoxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgX2Rpc3RhbmNlKHBvaW50MSwgcG9pbnQyKXtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KFxuICAgICAgTWF0aC5wb3cocG9pbnQxLngtcG9pbnQyLngsIDIpXG4gICAgICArIE1hdGgucG93KHBvaW50MS55IC0gcG9pbnQyLnksIDIpXG4gICAgKTtcbiAgfVxuXG4gIF9kaXN0YW5jZV9zcXVhcmUocG9pbnQxLCBwb2ludDIpe1xuICAgIHJldHVybiBNYXRoLnBvdyhwb2ludDEueC1wb2ludDIueCwgMilcbiAgICAgICsgTWF0aC5wb3cocG9pbnQxLnkgLSBwb2ludDIueSwgMik7XG4gIH1cblxuICBhYWJiXzJfYWFiYl9jYW5fY29sbGlkZShhYjEsIGFiMil7XG4gICAgbGV0IG1pbjEgPSBhYjEuY29sbGlzaW9uX2JvZHkubWluO1xuICAgIGxldCBtYXgxID0gYWIxLmNvbGxpc2lvbl9ib2R5Lm1heDtcbiAgICBsZXQgbWluMiA9IGFiMi5jb2xsaXNpb25fYm9keS5taW47XG4gICAgbGV0IG1heDIgPSBhYjIuY29sbGlzaW9uX2JvZHkubWF4O1xuICAgIHJldHVybiAobWluMS54IDw9IG1heDIueCAmJiBtYXgxLnggPj0gbWluMi54KVxuICAgICAgJiYgKG1pbjEueSA8PSBtYXgyLnkgJiYgbWF4MS55ID49IG1pbjIueSk7XG4gIH1cblxuICBjaXJjbGVfMl9jaXJjbGVfY2FuX2NvbGxpZGUoYzEsIGMyKXtcbiAgICBsZXQgY2VudGVyMSA9IGMxLmNvbGxpc2lvbl9ib2R5LmNlbnRlcjtcbiAgICBsZXQgY2VudGVyMiA9IGMyLmNvbGxpc2lvbl9ib2R5LmNlbnRlcjtcbiAgICByZXR1cm4gX2Rpc3RhbmNlX3NxdWFyZShjZW50ZXIxLCBjZW50ZXIyKSA8PSBNYXRoLnBvdyhjMS5yICsgYzIuciwgMik7XG4gIH1cblxuICAvLyByZXR1cm4geCAgd2hlbiBtaW4gPCB4IDwgbWF4LCBvdGhlciB3aXNlIHJldHVybiB3aGljaCBldmVyIGlzIGNsb3NlciB0byB4IGZyb20gKG1pbiwgbWF4KVxuICBfY2xhbXAoeCwgbWluLCBtYXgpe1xuICAgIHJldHVybiB4IDwgbWluID8gbWluIDogeCA+IG1heCA/IG1heCA6IHg7XG4gIH1cblxuICBjaXJjbGVfMl9hYWJiX2Nhbl9jb2xsaWRlKGMsIGFiKXtcbiAgICBsZXQgY2VudGVyID0gYy5jb2xsaXNpb25fYm9keS5jZW50ZXI7XG4gICAgbGV0IGNsYW1wX3ggPSBfY2xhbXAoY2VudGVyLngsIGFiLm1pbi54LCBhYi5tYXgueCk7XG4gICAgbGV0IGNsYW1wX3kgPSBfY2xhbXAoY2VudGVyLnksIGFiLm1pbi55LCBhYi5tYXgueSk7XG5cbiAgICByZXR1cm4gTWF0aC5hYnMoY2VudGVyLnggLSBjbGFtcF94KSA8IGMuclxuICAgICAgJiYgTWF0aC5hYnMoY2VudGVyLnkgLSBjbGFtcF95KSA8IGMucjtcbiAgfVxuXG4gIGNpcmNsZV8yX2xpbmVfY2FuX2NvbGxpZGUoYywgbCl7XG4gICAgbGV0IGNlbnRlciA9IGMuY29sbGlzaW9uX2JvZHkuY2VudGVyO1xuICAgIHN3aXRjaChsLnBhcmFsbGVsX3RvKXtcbiAgICAgIGNhc2UgJ3gnOlxuICAgICAgICByZXR1cm4gTWF0aC5hYnMoY2VudGVyLnkgLSBsLnBvcykgPCBjLnI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAneSc6XG4gICAgICAgIHJldHVybiBNYXRoLmFicyhjZW50ZXIueCAtIGwucG9zKSA8IGMucjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgYWFiYl8yX2xpbmVfY2FuX2NvbGxpZGUoYWIsIGwpe1xuICAgIGxldCBtaW4gPSBhYi5jb2xsaXNpb25fYm9keS5taW47XG4gICAgbGV0IG1heCA9IGFiLmNvbGxpc2lvbl9ib2R5Lm1heDtcbiAgICBzd2l0Y2gobC5wYXJhbGxlbF90byl7XG4gICAgICBjYXNlICd4JzpcbiAgICAgICAgcmV0dXJuIGNlbnRlci55IDw9IG1heC55ICYmIGNlbnRlci55ID49IG1pbi55O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3knOlxuICAgICAgICByZXR1cm4gY2VudGVyLnggPD0gbWF4LnggJiYgY2VudGVyLnggPj0gbWluLng7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxpc2lvbkRldGVjdG9yO1xubW9kdWxlLmV4cG9ydHMuTk9fQ09MTElTSU9OID0gTk9fQ09MTElTSU9OO1xubW9kdWxlLmV4cG9ydHMuQ19HUk9VUDEgPSBDX0dST1VQMTtcbm1vZHVsZS5leHBvcnRzLkNfR1JPVVAyID0gQ19HUk9VUDI7XG5tb2R1bGUuZXhwb3J0cy5DX0dST1VQMyA9IENfR1JPVVAzO1xubW9kdWxlLmV4cG9ydHMuQ19HUk9VUDQgPSBDX0dST1VQNDtcbiIsImNsYXNzIEdhbWVPYmplY3R7XG4gIGNvbnN0cnVjdG9yKGNvbGxpc2lvbl9ncm91cCwgY29sbGlzaW9uX2JvZHkpe1xuICAgIGNvbnNvbGUubG9nKCdbR2FtZU9iamVjdF0gY29uc3RydWN0aW5nJyk7XG4gICAgdGhpcy5jb2xsaXNpb25fZ3JvdXAgPSBjb2xsaXNpb25fZ3JvdXA7XG4gICAgdGhpcy5jb2xsaXNpb25fYm9keSA9IGNvbGxpc2lvbl9ib2R5O1xuICB9XG4gIC8vIGFhYmIgc2hvdWxkIGhhdmU6XG4gIC8vIG1pbjoge3g6IDw+LCB5Ojw+fVxuICAvLyBtYXg6IHt4OiA8PiwgeTo8Pn1cblxuICAvLyBjaXJjbGUgc2hvdWxkIGhhdmU6XG4gIC8vIGNlbnRlcjoge3g6IDw+LCB5Ojw+fVxuICAvLyByOiA8PlxuXG4gIC8vIGxpbmVzIGFyZSBpbmZpbml0ZSBsaW5lLCBhbmQgc2hvdWxkIGhhdmU6XG4gIC8vIHBhcmFsbGVsX3RvOiBbJ3gnfCd5J11cbiAgLy8gcG9zOiA8PlxuXG5cbn1cbm1vZHVsZS5leHBvcnRzID0gR2FtZU9iamVjdDtcbiIsImNvbnN0IExJTkUgPSAxO1xuY29uc3QgQUFCQiA9IDI7XG5jb25zdCBDSVJDTEUgPSAzO1xuXG5jbGFzcyBHZW9tZXRyeXtcbiAgY29uc3RydWN0b3Ioc2hhcGUpe1xuICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdlb21ldHJ5O1xubW9kdWxlLmV4cG9ydHMuTElORSA9IExJTkU7XG5tb2R1bGUuZXhwb3J0cy5BQUJCID0gQUFCQjtcbm1vZHVsZS5leHBvcnRzLkNJUkNMRSA9IENJUkNMRTtcbiIsInZhciBHZW9tZXRyeSA9IHJlcXVpcmUoJy4vR2VvbWV0cnkuanMnKTtcblxuY2xhc3MgTGluZSBleHRlbmRzIEdlb21ldHJ5e1xuICBjb25zdHJ1Y3RvcihwYXJhbGxlbF90bywgcG9zKXtcbiAgICBzdXBlcihHZW9tZXRyeS5MSU5FKTtcbiAgICB0aGlzLmJvZHlfdHlwZSA9IENvbGxpc2lvbkRldGVjdG9yLkNfQk9EWV9MSU5FO1xuICAgIHRoaXMucGFyYWxsZWxfdG8gPSBwYXJhbGxlbF90bztcbiAgICB0aGlzLnBvcyA9IHBvcztcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBMaW5lO1xuIiwiZXhwb3J0cy5oZWxsbyA9ICgpID0+IGNvbnNvbGUubG9nKCdzYXkgaGVsbG8gdG8gVGVzdC5qcyEnKTtcbiIsInZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVfZmllbGRcIik7XG52YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGtleURvd25IYW5kbGVyLCBmYWxzZSk7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwga2V5VXBIYW5kbGVyLCBmYWxzZSk7XG4vL2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBrZXlQcmVzc0hhbmRsZXIsIGZhbHNlKTtcblxuZ2FtZV9sZW5ndGggPSAxMDAwO1xuY3VycmVudF9nYW1lX3RpY2sgPSAwO1xuc3RhdGVfaGlzdG9yeSA9IHt9O1xuZW5kaW5nX3RpY2sgPSAwO1xuXG5nYW1lX3N0YXJ0ZWQgPSBmYWxzZTtcbnBhdXNlZCA9IGZhbHNlO1xucGF1c2Vfc3RhcnRfYXQgPSAwO1xudG90YWxfcGF1c2VkID0gMDtcbmdhbWVfZW5kZWQgPSBmYWxzZTtcbmdhbWVfZW5kX3dpdGhfc3RhdHVzID0gJyc7XG5cbkdBTUVfV09OX1NUQVRVUyA9ICd3aW4nO1xuR0FNRV9MT1NUX1NUQVRVUyA9ICdsb3N0JztcbklOX0dBTUVfU1RBVFVTID0gJ2luX2dhbWUnO1xuXG52YXIgZnJpY3Rpb24gPSAwLjAwMTtcbnZhciBhY2NlbGVyYXRpb24gPSAwLjAzO1xudmFyIGZ1ZWxfZWZmaWNpZW5jeSA9IDU7XG52YXIgc3RhdGUgPSB7XG4gICdwb3NfeCc6IDEwLFxuICAncG9zX3knOiAyMDAsXG4gICd0X3Bvc194JzogNDAwLFxuICAndF9wb3NfeSc6IDgwLFxuICAnZl9wb3NfeCc6IDAsXG4gICdmX3Bvc195JzogMCxcbiAgJ3JhZGl1cyc6IDUsXG4gICd3aW5fZGlzdCc6IDE1LFxuICAndl94JzogMSxcbiAgJ3ZfeSc6IDEsXG4gICdhX3gnOiAwLFxuICAnYV95JzogMCxcbiAgJ2ZpZWxkX3dpZHRoJzogY2FudmFzLndpZHRoLFxuICAnZmllbGRfaGVpZ2h0JzogY2FudmFzLmhlaWdodCxcbiAgJ2ZpZWxkX3RvcF9sZWZ0X3gnOiAwLFxuICAnZmllbGRfdG9wX2xlZnRfeSc6IDUwLFxufVxuXG52YXIgdGltZV9iYXJfd2lkdGggPSAxMDA7XG52YXIgdGltZV9iYXIgPSB7XG4gICd3aWR0aCc6IHRpbWVfYmFyX3dpZHRoLFxuICAnaGVpZ2h0JzogMzAsXG4gICdwb3NfeCc6IGNhbnZhcy53aWR0aCAtIDEwIC0gdGltZV9iYXJfd2lkdGgsXG4gICdwb3NfeSc6IDEwLFxuICAnZmlsbCc6IHRpbWVfYmFyX3dpZHRoXG59XG5cbnZhciBmdWVsX2Jhcl93aWR0aCA9IDEwMDtcbnZhciBmdWVsX2JhciA9IHtcbiAgJ3dpZHRoJzogZnVlbF9iYXJfd2lkdGgsXG4gICdoZWlnaHQnOiAzMCxcbiAgJ3Bvc194JzogY2FudmFzLndpZHRoIC0gMTAgLSB0aW1lX2Jhcl93aWR0aCAtIGZ1ZWxfYmFyX3dpZHRoIC0gMTAsXG4gICdwb3NfeSc6IDEwLFxuICAnZmlsbCc6IGZ1ZWxfYmFyX3dpZHRoXG59XG5cbmZ1bmN0aW9uIHVwZGF0ZV90aW1lX2Jhcigpe1xuICB0aW1lX2JhclsnZmlsbCddID0gdGltZV9iYXJfd2lkdGggLSAoY3VycmVudF9nYW1lX3RpY2sgKiB0aW1lX2Jhcl93aWR0aCAvIGdhbWVfbGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyX2Z1ZWxfYmFyKGN0eCwgZnVlbF9iYXIpe1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gIGN0eC5yZWN0KGZ1ZWxfYmFyWydwb3NfeCddLCBmdWVsX2JhclsncG9zX3knXSwgZnVlbF9iYXJbJ3dpZHRoJ10sIGZ1ZWxfYmFyWydoZWlnaHQnXSk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmZpbGxTdHlsZSA9ICdyZWQnO1xuICBjdHgucmVjdChmdWVsX2JhclsncG9zX3gnXSArIDEsIGZ1ZWxfYmFyWydwb3NfeSddICsgMSwgZnVlbF9iYXJbJ2ZpbGwnXSAtIDIsIGZ1ZWxfYmFyWydoZWlnaHQnXSAtIDIpO1xuICBjdHguZmlsbCgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcl90aW1lX2JhcihjdHgsIHRpbWVfYmFyKXtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICBjdHgucmVjdCh0aW1lX2JhclsncG9zX3gnXSwgdGltZV9iYXJbJ3Bvc195J10sIHRpbWVfYmFyWyd3aWR0aCddLCB0aW1lX2JhclsnaGVpZ2h0J10pO1xuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5maWxsU3R5bGUgPSAnZ3JleSc7XG4gIGN0eC5yZWN0KHRpbWVfYmFyWydwb3NfeCddICsgMSwgdGltZV9iYXJbJ3Bvc195J10gKyAxLCB0aW1lX2JhclsnZmlsbCddIC0gMiwgdGltZV9iYXJbJ2hlaWdodCddIC0gMik7XG4gIGN0eC5maWxsKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyX2dhbWVfZW5kKGN0eCwgc3RhdHVzKXtcbiAgdmFyIGVuZGluZ190ZXh0ID0gJ1lvdSBXaW4hJztcbiAgaWYoc3RhdHVzID09IEdBTUVfTE9TVF9TVEFUVVMpe1xuICAgIGVuZGluZ190ZXh0ID0gJ1lvdSBsb3N0ISc7XG4gIH1cbiAgY3R4LmZvbnQgPSBcIjMwcHggQXJpYWxcIjtcbiAgY3R4LmZpbGxUZXh0KGVuZGluZ190ZXh0LCBjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0IC8gMik7XG59XG5cblxuXG52YXIgbW92ZXMgPSB7XG4gIFwiQXJyb3dEb3duXCI6IGZhbHNlLFxuICBcIkFycm93VXBcIjogZmFsc2UsXG4gIFwiQXJyb3dMZWZ0XCI6IGZhbHNlLFxuICBcIkFycm93UmlnaHRcIjogZmFsc2Vcbn1cblxuZnVuY3Rpb24ga2V5RG93bkhhbmRsZXIoZSl7XG4gIGlmKGUuY29kZSBpbiBtb3Zlcyl7XG4gICAgbW92ZXNbZS5jb2RlXSA9IHRydWU7XG4gICAgaWYoZnVlbF9iYXJbJ2ZpbGwnXSA+PSBmdWVsX2VmZmljaWVuY3kpe1xuICAgICAgc3dpdGNoKGUuY29kZSl7XG4gICAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgICAgc3RhdGVbJ2FfeSddIC09IGFjY2VsZXJhdGlvbjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICAgIHN0YXRlWydhX3knXSArPSBhY2NlbGVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJBcnJvd0xlZnRcIjpcbiAgICAgICAgICBzdGF0ZVsnYV94J10gLT0gYWNjZWxlcmF0aW9uO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiQXJyb3dSaWdodFwiOlxuICAgICAgICAgIHN0YXRlWydhX3gnXSArPSBhY2NlbGVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBmdWVsX2JhclsnZmlsbCddIC09IGZ1ZWxfZWZmaWNpZW5jeTtcbiAgICB9ZWxzZXtcbiAgICAgIGZ1ZWxfYmFyWydmaWxsJ10gPSAwO1xuICAgIH1cbiAgICBzdGF0ZV9wcmVkaWN0aW9uKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24ga2V5VXBIYW5kbGVyKGUpe1xuICBpZihlLmNvZGUgaW4gbW92ZXMpe1xuICAgIG1vdmVzW2UuY29kZV0gPSBmYWxzZTtcbiAgICBzd2l0Y2goZS5jb2RlKXtcbiAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgIHN0YXRlWydhX3knXSA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICBzdGF0ZVsnYV95J10gPSAwO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJBcnJvd0xlZnRcIjpcbiAgICAgICAgc3RhdGVbJ2FfeCddID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dSaWdodFwiOlxuICAgICAgICBzdGF0ZVsnYV94J10gPSAwO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgc3RhdGVfcHJlZGljdGlvbigpO1xuICB9XG59XG5cbnZhciBtaW5fdmVsb2NpdHkgPSAwLjAwMztcbmZ1bmN0aW9uIGNoZWNrX3N0b3BwZWQoc3RhdGUpe1xuICByZXR1cm4gTWF0aC5hYnMoc3RhdGVbJ3ZfeCddKSA8PSBtaW5fdmVsb2NpdHkgJiYgTWF0aC5hYnMoc3RhdGVbJ3ZfeSddKSA8PSBtaW5fdmVsb2NpdHk7XG59XG5cbmZ1bmN0aW9uIHN0YXRlX3ByZWRpY3Rpb24oKXtcbiAgdmFyIHN0YXRlX2NvcHkgPSByb290X2Nsb25lKHN0YXRlKTtcbiAgc3RhdGVfaGlzdG9yeVtjdXJyZW50X2dhbWVfdGlja10gPSBzdGF0ZTtcbiAgdmFyIGkgPSBjdXJyZW50X2dhbWVfdGljaztcbiAgd2hpbGUoKE1hdGguYWJzKHN0YXRlX2NvcHlbJ3ZfeCddKSA+IDAuMDAzIHx8IE1hdGguYWJzKHN0YXRlX2NvcHlbJ3ZfeSddKSA+IDAuMDAzKSAmJiBpIDwgZ2FtZV9sZW5ndGgpe1xuICAgIHN0YXRlX2NvcHkgPSBwaHlzaWNzX2VuZ2luZV9zdGVwKHN0YXRlX2NvcHksIHVuZGVmaW5lZCk7XG4gICAgc3RhdGVfaGlzdG9yeVtpXSA9IHN0YXRlX2NvcHk7XG4gICAgaSsrO1xuICB9XG4gIGVuZGluZ190aWNrID0gaSAtIDE7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcmVyKHN0YXRlKXtcbiAgY3R4LnNhdmUoKTtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gIHJlbmRlcl90aW1lX2JhcihjdHgsIHRpbWVfYmFyKTtcbiAgcmVuZGVyX2Z1ZWxfYmFyKGN0eCwgZnVlbF9iYXIpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgY3R4LnJlY3Qoc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3gnXSwgc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3knXSwgc3RhdGVbJ2ZpZWxkX3dpZHRoJ10sIHN0YXRlWydmaWVsZF9oZWlnaHQnXSAtIHN0YXRlWydmaWVsZF90b3BfbGVmdF95J10pO1xuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gIGN0eC5yZWN0KDEwMCwgMTAwLCAzMCwgMzApO1xuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICBjdHguYXJjKHN0YXRlWydwb3NfeCddLCBzdGF0ZVsncG9zX3knXSwgc3RhdGVbJ3JhZGl1cyddLCAwLCAyKk1hdGguUEkpO1xuICBjdHguZmlsbCgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICBjdHguc2V0TGluZURhc2goWzJdKTtcbiAgY3R4LmFyYyhzdGF0ZVsnZl9wb3NfeCddLCBzdGF0ZVsnZl9wb3NfeSddLCBzdGF0ZVsncmFkaXVzJ10sIDAsIDIqTWF0aC5QSSk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LnNldExpbmVEYXNoKFtdKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ3JlZCc7XG4gIGN0eC5hcmMoc3RhdGVbJ3RfcG9zX3gnXSwgc3RhdGVbJ3RfcG9zX3knXSwgc3RhdGVbJ3JhZGl1cyddKjIsIDAsIDIqTWF0aC5QSSk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGlmKGdhbWVfZW5kZWQpe1xuICAgIHJlbmRlcl9nYW1lX2VuZChjdHgsIGdhbWVfZW5kX3dpdGhfc3RhdHVzKTtcbiAgfVxuICBjdHgucmVzdG9yZSgpO1xufVxuXG5mdW5jdGlvbiBjaGVja19nYW1lX2VuZChzdGF0ZSl7XG4gIHZhciBkaXN0X3RvX2dvYWwgPSBNYXRoLnNxcnQoTWF0aC5wb3coc3RhdGVbJ3Bvc194J10gLSBzdGF0ZVsndF9wb3NfeCddLCAyKSArIE1hdGgucG93KHN0YXRlWydwb3NfeSddIC0gc3RhdGVbJ3RfcG9zX3knXSwgMikpO1xuICBpZihjdXJyZW50X2dhbWVfdGljayA+PSBnYW1lX2xlbmd0aCl7XG4gICAgaWYoZGlzdF90b19nb2FsID4gc3RhdGVbJ3dpbl9kaXN0J10pe1xuICAgICAgcmV0dXJuIEdBTUVfTE9TVF9TVEFUVVM7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gR0FNRV9XT05fU1RBVFVTO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgaWYoY2hlY2tfc3RvcHBlZChzdGF0ZSkgICYmIGRpc3RfdG9fZ29hbCA8PSBzdGF0ZVsnd2luX2Rpc3QnXSl7XG4gICAgICByZXR1cm4gR0FNRV9XT05fU1RBVFVTO1xuICAgIH1lbHNlIGlmKGNoZWNrX3N0b3BwZWQoc3RhdGUpICYmIGZ1ZWxfYmFyWydmaWxsJ10gPCBmdWVsX2VmZmljaWVuY3kpe1xuICAgICAgcmV0dXJuIEdBTUVfTE9TVF9TVEFUVVM7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gSU5fR0FNRV9TVEFUVVM7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1haW5Mb29wKCl7XG4gIGlmKCFnYW1lX3N0YXJ0ZWQpe1xuICAgIGdhbWVfc3RhcnRlZCA9IHRydWU7XG4gICAgc3RhdGVfcHJlZGljdGlvbigpO1xuICB9XG4gIHZhciBnYW1lX2VuZF9zdGF0dXMgPSBjaGVja19nYW1lX2VuZChzdGF0ZSk7XG4gIGlmKGdhbWVfZW5kX3N0YXR1cyA9PSBJTl9HQU1FX1NUQVRVUyl7XG4gICAgaWYoY3VycmVudF9nYW1lX3RpY2sgPCBnYW1lX2xlbmd0aCl7XG4gICAgICBzdGF0ZVsnZl9wb3NfeCddID0gc3RhdGVfaGlzdG9yeVtlbmRpbmdfdGlja11bJ3Bvc194J107XG4gICAgICBzdGF0ZVsnZl9wb3NfeSddID0gc3RhdGVfaGlzdG9yeVtlbmRpbmdfdGlja11bJ3Bvc195J107XG4gICAgICBzdGF0ZSA9IHBoeXNpY3NfZW5naW5lX3N0ZXAoc3RhdGUsIHVuZGVmaW5lZCk7XG4gICAgICByZW5kZXJlcihzdGF0ZSk7XG4gICAgICBjdXJyZW50X2dhbWVfdGljayArPSAxO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgZ2FtZV9lbmRlZCA9IHRydWU7XG4gICAgZ2FtZV9lbmRfd2l0aF9zdGF0dXMgPSBnYW1lX2VuZF9zdGF0dXM7XG4gICAgcmVuZGVyZXIoc3RhdGUpO1xuICAgIC8vY29uc29sZS5sb2coc3RhdGUpO1xuICAgIC8vdmFyIGRpc3RfdG9fZ29hbCA9IE1hdGguc3FydChNYXRoLnBvdyhzdGF0ZVsncG9zX3gnXSAtIHN0YXRlWyd0X3Bvc194J10sMikgKyBNYXRoLnBvdyhzdGF0ZVsncG9zX3knXSAtIHN0YXRlWyd0X3Bvc195J10sMikpO1xuICAgIC8vY29uc29sZS5sb2coZGlzdF90b19nb2FsKTtcbiAgfVxufVxuXG5cblxuZnVuY3Rpb24gcm9vdF9jbG9uZShvYmope1xuICB2YXIgY2xvbmUgPSB7fTtcbiAgZm9yKHZhciBrZXkgaW4gb2JqKXtcbiAgICBjbG9uZVtrZXldID0gb2JqW2tleV07XG4gIH1cbiAgcmV0dXJuIGNsb25lO1xufVxuXG5taW5fc3BlZWQgPSAwLjAwMztcbi8qIHN0YXRlOlxueyd2X3gnOiAxLFxuICd2X3knOiAxLFxuICdhX3gnOiAwLjEsXG4gJ2FfeSc6IDAuMSxcbiAncG9zX3gnOiAxMCxcbiAncG9zX3knOiAxMCxcbiAncmFkaXVzJzogNSxcbiAnZmllbGRfd2lkdGgnOiA2MDAsXG4gJ2ZpZWxkX2hlaWdodCc6IDYwMCxcbiAnbnVtX29mX3RpY2tzJzogNjAwMFxufVxuKi9cbmZ1bmN0aW9uIHBoeXNpY3NfZW5naW5lX3N0ZXAoc3RhdGUsIHJlbmRlcmVyKXtcbiAgdmFyIHN0YXRlX2NvcHkgPSByb290X2Nsb25lKHN0YXRlKTtcbiAgc3RhdGVfY29weVsncG9zX3gnXSArPSBzdGF0ZV9jb3B5Wyd2X3gnXTtcbiAgc3RhdGVfY29weVsncG9zX3knXSArPSBzdGF0ZV9jb3B5Wyd2X3knXTtcbiAgc3RhdGVfY29weVsndl94J10gKz0gc3RhdGVfY29weVsnYV94J107XG4gIHN0YXRlX2NvcHlbJ3ZfeSddICs9IHN0YXRlX2NvcHlbJ2FfeSddO1xuICBzdGF0ZV9jb3B5Wyd2X3gnXSA+IDAgPyBzdGF0ZV9jb3B5Wyd2X3gnXSAtPSBmcmljdGlvbiA6IHN0YXRlX2NvcHlbJ3ZfeCddICs9IGZyaWN0aW9uO1xuICBzdGF0ZV9jb3B5Wyd2X3knXSA+IDAgPyBzdGF0ZV9jb3B5Wyd2X3knXSAtPSBmcmljdGlvbiA6IHN0YXRlX2NvcHlbJ3ZfeSddICs9IGZyaWN0aW9uO1xuICBpZihNYXRoLmFicyhzdGF0ZV9jb3B5Wyd2X3gnXSkgPD0gbWluX3NwZWVkKXtcbiAgICBzdGF0ZV9jb3B5Wyd2X3gnXSA9IDA7XG4gIH1cbiAgaWYoTWF0aC5hYnMoc3RhdGVfY29weVsndl95J10pIDw9IG1pbl9zcGVlZCl7XG4gICAgc3RhdGVfY29weVsndl95J10gPSAwO1xuICB9XG5cbiAgLy8gcmVjdFt4LCB5LCB3aWR0aCwgaGVpZ2h0XVxuICB2YXIgbGlzdF9vZl9yZWN0cyA9IFtdO1xuICBsaXN0X29mX3JlY3RzLnB1c2goW3N0YXRlWydmaWVsZF90b3BfbGVmdF94J10sIHN0YXRlWydmaWVsZF90b3BfbGVmdF95J10sIHN0YXRlWydmaWVsZF93aWR0aCddLCBzdGF0ZVsnZmllbGRfaGVpZ2h0J10gLSBzdGF0ZVsnZmllbGRfdG9wX2xlZnRfeSddXSlcbiAgbGlzdF9vZl9yZWN0cy5wdXNoKFsxMDAsIDEwMCwgMzAsIDMwXSk7XG4gIHZhciBiYWxsX2NlbnRlciA9IFtzdGF0ZV9jb3B5Wydwb3NfeCddLCBzdGF0ZV9jb3B5Wydwb3NfeSddXTtcbiAgdmFyIGJhbGxfcmFkaXVzID0gc3RhdGVfY29weVsncmFkaXVzJ107XG5cbiAgZm9yKHZhciBpID0gMCA7IGkgPCBsaXN0X29mX3JlY3RzLmxlbmd0aCA7IGkgKyspe1xuICAgIHZhciByZWN0ID0gbGlzdF9vZl9yZWN0c1tpXTtcbiAgICB2YXIgbGVmdF94ID0gcmVjdFswXTtcbiAgICB2YXIgcmlnaHRfeCA9IHJlY3RbMF0gKyByZWN0WzJdO1xuICAgIHZhciB0b3BfeSA9IHJlY3RbMV07XG4gICAgdmFyIGJvdHRvbV95ID0gcmVjdFsxXSArIHJlY3RbM107XG4gICAgaWYoYmFsbF9jZW50ZXJbMV0gPiB0b3BfeVxuICAgICAgJiYgYmFsbF9jZW50ZXJbMV0gPCBib3R0b21feVxuICAgICAgJiYoIE1hdGguYWJzKGJhbGxfY2VudGVyWzBdIC0gbGVmdF94KSA8PSBiYWxsX3JhZGl1cyBcbiAgICAgICAgfHwgTWF0aC5hYnMocmlnaHRfeCAtIGJhbGxfY2VudGVyWzBdKSA8PSBiYWxsX3JhZGl1cykpe1xuICAgICAgc3RhdGVfY29weVsndl94J10gKj0gLTE7XG4gICAgfVxuICAgIGlmKGJhbGxfY2VudGVyWzBdID4gbGVmdF94XG4gICAgICAmJiBiYWxsX2NlbnRlclswXSA8IHJpZ2h0X3hcbiAgICAgICYmKCBNYXRoLmFicyhiYWxsX2NlbnRlclsxXSAtIHRvcF95KSA8PSBiYWxsX3JhZGl1cyBcbiAgICAgIHx8IE1hdGguYWJzKGJvdHRvbV95IC0gYmFsbF9jZW50ZXJbMV0pIDw9IGJhbGxfcmFkaXVzKSl7XG4gICAgICBzdGF0ZV9jb3B5Wyd2X3knXSAqPSAtMTtcbiAgICB9XG4gIH1cbiAgaWYocmVuZGVyZXIgIT09IHVuZGVmaW5lZCl7XG4gICAgcmVuZGVyZXIoc3RhdGVfY29weSk7XG4gIH1cbiAgdXBkYXRlX3RpbWVfYmFyKCk7XG4gIHJldHVybiBzdGF0ZV9jb3B5O1xufVxuXG5jb25zb2xlLmxvZygnc3RhcnQhJyk7XG5cbnZhciB0anMgPSByZXF1aXJlKCcuL1Rlc3QuanMnKTtcbnRqcy5oZWxsbygpO1xuXG52YXIgR2FtZU9iamVjdCA9IHJlcXVpcmUoJy4vR2FtZU9iamVjdC5qcycpO1xudmFyIGdvID0gbmV3IEdhbWVPYmplY3QoJ25hbWUnLCAxMjMpO1xuXG52YXIgQ29sbGlzaW9uRGV0ZWN0b3I9IHJlcXVpcmUoJy4vQ29sbGlzaW9uRGV0ZWN0b3IuanMnKTtcbnZhciBjZCA9IG5ldyBDb2xsaXNpb25EZXRlY3RvcigpO1xuY29uc29sZS5sb2coQ29sbGlzaW9uRGV0ZWN0b3IuTk9fQ09MTElTSU9OKTtcblxudmFyIEFBQkIgPSByZXF1aXJlKCcuL0FBQkIuanMnKTtcbnZhciBDaXJjbGUgPSByZXF1aXJlKCcuL0NpcmNsZS5qcycpO1xudmFyIExpbmUgPSByZXF1aXJlKCcuL0xpbmUuanMnKTtcblxudmFyIGFhYmIxID0gbmV3IEFBQkIoMTAsIDEwLCAyMCwgMjApO1xuY29uc29sZS5sb2coYWFiYjEpO1xuXG4vL3NldEludGVydmFsKG1haW5Mb29wLCAxMCk7XG4iXX0=
