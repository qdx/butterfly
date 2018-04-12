(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Geometry = require('./Geometry.js');
var CollisionDetector = require('./CollisionDetector.js');

class AABB extends Geometry{
  constructor(min_x, min_y, max_x, max_y){
    super(Geometry.AABB);
    this.min = {};
    this.min.x = min_x;
    this.min.y = min_y;
    this.max = {};
    this.max.x = max_x;
    this.max.y = max_y;
    this.width = max_x - min_x;
    this.height = max_y - min_y;
  }
  render(ctx){
    ctx.beginPath();
    ctx.rect(
      this.min.x,
      this.min.y,
      this.max.x - this.min.x,
      this.max.y - this.min.y);
    ctx.stroke();
    ctx.closePath();
  }
}
module.exports = AABB;

},{"./CollisionDetector.js":3,"./Geometry.js":5}],2:[function(require,module,exports){
var Geometry = require('./Geometry.js');
var CollisionDetector = require('./CollisionDetector.js');

class Circle extends Geometry{
  constructor(center_x, center_y, radius){
    super(Geometry.CIRCLE);
    this.center = {};
    this.center.x = center_x;
    this.center.y = center_y;
    this.r = radius;
  }
  render(ctx){
    ctx.beginPath();
    ctx.arc(this.center.x,this.center.y, this.r, 0, 2*Math.PI);
    ctx.stroke();
    ctx.closePath();
  }
}
module.exports = Circle;

},{"./CollisionDetector.js":3,"./Geometry.js":5}],3:[function(require,module,exports){
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

  //constructor(){
    //console.log('[CollisionDetector] constructing');
  //}

  can_collide(obj1, obj2){
    let group_can_collide = (obj1.collision_group & obj2.collision_group) > 0;
    if(!group_can_collide) return false;

    let collision_type = obj1.collision_body.shape + ':' + obj2.collision_body.shape;
    // FIXME: optimize with bit operation, bit comparison should be much faster than string
    let obj1_c_body = obj1.collision_body;
    let obj2_c_body = obj2.collision_body;
    switch(collision_type){
      case Geometry.AABB + ':' + Geometry.AABB:
        return this.aabb_2_aabb_can_collide(obj1_c_body, obj2_c_body);
        break;
      case Geometry.CIRCLE + ':' + Geometry.CIRCLE:
        return this.circle_2_circle_can_collide(obj1_c_body, obj2_c_body);
        break;
      case Geometry.AABB + ':' + Geometry.CIRCLE:
        return this.circle_2_aabb_can_collide(obj2_c_body, ojb1);
        break;
      case Geometry.CIRCLE + ':' + Geometry.AABB:
        return this.circle_2_aabb_can_collide(obj1_c_body, obj2_c_body);
        break;
      case Geometry.CIRCLE + ':' + Geometry.LINE:
        return this.circle_2_line_can_collide(obj1_c_body, obj2_c_body);
        break;
      case Geometry.LINE + ':' + Geometry.CIRCLE:
        return this.circle_2_line_can_collide(obj2_c_body, obj1_c_body);
        break;
      case Geometry.AABB + ':' + Geometry.LINE:
        return this.aabb_2_line_can_collide(obj1_c_body, obj2_c_body);
        break;
      case Geometry.LINE+ ':' + Geometry.AABB:
        return this.aabb_2_line_can_collide(obj2_c_body, obj1_c_body);
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
    let min1 = ab1.min;
    let max1 = ab1.max;
    let min2 = ab2.min;
    let max2 = ab2.max;
    return (min1.x <= max2.x && max1.x >= min2.x)
      && (min1.y <= max2.y && max1.y >= min2.y);
  }

  circle_2_circle_can_collide(c1, c2){
    let center1 = c1.center;
    let center2 = c2.center;
    return _distance_square(center1, center2) <= Math.pow(c1.r + c2.r, 2);
  }

  // return x  when min < x < max, other wise return which ever is closer to x from (min, max)
  _clamp(x, min, max){
    return x < min ? min : x > max ? max : x;
  }

  circle_2_aabb_can_collide(c, ab){
    let center = c.center;
    let clamp_x = _clamp(center.x, ab.min.x, ab.max.x);
    let clamp_y = _clamp(center.y, ab.min.y, ab.max.y);

    return Math.abs(center.x - clamp_x) < c.r
      && Math.abs(center.y - clamp_y) < c.r;
  }

  circle_2_line_can_collide(c, l){
    let center = c.center;
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
    let min = ab.min;
    let max = ab.max;
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
var Geometry = require('./Geometry.js');

class GameObject{
  constructor(collision_group, collision_body, display_body, moveable){
    console.log('[GameObject] constructing');
    this.collision_group = collision_group;
    this.collision_body = collision_body;
    this.display_body = display_body;
    this.moveable = moveable;

    if(collision_body.shape == Geometry.AABB){
      this.x = collision_body.min.x;
      this.y = collision_body.min.y;
    }else if(collision_body.shape == Geometry.CIRCLE){
      this.x = collision_body.center.x;
      this.y = collision_body.center.y;
    }
  }

  get_position(){
    return {'x':this.x, 'y':this.y};
  }

  set_position(x, y){
    this.x = x;
    this.y = y;
    if(this.collision_body.shape == Geometry.AABB){
      this.collision_body.min_x = x;
      this.collision_body.min_y = y;
      this.collision_body.max_x = x + this.collision_body.width;
      this.collision_body.max_y = y + this.collision_body.height;
    }else if(this.collision_body.shape == Geometry.LINE){
      if(this.collision_body.parallel_to == 'x'){
        this.collision_body.pos = y;
      }else{
        this.collision_body.pos = x;
      }
    }else if(this.collision_body.shape == Geometry.CIRCLE){
      this.collision_body.center.x = this.x;
      this.collision_body.center.y = this.y;
    }
  }

  set_velocity(v_x, v_y){
    this.v_x = v_x;
    this.v_y = v_y;
  }

  set_acceleration(a_x, a_y){
    this.a_x = a_x;
    this.a_y = a_y;
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

},{"./Geometry.js":5}],5:[function(require,module,exports){
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
class ImpluseResolver{
  resolve(obj1, obj2){
    let collision_type = obj1.collision_body.shape + ':' + obj2.collision_body.shape;
    switch(collision_type){
      case Geometry.AABB + ':' + Geometry.AABB:
        console.log('aabb 2 aabb impluse resolution not supported');
        break;
      case Geometry.CIRCLE + ':' + Geometry.CIRCLE:
        console.log('circle 2 circle impluse resolution not supported');
        break;
      case Geometry.AABB + ':' + Geometry.CIRCLE:
        return this.circle_2_aabb_resolution(obj2, ojb1);
        break;
      case Geometry.CIRCLE + ':' + Geometry.AABB:
        return this.circle_2_aabb_resolution(obj1, ojb2);
        break;
      case Geometry.CIRCLE + ':' + Geometry.LINE:
        return this.circle_2_line_resolution(obj1, obj2);
        break;
      case Geometry.LINE + ':' + Geometry.CIRCLE:
        return this.circle_2_line_resolution(obj2, obj1);
        break;
      case Geometry.AABB + ':' + Geometry.LINE:
        console.log('aabb 2 line impluse resolution not supported');
        break;
      case Geometry.LINE+ ':' + Geometry.AABB:
        console.log('line 2 aabb impluse resolution not supported');
        break;
      default:
        return false;
    }
  }

  circle_2_aabb_resolution(c, ab){
    c.v_x *= -1;
    c.v_y *= -1;
  }

  circle_2_line_resolution(c, l){
    switch(l.collision_body.parallel_to){
      case 'x':
        c.v_y *= -1;
        break;
      case 'y':
        c.v_x *= -1;
        break;
    }
  }
}
module.exports = ImpluseResolver;

},{"./Geometry.js":5}],7:[function(require,module,exports){
var Geometry = require('./Geometry.js');
var CollisionDetector = require('./CollisionDetector.js');

class Line extends Geometry{
  constructor(parallel_to, pos){
    super(Geometry.LINE);
    this.body_type = CollisionDetector.C_BODY_LINE;
    this.parallel_to = parallel_to;
    this.pos = pos;
  }
  render(ctx){
    ctx.beginPath();
    switch(this.parallel_to){
      case 'x':
        ctx.moveTo(0, this.pos);
        ctx.lineTo(10000, this.pos);
        break;
      case 'y':
        ctx.moveTo(this.pos, 0);
        ctx.lineTo(this.pos, 10000);
        break;
    }
    ctx.stroke();
    ctx.closePath();
  }
}
module.exports = Line;

},{"./CollisionDetector.js":3,"./Geometry.js":5}],8:[function(require,module,exports){
var CollisionDetector = require('./CollisionDetector.js');
var Circle = require('./Circle.js');
var AABB = require('./AABB.js');
var Line = require('./Line.js');
var GameObject = require('./GameObject.js');
var ImpluseResolver = require('./ImpluseResolver.js');

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

var player_body = new Circle(10, 200, 5);
var player = new GameObject(CollisionDetector.C_GROUP1, player_body, player_body, true);
player.set_velocity(5, 5);
player.set_acceleration(0, 0);

var target_body = new Circle(400, 80, player_body.r * 2);
var target = new GameObject(CollisionDetector.NO_COLLISION, target_body, target_body, false);

var player_future_body = new Circle(0, 0, player_body.r);
var player_future = new GameObject(CollisionDetector.NO_COLLISION, player_future_body, player_future_body, false);

var left_line = new Line('y', 0);
var right_line = new Line('y', canvas.width);
var top_line = new Line('x', 0);
var bottom_line = new Line('x', canvas.height);
var left = new GameObject(CollisionDetector.C_GROUP1, left_line, left_line, false);
var right = new GameObject(CollisionDetector.C_GROUP1, right_line, right_line, false);
var top = new GameObject(CollisionDetector.C_GROUP1, top_line, top_line, false);
var bottom = new GameObject(CollisionDetector.C_GROUP1, bottom_line, bottom_line, false);

var state_2 = {
  'player': player,
  'target': target,
  'player_future': player_future
}

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

var detector = new CollisionDetector();
var resolver = new ImpluseResolver();

function physics_engine_step_new(game_objects){
  game_objects.filter(obj => obj.moveable).forEach(function(obj){
    let pos = obj.get_position();
    obj.set_position(pos.x + obj.v_x, pos.y + obj.v_y);
    obj.v_x += obj.a_x;
    obj.v_y += obj.a_y;
  });

  var collision_pairs = [];
  for(var i = 0 ; i < game_objects.length ; i ++){
    for(var j = 1 ; j < game_objects.length ; j ++){
      if(i != j && detector.can_collide(game_objects[i], game_objects[j])){
        collision_pairs.push([game_objects[i], game_objects[j]]);
      }
    }
  }
  //if(collision_pairs.length > 0){
    //console.log(collision_pairs);
  //}

  collision_pairs.forEach(function(c_pair){
    resolver.resolve(c_pair[0], c_pair[1]);
  });
}

function mainLoopNew(){
  if(!game_started){
    game_started = true;
  }
  var game_objects = [
    player,
    target,
    left,
    right,
    top,
    bottom
  ];

  physics_engine_step_new(game_objects);

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  game_objects.forEach(function(obj){
    obj.display_body.render(ctx);
  });
  ctx.restore();
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

setInterval(mainLoopNew, 10);
//setInterval(mainLoop, 10);

},{"./AABB.js":1,"./Circle.js":2,"./CollisionDetector.js":3,"./GameObject.js":4,"./ImpluseResolver.js":6,"./Line.js":7}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQUFCQi5qcyIsInNyYy9DaXJjbGUuanMiLCJzcmMvQ29sbGlzaW9uRGV0ZWN0b3IuanMiLCJzcmMvR2FtZU9iamVjdC5qcyIsInNyYy9HZW9tZXRyeS5qcyIsInNyYy9JbXBsdXNlUmVzb2x2ZXIuanMiLCJzcmMvTGluZS5qcyIsInNyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIEdlb21ldHJ5ID0gcmVxdWlyZSgnLi9HZW9tZXRyeS5qcycpO1xudmFyIENvbGxpc2lvbkRldGVjdG9yID0gcmVxdWlyZSgnLi9Db2xsaXNpb25EZXRlY3Rvci5qcycpO1xuXG5jbGFzcyBBQUJCIGV4dGVuZHMgR2VvbWV0cnl7XG4gIGNvbnN0cnVjdG9yKG1pbl94LCBtaW5feSwgbWF4X3gsIG1heF95KXtcbiAgICBzdXBlcihHZW9tZXRyeS5BQUJCKTtcbiAgICB0aGlzLm1pbiA9IHt9O1xuICAgIHRoaXMubWluLnggPSBtaW5feDtcbiAgICB0aGlzLm1pbi55ID0gbWluX3k7XG4gICAgdGhpcy5tYXggPSB7fTtcbiAgICB0aGlzLm1heC54ID0gbWF4X3g7XG4gICAgdGhpcy5tYXgueSA9IG1heF95O1xuICAgIHRoaXMud2lkdGggPSBtYXhfeCAtIG1pbl94O1xuICAgIHRoaXMuaGVpZ2h0ID0gbWF4X3kgLSBtaW5feTtcbiAgfVxuICByZW5kZXIoY3R4KXtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnJlY3QoXG4gICAgICB0aGlzLm1pbi54LFxuICAgICAgdGhpcy5taW4ueSxcbiAgICAgIHRoaXMubWF4LnggLSB0aGlzLm1pbi54LFxuICAgICAgdGhpcy5tYXgueSAtIHRoaXMubWluLnkpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gQUFCQjtcbiIsInZhciBHZW9tZXRyeSA9IHJlcXVpcmUoJy4vR2VvbWV0cnkuanMnKTtcbnZhciBDb2xsaXNpb25EZXRlY3RvciA9IHJlcXVpcmUoJy4vQ29sbGlzaW9uRGV0ZWN0b3IuanMnKTtcblxuY2xhc3MgQ2lyY2xlIGV4dGVuZHMgR2VvbWV0cnl7XG4gIGNvbnN0cnVjdG9yKGNlbnRlcl94LCBjZW50ZXJfeSwgcmFkaXVzKXtcbiAgICBzdXBlcihHZW9tZXRyeS5DSVJDTEUpO1xuICAgIHRoaXMuY2VudGVyID0ge307XG4gICAgdGhpcy5jZW50ZXIueCA9IGNlbnRlcl94O1xuICAgIHRoaXMuY2VudGVyLnkgPSBjZW50ZXJfeTtcbiAgICB0aGlzLnIgPSByYWRpdXM7XG4gIH1cbiAgcmVuZGVyKGN0eCl7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5hcmModGhpcy5jZW50ZXIueCx0aGlzLmNlbnRlci55LCB0aGlzLnIsIDAsIDIqTWF0aC5QSSk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGU7XG4iLCJ2YXIgR2VvbWV0cnkgPSByZXF1aXJlKCcuL0dlb21ldHJ5LmpzJyk7XG5cbmNvbnN0IENPTExJU0lPTl9HUk9VUFMgPSBbMHgwLFxuICAweDEsIDB4MiwgMHg0LCAweDhdXG4vLzB4MTAsIDB4MjAsIDB4NDAsIDB4ODAsXG4vLzB4MTAwLCAweDIwMCwgMHg0MDAsIDB4ODAwLFxuLy8weDEwMDAsIDB4MjAwMCwgMHg0MDAwLCAweDgwMDBdO1xuY29uc3QgTk9fQ09MTElTSU9OID0gQ09MTElTSU9OX0dST1VQU1swXTtcbmNvbnN0IENfR1JPVVAxID0gQ09MTElTSU9OX0dST1VQU1sxXTtcbmNvbnN0IENfR1JPVVAyID0gQ09MTElTSU9OX0dST1VQU1syXTtcbmNvbnN0IENfR1JPVVAzID0gQ09MTElTSU9OX0dST1VQU1szXTtcbmNvbnN0IENfR1JPVVA0ID0gQ09MTElTSU9OX0dST1VQU1s0XTtcbi8vY29uc3QgQ19HUk9VUDUgPSBDT0xMSVNJT05fR1JPVVBTWzVdO1xuXG5jbGFzcyBDb2xsaXNpb25EZXRlY3RvcntcblxuICAvL2NvbnN0cnVjdG9yKCl7XG4gICAgLy9jb25zb2xlLmxvZygnW0NvbGxpc2lvbkRldGVjdG9yXSBjb25zdHJ1Y3RpbmcnKTtcbiAgLy99XG5cbiAgY2FuX2NvbGxpZGUob2JqMSwgb2JqMil7XG4gICAgbGV0IGdyb3VwX2Nhbl9jb2xsaWRlID0gKG9iajEuY29sbGlzaW9uX2dyb3VwICYgb2JqMi5jb2xsaXNpb25fZ3JvdXApID4gMDtcbiAgICBpZighZ3JvdXBfY2FuX2NvbGxpZGUpIHJldHVybiBmYWxzZTtcblxuICAgIGxldCBjb2xsaXNpb25fdHlwZSA9IG9iajEuY29sbGlzaW9uX2JvZHkuc2hhcGUgKyAnOicgKyBvYmoyLmNvbGxpc2lvbl9ib2R5LnNoYXBlO1xuICAgIC8vIEZJWE1FOiBvcHRpbWl6ZSB3aXRoIGJpdCBvcGVyYXRpb24sIGJpdCBjb21wYXJpc29uIHNob3VsZCBiZSBtdWNoIGZhc3RlciB0aGFuIHN0cmluZ1xuICAgIGxldCBvYmoxX2NfYm9keSA9IG9iajEuY29sbGlzaW9uX2JvZHk7XG4gICAgbGV0IG9iajJfY19ib2R5ID0gb2JqMi5jb2xsaXNpb25fYm9keTtcbiAgICBzd2l0Y2goY29sbGlzaW9uX3R5cGUpe1xuICAgICAgY2FzZSBHZW9tZXRyeS5BQUJCICsgJzonICsgR2VvbWV0cnkuQUFCQjpcbiAgICAgICAgcmV0dXJuIHRoaXMuYWFiYl8yX2FhYmJfY2FuX2NvbGxpZGUob2JqMV9jX2JvZHksIG9iajJfY19ib2R5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkNJUkNMRSArICc6JyArIEdlb21ldHJ5LkNJUkNMRTpcbiAgICAgICAgcmV0dXJuIHRoaXMuY2lyY2xlXzJfY2lyY2xlX2Nhbl9jb2xsaWRlKG9iajFfY19ib2R5LCBvYmoyX2NfYm9keSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5BQUJCICsgJzonICsgR2VvbWV0cnkuQ0lSQ0xFOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9hYWJiX2Nhbl9jb2xsaWRlKG9iajJfY19ib2R5LCBvamIxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkNJUkNMRSArICc6JyArIEdlb21ldHJ5LkFBQkI6XG4gICAgICAgIHJldHVybiB0aGlzLmNpcmNsZV8yX2FhYmJfY2FuX2NvbGxpZGUob2JqMV9jX2JvZHksIG9iajJfY19ib2R5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkNJUkNMRSArICc6JyArIEdlb21ldHJ5LkxJTkU6XG4gICAgICAgIHJldHVybiB0aGlzLmNpcmNsZV8yX2xpbmVfY2FuX2NvbGxpZGUob2JqMV9jX2JvZHksIG9iajJfY19ib2R5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkxJTkUgKyAnOicgKyBHZW9tZXRyeS5DSVJDTEU6XG4gICAgICAgIHJldHVybiB0aGlzLmNpcmNsZV8yX2xpbmVfY2FuX2NvbGxpZGUob2JqMl9jX2JvZHksIG9iajFfY19ib2R5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkFBQkIgKyAnOicgKyBHZW9tZXRyeS5MSU5FOlxuICAgICAgICByZXR1cm4gdGhpcy5hYWJiXzJfbGluZV9jYW5fY29sbGlkZShvYmoxX2NfYm9keSwgb2JqMl9jX2JvZHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuTElORSsgJzonICsgR2VvbWV0cnkuQUFCQjpcbiAgICAgICAgcmV0dXJuIHRoaXMuYWFiYl8yX2xpbmVfY2FuX2NvbGxpZGUob2JqMl9jX2JvZHksIG9iajFfY19ib2R5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgX2Rpc3RhbmNlKHBvaW50MSwgcG9pbnQyKXtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KFxuICAgICAgTWF0aC5wb3cocG9pbnQxLngtcG9pbnQyLngsIDIpXG4gICAgICArIE1hdGgucG93KHBvaW50MS55IC0gcG9pbnQyLnksIDIpXG4gICAgKTtcbiAgfVxuXG4gIF9kaXN0YW5jZV9zcXVhcmUocG9pbnQxLCBwb2ludDIpe1xuICAgIHJldHVybiBNYXRoLnBvdyhwb2ludDEueC1wb2ludDIueCwgMilcbiAgICAgICsgTWF0aC5wb3cocG9pbnQxLnkgLSBwb2ludDIueSwgMik7XG4gIH1cblxuICBhYWJiXzJfYWFiYl9jYW5fY29sbGlkZShhYjEsIGFiMil7XG4gICAgbGV0IG1pbjEgPSBhYjEubWluO1xuICAgIGxldCBtYXgxID0gYWIxLm1heDtcbiAgICBsZXQgbWluMiA9IGFiMi5taW47XG4gICAgbGV0IG1heDIgPSBhYjIubWF4O1xuICAgIHJldHVybiAobWluMS54IDw9IG1heDIueCAmJiBtYXgxLnggPj0gbWluMi54KVxuICAgICAgJiYgKG1pbjEueSA8PSBtYXgyLnkgJiYgbWF4MS55ID49IG1pbjIueSk7XG4gIH1cblxuICBjaXJjbGVfMl9jaXJjbGVfY2FuX2NvbGxpZGUoYzEsIGMyKXtcbiAgICBsZXQgY2VudGVyMSA9IGMxLmNlbnRlcjtcbiAgICBsZXQgY2VudGVyMiA9IGMyLmNlbnRlcjtcbiAgICByZXR1cm4gX2Rpc3RhbmNlX3NxdWFyZShjZW50ZXIxLCBjZW50ZXIyKSA8PSBNYXRoLnBvdyhjMS5yICsgYzIuciwgMik7XG4gIH1cblxuICAvLyByZXR1cm4geCAgd2hlbiBtaW4gPCB4IDwgbWF4LCBvdGhlciB3aXNlIHJldHVybiB3aGljaCBldmVyIGlzIGNsb3NlciB0byB4IGZyb20gKG1pbiwgbWF4KVxuICBfY2xhbXAoeCwgbWluLCBtYXgpe1xuICAgIHJldHVybiB4IDwgbWluID8gbWluIDogeCA+IG1heCA/IG1heCA6IHg7XG4gIH1cblxuICBjaXJjbGVfMl9hYWJiX2Nhbl9jb2xsaWRlKGMsIGFiKXtcbiAgICBsZXQgY2VudGVyID0gYy5jZW50ZXI7XG4gICAgbGV0IGNsYW1wX3ggPSBfY2xhbXAoY2VudGVyLngsIGFiLm1pbi54LCBhYi5tYXgueCk7XG4gICAgbGV0IGNsYW1wX3kgPSBfY2xhbXAoY2VudGVyLnksIGFiLm1pbi55LCBhYi5tYXgueSk7XG5cbiAgICByZXR1cm4gTWF0aC5hYnMoY2VudGVyLnggLSBjbGFtcF94KSA8IGMuclxuICAgICAgJiYgTWF0aC5hYnMoY2VudGVyLnkgLSBjbGFtcF95KSA8IGMucjtcbiAgfVxuXG4gIGNpcmNsZV8yX2xpbmVfY2FuX2NvbGxpZGUoYywgbCl7XG4gICAgbGV0IGNlbnRlciA9IGMuY2VudGVyO1xuICAgIHN3aXRjaChsLnBhcmFsbGVsX3RvKXtcbiAgICAgIGNhc2UgJ3gnOlxuICAgICAgICByZXR1cm4gTWF0aC5hYnMoY2VudGVyLnkgLSBsLnBvcykgPCBjLnI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAneSc6XG4gICAgICAgIHJldHVybiBNYXRoLmFicyhjZW50ZXIueCAtIGwucG9zKSA8IGMucjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgYWFiYl8yX2xpbmVfY2FuX2NvbGxpZGUoYWIsIGwpe1xuICAgIGxldCBtaW4gPSBhYi5taW47XG4gICAgbGV0IG1heCA9IGFiLm1heDtcbiAgICBzd2l0Y2gobC5wYXJhbGxlbF90byl7XG4gICAgICBjYXNlICd4JzpcbiAgICAgICAgcmV0dXJuIGNlbnRlci55IDw9IG1heC55ICYmIGNlbnRlci55ID49IG1pbi55O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3knOlxuICAgICAgICByZXR1cm4gY2VudGVyLnggPD0gbWF4LnggJiYgY2VudGVyLnggPj0gbWluLng7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxpc2lvbkRldGVjdG9yO1xubW9kdWxlLmV4cG9ydHMuTk9fQ09MTElTSU9OID0gTk9fQ09MTElTSU9OO1xubW9kdWxlLmV4cG9ydHMuQ19HUk9VUDEgPSBDX0dST1VQMTtcbm1vZHVsZS5leHBvcnRzLkNfR1JPVVAyID0gQ19HUk9VUDI7XG5tb2R1bGUuZXhwb3J0cy5DX0dST1VQMyA9IENfR1JPVVAzO1xubW9kdWxlLmV4cG9ydHMuQ19HUk9VUDQgPSBDX0dST1VQNDtcbiIsInZhciBHZW9tZXRyeSA9IHJlcXVpcmUoJy4vR2VvbWV0cnkuanMnKTtcblxuY2xhc3MgR2FtZU9iamVjdHtcbiAgY29uc3RydWN0b3IoY29sbGlzaW9uX2dyb3VwLCBjb2xsaXNpb25fYm9keSwgZGlzcGxheV9ib2R5LCBtb3ZlYWJsZSl7XG4gICAgY29uc29sZS5sb2coJ1tHYW1lT2JqZWN0XSBjb25zdHJ1Y3RpbmcnKTtcbiAgICB0aGlzLmNvbGxpc2lvbl9ncm91cCA9IGNvbGxpc2lvbl9ncm91cDtcbiAgICB0aGlzLmNvbGxpc2lvbl9ib2R5ID0gY29sbGlzaW9uX2JvZHk7XG4gICAgdGhpcy5kaXNwbGF5X2JvZHkgPSBkaXNwbGF5X2JvZHk7XG4gICAgdGhpcy5tb3ZlYWJsZSA9IG1vdmVhYmxlO1xuXG4gICAgaWYoY29sbGlzaW9uX2JvZHkuc2hhcGUgPT0gR2VvbWV0cnkuQUFCQil7XG4gICAgICB0aGlzLnggPSBjb2xsaXNpb25fYm9keS5taW4ueDtcbiAgICAgIHRoaXMueSA9IGNvbGxpc2lvbl9ib2R5Lm1pbi55O1xuICAgIH1lbHNlIGlmKGNvbGxpc2lvbl9ib2R5LnNoYXBlID09IEdlb21ldHJ5LkNJUkNMRSl7XG4gICAgICB0aGlzLnggPSBjb2xsaXNpb25fYm9keS5jZW50ZXIueDtcbiAgICAgIHRoaXMueSA9IGNvbGxpc2lvbl9ib2R5LmNlbnRlci55O1xuICAgIH1cbiAgfVxuXG4gIGdldF9wb3NpdGlvbigpe1xuICAgIHJldHVybiB7J3gnOnRoaXMueCwgJ3knOnRoaXMueX07XG4gIH1cblxuICBzZXRfcG9zaXRpb24oeCwgeSl7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIGlmKHRoaXMuY29sbGlzaW9uX2JvZHkuc2hhcGUgPT0gR2VvbWV0cnkuQUFCQil7XG4gICAgICB0aGlzLmNvbGxpc2lvbl9ib2R5Lm1pbl94ID0geDtcbiAgICAgIHRoaXMuY29sbGlzaW9uX2JvZHkubWluX3kgPSB5O1xuICAgICAgdGhpcy5jb2xsaXNpb25fYm9keS5tYXhfeCA9IHggKyB0aGlzLmNvbGxpc2lvbl9ib2R5LndpZHRoO1xuICAgICAgdGhpcy5jb2xsaXNpb25fYm9keS5tYXhfeSA9IHkgKyB0aGlzLmNvbGxpc2lvbl9ib2R5LmhlaWdodDtcbiAgICB9ZWxzZSBpZih0aGlzLmNvbGxpc2lvbl9ib2R5LnNoYXBlID09IEdlb21ldHJ5LkxJTkUpe1xuICAgICAgaWYodGhpcy5jb2xsaXNpb25fYm9keS5wYXJhbGxlbF90byA9PSAneCcpe1xuICAgICAgICB0aGlzLmNvbGxpc2lvbl9ib2R5LnBvcyA9IHk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5jb2xsaXNpb25fYm9keS5wb3MgPSB4O1xuICAgICAgfVxuICAgIH1lbHNlIGlmKHRoaXMuY29sbGlzaW9uX2JvZHkuc2hhcGUgPT0gR2VvbWV0cnkuQ0lSQ0xFKXtcbiAgICAgIHRoaXMuY29sbGlzaW9uX2JvZHkuY2VudGVyLnggPSB0aGlzLng7XG4gICAgICB0aGlzLmNvbGxpc2lvbl9ib2R5LmNlbnRlci55ID0gdGhpcy55O1xuICAgIH1cbiAgfVxuXG4gIHNldF92ZWxvY2l0eSh2X3gsIHZfeSl7XG4gICAgdGhpcy52X3ggPSB2X3g7XG4gICAgdGhpcy52X3kgPSB2X3k7XG4gIH1cblxuICBzZXRfYWNjZWxlcmF0aW9uKGFfeCwgYV95KXtcbiAgICB0aGlzLmFfeCA9IGFfeDtcbiAgICB0aGlzLmFfeSA9IGFfeTtcbiAgfVxuICAvLyBhYWJiIHNob3VsZCBoYXZlOlxuICAvLyBtaW46IHt4OiA8PiwgeTo8Pn1cbiAgLy8gbWF4OiB7eDogPD4sIHk6PD59XG5cbiAgLy8gY2lyY2xlIHNob3VsZCBoYXZlOlxuICAvLyBjZW50ZXI6IHt4OiA8PiwgeTo8Pn1cbiAgLy8gcjogPD5cblxuICAvLyBsaW5lcyBhcmUgaW5maW5pdGUgbGluZSwgYW5kIHNob3VsZCBoYXZlOlxuICAvLyBwYXJhbGxlbF90bzogWyd4J3wneSddXG4gIC8vIHBvczogPD5cblxuXG59XG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPYmplY3Q7XG4iLCJjb25zdCBMSU5FID0gMTtcbmNvbnN0IEFBQkIgPSAyO1xuY29uc3QgQ0lSQ0xFID0gMztcblxuY2xhc3MgR2VvbWV0cnl7XG4gIGNvbnN0cnVjdG9yKHNoYXBlKXtcbiAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBHZW9tZXRyeTtcbm1vZHVsZS5leHBvcnRzLkxJTkUgPSBMSU5FO1xubW9kdWxlLmV4cG9ydHMuQUFCQiA9IEFBQkI7XG5tb2R1bGUuZXhwb3J0cy5DSVJDTEUgPSBDSVJDTEU7XG4iLCJ2YXIgR2VvbWV0cnkgPSByZXF1aXJlKCcuL0dlb21ldHJ5LmpzJyk7XG5jbGFzcyBJbXBsdXNlUmVzb2x2ZXJ7XG4gIHJlc29sdmUob2JqMSwgb2JqMil7XG4gICAgbGV0IGNvbGxpc2lvbl90eXBlID0gb2JqMS5jb2xsaXNpb25fYm9keS5zaGFwZSArICc6JyArIG9iajIuY29sbGlzaW9uX2JvZHkuc2hhcGU7XG4gICAgc3dpdGNoKGNvbGxpc2lvbl90eXBlKXtcbiAgICAgIGNhc2UgR2VvbWV0cnkuQUFCQiArICc6JyArIEdlb21ldHJ5LkFBQkI6XG4gICAgICAgIGNvbnNvbGUubG9nKCdhYWJiIDIgYWFiYiBpbXBsdXNlIHJlc29sdXRpb24gbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuQ0lSQ0xFICsgJzonICsgR2VvbWV0cnkuQ0lSQ0xFOlxuICAgICAgICBjb25zb2xlLmxvZygnY2lyY2xlIDIgY2lyY2xlIGltcGx1c2UgcmVzb2x1dGlvbiBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5BQUJCICsgJzonICsgR2VvbWV0cnkuQ0lSQ0xFOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9hYWJiX3Jlc29sdXRpb24ob2JqMiwgb2piMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5DSVJDTEUgKyAnOicgKyBHZW9tZXRyeS5BQUJCOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9hYWJiX3Jlc29sdXRpb24ob2JqMSwgb2piMik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5DSVJDTEUgKyAnOicgKyBHZW9tZXRyeS5MSU5FOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9saW5lX3Jlc29sdXRpb24ob2JqMSwgb2JqMik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5MSU5FICsgJzonICsgR2VvbWV0cnkuQ0lSQ0xFOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9saW5lX3Jlc29sdXRpb24ob2JqMiwgb2JqMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5BQUJCICsgJzonICsgR2VvbWV0cnkuTElORTpcbiAgICAgICAgY29uc29sZS5sb2coJ2FhYmIgMiBsaW5lIGltcGx1c2UgcmVzb2x1dGlvbiBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5MSU5FKyAnOicgKyBHZW9tZXRyeS5BQUJCOlxuICAgICAgICBjb25zb2xlLmxvZygnbGluZSAyIGFhYmIgaW1wbHVzZSByZXNvbHV0aW9uIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgY2lyY2xlXzJfYWFiYl9yZXNvbHV0aW9uKGMsIGFiKXtcbiAgICBjLnZfeCAqPSAtMTtcbiAgICBjLnZfeSAqPSAtMTtcbiAgfVxuXG4gIGNpcmNsZV8yX2xpbmVfcmVzb2x1dGlvbihjLCBsKXtcbiAgICBzd2l0Y2gobC5jb2xsaXNpb25fYm9keS5wYXJhbGxlbF90byl7XG4gICAgICBjYXNlICd4JzpcbiAgICAgICAgYy52X3kgKj0gLTE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAneSc6XG4gICAgICAgIGMudl94ICo9IC0xO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gSW1wbHVzZVJlc29sdmVyO1xuIiwidmFyIEdlb21ldHJ5ID0gcmVxdWlyZSgnLi9HZW9tZXRyeS5qcycpO1xudmFyIENvbGxpc2lvbkRldGVjdG9yID0gcmVxdWlyZSgnLi9Db2xsaXNpb25EZXRlY3Rvci5qcycpO1xuXG5jbGFzcyBMaW5lIGV4dGVuZHMgR2VvbWV0cnl7XG4gIGNvbnN0cnVjdG9yKHBhcmFsbGVsX3RvLCBwb3Mpe1xuICAgIHN1cGVyKEdlb21ldHJ5LkxJTkUpO1xuICAgIHRoaXMuYm9keV90eXBlID0gQ29sbGlzaW9uRGV0ZWN0b3IuQ19CT0RZX0xJTkU7XG4gICAgdGhpcy5wYXJhbGxlbF90byA9IHBhcmFsbGVsX3RvO1xuICAgIHRoaXMucG9zID0gcG9zO1xuICB9XG4gIHJlbmRlcihjdHgpe1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBzd2l0Y2godGhpcy5wYXJhbGxlbF90byl7XG4gICAgICBjYXNlICd4JzpcbiAgICAgICAgY3R4Lm1vdmVUbygwLCB0aGlzLnBvcyk7XG4gICAgICAgIGN0eC5saW5lVG8oMTAwMDAsIHRoaXMucG9zKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd5JzpcbiAgICAgICAgY3R4Lm1vdmVUbyh0aGlzLnBvcywgMCk7XG4gICAgICAgIGN0eC5saW5lVG8odGhpcy5wb3MsIDEwMDAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gTGluZTtcbiIsInZhciBDb2xsaXNpb25EZXRlY3RvciA9IHJlcXVpcmUoJy4vQ29sbGlzaW9uRGV0ZWN0b3IuanMnKTtcbnZhciBDaXJjbGUgPSByZXF1aXJlKCcuL0NpcmNsZS5qcycpO1xudmFyIEFBQkIgPSByZXF1aXJlKCcuL0FBQkIuanMnKTtcbnZhciBMaW5lID0gcmVxdWlyZSgnLi9MaW5lLmpzJyk7XG52YXIgR2FtZU9iamVjdCA9IHJlcXVpcmUoJy4vR2FtZU9iamVjdC5qcycpO1xudmFyIEltcGx1c2VSZXNvbHZlciA9IHJlcXVpcmUoJy4vSW1wbHVzZVJlc29sdmVyLmpzJyk7XG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVfZmllbGRcIik7XG52YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGtleURvd25IYW5kbGVyLCBmYWxzZSk7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwga2V5VXBIYW5kbGVyLCBmYWxzZSk7XG4vL2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBrZXlQcmVzc0hhbmRsZXIsIGZhbHNlKTtcblxuZ2FtZV9sZW5ndGggPSAxMDAwO1xuY3VycmVudF9nYW1lX3RpY2sgPSAwO1xuc3RhdGVfaGlzdG9yeSA9IHt9O1xuZW5kaW5nX3RpY2sgPSAwO1xuXG5nYW1lX3N0YXJ0ZWQgPSBmYWxzZTtcbnBhdXNlZCA9IGZhbHNlO1xucGF1c2Vfc3RhcnRfYXQgPSAwO1xudG90YWxfcGF1c2VkID0gMDtcbmdhbWVfZW5kZWQgPSBmYWxzZTtcbmdhbWVfZW5kX3dpdGhfc3RhdHVzID0gJyc7XG5cbkdBTUVfV09OX1NUQVRVUyA9ICd3aW4nO1xuR0FNRV9MT1NUX1NUQVRVUyA9ICdsb3N0JztcbklOX0dBTUVfU1RBVFVTID0gJ2luX2dhbWUnO1xuXG52YXIgZnJpY3Rpb24gPSAwLjAwMTtcbnZhciBhY2NlbGVyYXRpb24gPSAwLjAzO1xudmFyIGZ1ZWxfZWZmaWNpZW5jeSA9IDU7XG5cbnZhciBwbGF5ZXJfYm9keSA9IG5ldyBDaXJjbGUoMTAsIDIwMCwgNSk7XG52YXIgcGxheWVyID0gbmV3IEdhbWVPYmplY3QoQ29sbGlzaW9uRGV0ZWN0b3IuQ19HUk9VUDEsIHBsYXllcl9ib2R5LCBwbGF5ZXJfYm9keSwgdHJ1ZSk7XG5wbGF5ZXIuc2V0X3ZlbG9jaXR5KDUsIDUpO1xucGxheWVyLnNldF9hY2NlbGVyYXRpb24oMCwgMCk7XG5cbnZhciB0YXJnZXRfYm9keSA9IG5ldyBDaXJjbGUoNDAwLCA4MCwgcGxheWVyX2JvZHkuciAqIDIpO1xudmFyIHRhcmdldCA9IG5ldyBHYW1lT2JqZWN0KENvbGxpc2lvbkRldGVjdG9yLk5PX0NPTExJU0lPTiwgdGFyZ2V0X2JvZHksIHRhcmdldF9ib2R5LCBmYWxzZSk7XG5cbnZhciBwbGF5ZXJfZnV0dXJlX2JvZHkgPSBuZXcgQ2lyY2xlKDAsIDAsIHBsYXllcl9ib2R5LnIpO1xudmFyIHBsYXllcl9mdXR1cmUgPSBuZXcgR2FtZU9iamVjdChDb2xsaXNpb25EZXRlY3Rvci5OT19DT0xMSVNJT04sIHBsYXllcl9mdXR1cmVfYm9keSwgcGxheWVyX2Z1dHVyZV9ib2R5LCBmYWxzZSk7XG5cbnZhciBsZWZ0X2xpbmUgPSBuZXcgTGluZSgneScsIDApO1xudmFyIHJpZ2h0X2xpbmUgPSBuZXcgTGluZSgneScsIGNhbnZhcy53aWR0aCk7XG52YXIgdG9wX2xpbmUgPSBuZXcgTGluZSgneCcsIDApO1xudmFyIGJvdHRvbV9saW5lID0gbmV3IExpbmUoJ3gnLCBjYW52YXMuaGVpZ2h0KTtcbnZhciBsZWZ0ID0gbmV3IEdhbWVPYmplY3QoQ29sbGlzaW9uRGV0ZWN0b3IuQ19HUk9VUDEsIGxlZnRfbGluZSwgbGVmdF9saW5lLCBmYWxzZSk7XG52YXIgcmlnaHQgPSBuZXcgR2FtZU9iamVjdChDb2xsaXNpb25EZXRlY3Rvci5DX0dST1VQMSwgcmlnaHRfbGluZSwgcmlnaHRfbGluZSwgZmFsc2UpO1xudmFyIHRvcCA9IG5ldyBHYW1lT2JqZWN0KENvbGxpc2lvbkRldGVjdG9yLkNfR1JPVVAxLCB0b3BfbGluZSwgdG9wX2xpbmUsIGZhbHNlKTtcbnZhciBib3R0b20gPSBuZXcgR2FtZU9iamVjdChDb2xsaXNpb25EZXRlY3Rvci5DX0dST1VQMSwgYm90dG9tX2xpbmUsIGJvdHRvbV9saW5lLCBmYWxzZSk7XG5cbnZhciBzdGF0ZV8yID0ge1xuICAncGxheWVyJzogcGxheWVyLFxuICAndGFyZ2V0JzogdGFyZ2V0LFxuICAncGxheWVyX2Z1dHVyZSc6IHBsYXllcl9mdXR1cmVcbn1cblxudmFyIHN0YXRlID0ge1xuICAncG9zX3gnOiAxMCxcbiAgJ3Bvc195JzogMjAwLFxuICAndF9wb3NfeCc6IDQwMCxcbiAgJ3RfcG9zX3knOiA4MCxcbiAgJ2ZfcG9zX3gnOiAwLFxuICAnZl9wb3NfeSc6IDAsXG4gICdyYWRpdXMnOiA1LFxuICAnd2luX2Rpc3QnOiAxNSxcbiAgJ3ZfeCc6IDEsXG4gICd2X3knOiAxLFxuICAnYV94JzogMCxcbiAgJ2FfeSc6IDAsXG4gICdmaWVsZF93aWR0aCc6IGNhbnZhcy53aWR0aCxcbiAgJ2ZpZWxkX2hlaWdodCc6IGNhbnZhcy5oZWlnaHQsXG4gICdmaWVsZF90b3BfbGVmdF94JzogMCxcbiAgJ2ZpZWxkX3RvcF9sZWZ0X3knOiA1MCxcbn1cblxudmFyIHRpbWVfYmFyX3dpZHRoID0gMTAwO1xudmFyIHRpbWVfYmFyID0ge1xuICAnd2lkdGgnOiB0aW1lX2Jhcl93aWR0aCxcbiAgJ2hlaWdodCc6IDMwLFxuICAncG9zX3gnOiBjYW52YXMud2lkdGggLSAxMCAtIHRpbWVfYmFyX3dpZHRoLFxuICAncG9zX3knOiAxMCxcbiAgJ2ZpbGwnOiB0aW1lX2Jhcl93aWR0aFxufVxuXG52YXIgZnVlbF9iYXJfd2lkdGggPSAxMDA7XG52YXIgZnVlbF9iYXIgPSB7XG4gICd3aWR0aCc6IGZ1ZWxfYmFyX3dpZHRoLFxuICAnaGVpZ2h0JzogMzAsXG4gICdwb3NfeCc6IGNhbnZhcy53aWR0aCAtIDEwIC0gdGltZV9iYXJfd2lkdGggLSBmdWVsX2Jhcl93aWR0aCAtIDEwLFxuICAncG9zX3knOiAxMCxcbiAgJ2ZpbGwnOiBmdWVsX2Jhcl93aWR0aFxufVxuXG5mdW5jdGlvbiB1cGRhdGVfdGltZV9iYXIoKXtcbiAgdGltZV9iYXJbJ2ZpbGwnXSA9IHRpbWVfYmFyX3dpZHRoIC0gKGN1cnJlbnRfZ2FtZV90aWNrICogdGltZV9iYXJfd2lkdGggLyBnYW1lX2xlbmd0aCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcl9mdWVsX2JhcihjdHgsIGZ1ZWxfYmFyKXtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICBjdHgucmVjdChmdWVsX2JhclsncG9zX3gnXSwgZnVlbF9iYXJbJ3Bvc195J10sIGZ1ZWxfYmFyWyd3aWR0aCddLCBmdWVsX2JhclsnaGVpZ2h0J10pO1xuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5maWxsU3R5bGUgPSAncmVkJztcbiAgY3R4LnJlY3QoZnVlbF9iYXJbJ3Bvc194J10gKyAxLCBmdWVsX2JhclsncG9zX3knXSArIDEsIGZ1ZWxfYmFyWydmaWxsJ10gLSAyLCBmdWVsX2JhclsnaGVpZ2h0J10gLSAyKTtcbiAgY3R4LmZpbGwoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJfdGltZV9iYXIoY3R4LCB0aW1lX2Jhcil7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgY3R4LnJlY3QodGltZV9iYXJbJ3Bvc194J10sIHRpbWVfYmFyWydwb3NfeSddLCB0aW1lX2Jhclsnd2lkdGgnXSwgdGltZV9iYXJbJ2hlaWdodCddKTtcbiAgY3R4LnN0cm9rZSgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguZmlsbFN0eWxlID0gJ2dyZXknO1xuICBjdHgucmVjdCh0aW1lX2JhclsncG9zX3gnXSArIDEsIHRpbWVfYmFyWydwb3NfeSddICsgMSwgdGltZV9iYXJbJ2ZpbGwnXSAtIDIsIHRpbWVfYmFyWydoZWlnaHQnXSAtIDIpO1xuICBjdHguZmlsbCgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcl9nYW1lX2VuZChjdHgsIHN0YXR1cyl7XG4gIHZhciBlbmRpbmdfdGV4dCA9ICdZb3UgV2luISc7XG4gIGlmKHN0YXR1cyA9PSBHQU1FX0xPU1RfU1RBVFVTKXtcbiAgICBlbmRpbmdfdGV4dCA9ICdZb3UgbG9zdCEnO1xuICB9XG4gIGN0eC5mb250ID0gXCIzMHB4IEFyaWFsXCI7XG4gIGN0eC5maWxsVGV4dChlbmRpbmdfdGV4dCwgY2FudmFzLndpZHRoIC8gMiwgY2FudmFzLmhlaWdodCAvIDIpO1xufVxuXG5cblxudmFyIG1vdmVzID0ge1xuICBcIkFycm93RG93blwiOiBmYWxzZSxcbiAgXCJBcnJvd1VwXCI6IGZhbHNlLFxuICBcIkFycm93TGVmdFwiOiBmYWxzZSxcbiAgXCJBcnJvd1JpZ2h0XCI6IGZhbHNlXG59XG5cbmZ1bmN0aW9uIGtleURvd25IYW5kbGVyKGUpe1xuICBpZihlLmNvZGUgaW4gbW92ZXMpe1xuICAgIG1vdmVzW2UuY29kZV0gPSB0cnVlO1xuICAgIGlmKGZ1ZWxfYmFyWydmaWxsJ10gPj0gZnVlbF9lZmZpY2llbmN5KXtcbiAgICAgIHN3aXRjaChlLmNvZGUpe1xuICAgICAgICBjYXNlIFwiQXJyb3dVcFwiOlxuICAgICAgICAgIHN0YXRlWydhX3knXSAtPSBhY2NlbGVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJBcnJvd0Rvd25cIjpcbiAgICAgICAgICBzdGF0ZVsnYV95J10gKz0gYWNjZWxlcmF0aW9uO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiQXJyb3dMZWZ0XCI6XG4gICAgICAgICAgc3RhdGVbJ2FfeCddIC09IGFjY2VsZXJhdGlvbjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIkFycm93UmlnaHRcIjpcbiAgICAgICAgICBzdGF0ZVsnYV94J10gKz0gYWNjZWxlcmF0aW9uO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZnVlbF9iYXJbJ2ZpbGwnXSAtPSBmdWVsX2VmZmljaWVuY3k7XG4gICAgfWVsc2V7XG4gICAgICBmdWVsX2JhclsnZmlsbCddID0gMDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24ga2V5VXBIYW5kbGVyKGUpe1xuICBpZihlLmNvZGUgaW4gbW92ZXMpe1xuICAgIG1vdmVzW2UuY29kZV0gPSBmYWxzZTtcbiAgICBzd2l0Y2goZS5jb2RlKXtcbiAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgIHN0YXRlWydhX3knXSA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICBzdGF0ZVsnYV95J10gPSAwO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJBcnJvd0xlZnRcIjpcbiAgICAgICAgc3RhdGVbJ2FfeCddID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dSaWdodFwiOlxuICAgICAgICBzdGF0ZVsnYV94J10gPSAwO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgc3RhdGVfcHJlZGljdGlvbigpO1xuICB9XG59XG5cbnZhciBtaW5fdmVsb2NpdHkgPSAwLjAwMztcbmZ1bmN0aW9uIGNoZWNrX3N0b3BwZWQoc3RhdGUpe1xuICByZXR1cm4gTWF0aC5hYnMoc3RhdGVbJ3ZfeCddKSA8PSBtaW5fdmVsb2NpdHkgJiYgTWF0aC5hYnMoc3RhdGVbJ3ZfeSddKSA8PSBtaW5fdmVsb2NpdHk7XG59XG5cbmZ1bmN0aW9uIHN0YXRlX3ByZWRpY3Rpb24oKXtcbiAgdmFyIHN0YXRlX2NvcHkgPSByb290X2Nsb25lKHN0YXRlKTtcbiAgc3RhdGVfaGlzdG9yeVtjdXJyZW50X2dhbWVfdGlja10gPSBzdGF0ZTtcbiAgdmFyIGkgPSBjdXJyZW50X2dhbWVfdGljaztcbiAgd2hpbGUoKE1hdGguYWJzKHN0YXRlX2NvcHlbJ3ZfeCddKSA+IDAuMDAzIHx8IE1hdGguYWJzKHN0YXRlX2NvcHlbJ3ZfeSddKSA+IDAuMDAzKSAmJiBpIDwgZ2FtZV9sZW5ndGgpe1xuICAgIHN0YXRlX2NvcHkgPSBwaHlzaWNzX2VuZ2luZV9zdGVwKHN0YXRlX2NvcHksIHVuZGVmaW5lZCk7XG4gICAgc3RhdGVfaGlzdG9yeVtpXSA9IHN0YXRlX2NvcHk7XG4gICAgaSsrO1xuICB9XG4gIGVuZGluZ190aWNrID0gaSAtIDE7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcmVyKHN0YXRlKXtcbiAgY3R4LnNhdmUoKTtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gIHJlbmRlcl90aW1lX2JhcihjdHgsIHRpbWVfYmFyKTtcbiAgcmVuZGVyX2Z1ZWxfYmFyKGN0eCwgZnVlbF9iYXIpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgY3R4LnJlY3Qoc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3gnXSwgc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3knXSwgc3RhdGVbJ2ZpZWxkX3dpZHRoJ10sIHN0YXRlWydmaWVsZF9oZWlnaHQnXSAtIHN0YXRlWydmaWVsZF90b3BfbGVmdF95J10pO1xuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gIGN0eC5yZWN0KDEwMCwgMTAwLCAzMCwgMzApO1xuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICBjdHguYXJjKHN0YXRlWydwb3NfeCddLCBzdGF0ZVsncG9zX3knXSwgc3RhdGVbJ3JhZGl1cyddLCAwLCAyKk1hdGguUEkpO1xuICBjdHguZmlsbCgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICBjdHguc2V0TGluZURhc2goWzJdKTtcbiAgY3R4LmFyYyhzdGF0ZVsnZl9wb3NfeCddLCBzdGF0ZVsnZl9wb3NfeSddLCBzdGF0ZVsncmFkaXVzJ10sIDAsIDIqTWF0aC5QSSk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LnNldExpbmVEYXNoKFtdKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ3JlZCc7XG4gIGN0eC5hcmMoc3RhdGVbJ3RfcG9zX3gnXSwgc3RhdGVbJ3RfcG9zX3knXSwgc3RhdGVbJ3JhZGl1cyddKjIsIDAsIDIqTWF0aC5QSSk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGlmKGdhbWVfZW5kZWQpe1xuICAgIHJlbmRlcl9nYW1lX2VuZChjdHgsIGdhbWVfZW5kX3dpdGhfc3RhdHVzKTtcbiAgfVxuICBjdHgucmVzdG9yZSgpO1xufVxuXG5mdW5jdGlvbiBjaGVja19nYW1lX2VuZChzdGF0ZSl7XG4gIHZhciBkaXN0X3RvX2dvYWwgPSBNYXRoLnNxcnQoTWF0aC5wb3coc3RhdGVbJ3Bvc194J10gLSBzdGF0ZVsndF9wb3NfeCddLCAyKSArIE1hdGgucG93KHN0YXRlWydwb3NfeSddIC0gc3RhdGVbJ3RfcG9zX3knXSwgMikpO1xuICBpZihjdXJyZW50X2dhbWVfdGljayA+PSBnYW1lX2xlbmd0aCl7XG4gICAgaWYoZGlzdF90b19nb2FsID4gc3RhdGVbJ3dpbl9kaXN0J10pe1xuICAgICAgcmV0dXJuIEdBTUVfTE9TVF9TVEFUVVM7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gR0FNRV9XT05fU1RBVFVTO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgaWYoY2hlY2tfc3RvcHBlZChzdGF0ZSkgICYmIGRpc3RfdG9fZ29hbCA8PSBzdGF0ZVsnd2luX2Rpc3QnXSl7XG4gICAgICByZXR1cm4gR0FNRV9XT05fU1RBVFVTO1xuICAgIH1lbHNlIGlmKGNoZWNrX3N0b3BwZWQoc3RhdGUpICYmIGZ1ZWxfYmFyWydmaWxsJ10gPCBmdWVsX2VmZmljaWVuY3kpe1xuICAgICAgcmV0dXJuIEdBTUVfTE9TVF9TVEFUVVM7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gSU5fR0FNRV9TVEFUVVM7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1haW5Mb29wKCl7XG4gIGlmKCFnYW1lX3N0YXJ0ZWQpe1xuICAgIGdhbWVfc3RhcnRlZCA9IHRydWU7XG4gICAgc3RhdGVfcHJlZGljdGlvbigpO1xuICB9XG4gIHZhciBnYW1lX2VuZF9zdGF0dXMgPSBjaGVja19nYW1lX2VuZChzdGF0ZSk7XG4gIGlmKGdhbWVfZW5kX3N0YXR1cyA9PSBJTl9HQU1FX1NUQVRVUyl7XG4gICAgaWYoY3VycmVudF9nYW1lX3RpY2sgPCBnYW1lX2xlbmd0aCl7XG4gICAgICBzdGF0ZVsnZl9wb3NfeCddID0gc3RhdGVfaGlzdG9yeVtlbmRpbmdfdGlja11bJ3Bvc194J107XG4gICAgICBzdGF0ZVsnZl9wb3NfeSddID0gc3RhdGVfaGlzdG9yeVtlbmRpbmdfdGlja11bJ3Bvc195J107XG4gICAgICBzdGF0ZSA9IHBoeXNpY3NfZW5naW5lX3N0ZXAoc3RhdGUsIHVuZGVmaW5lZCk7XG4gICAgICByZW5kZXJlcihzdGF0ZSk7XG4gICAgICBjdXJyZW50X2dhbWVfdGljayArPSAxO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgZ2FtZV9lbmRlZCA9IHRydWU7XG4gICAgZ2FtZV9lbmRfd2l0aF9zdGF0dXMgPSBnYW1lX2VuZF9zdGF0dXM7XG4gICAgcmVuZGVyZXIoc3RhdGUpO1xuICAgIC8vY29uc29sZS5sb2coc3RhdGUpO1xuICAgIC8vdmFyIGRpc3RfdG9fZ29hbCA9IE1hdGguc3FydChNYXRoLnBvdyhzdGF0ZVsncG9zX3gnXSAtIHN0YXRlWyd0X3Bvc194J10sMikgKyBNYXRoLnBvdyhzdGF0ZVsncG9zX3knXSAtIHN0YXRlWyd0X3Bvc195J10sMikpO1xuICAgIC8vY29uc29sZS5sb2coZGlzdF90b19nb2FsKTtcbiAgfVxufVxuXG52YXIgZGV0ZWN0b3IgPSBuZXcgQ29sbGlzaW9uRGV0ZWN0b3IoKTtcbnZhciByZXNvbHZlciA9IG5ldyBJbXBsdXNlUmVzb2x2ZXIoKTtcblxuZnVuY3Rpb24gcGh5c2ljc19lbmdpbmVfc3RlcF9uZXcoZ2FtZV9vYmplY3RzKXtcbiAgZ2FtZV9vYmplY3RzLmZpbHRlcihvYmogPT4gb2JqLm1vdmVhYmxlKS5mb3JFYWNoKGZ1bmN0aW9uKG9iail7XG4gICAgbGV0IHBvcyA9IG9iai5nZXRfcG9zaXRpb24oKTtcbiAgICBvYmouc2V0X3Bvc2l0aW9uKHBvcy54ICsgb2JqLnZfeCwgcG9zLnkgKyBvYmoudl95KTtcbiAgICBvYmoudl94ICs9IG9iai5hX3g7XG4gICAgb2JqLnZfeSArPSBvYmouYV95O1xuICB9KTtcblxuICB2YXIgY29sbGlzaW9uX3BhaXJzID0gW107XG4gIGZvcih2YXIgaSA9IDAgOyBpIDwgZ2FtZV9vYmplY3RzLmxlbmd0aCA7IGkgKyspe1xuICAgIGZvcih2YXIgaiA9IDEgOyBqIDwgZ2FtZV9vYmplY3RzLmxlbmd0aCA7IGogKyspe1xuICAgICAgaWYoaSAhPSBqICYmIGRldGVjdG9yLmNhbl9jb2xsaWRlKGdhbWVfb2JqZWN0c1tpXSwgZ2FtZV9vYmplY3RzW2pdKSl7XG4gICAgICAgIGNvbGxpc2lvbl9wYWlycy5wdXNoKFtnYW1lX29iamVjdHNbaV0sIGdhbWVfb2JqZWN0c1tqXV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvL2lmKGNvbGxpc2lvbl9wYWlycy5sZW5ndGggPiAwKXtcbiAgICAvL2NvbnNvbGUubG9nKGNvbGxpc2lvbl9wYWlycyk7XG4gIC8vfVxuXG4gIGNvbGxpc2lvbl9wYWlycy5mb3JFYWNoKGZ1bmN0aW9uKGNfcGFpcil7XG4gICAgcmVzb2x2ZXIucmVzb2x2ZShjX3BhaXJbMF0sIGNfcGFpclsxXSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBtYWluTG9vcE5ldygpe1xuICBpZighZ2FtZV9zdGFydGVkKXtcbiAgICBnYW1lX3N0YXJ0ZWQgPSB0cnVlO1xuICB9XG4gIHZhciBnYW1lX29iamVjdHMgPSBbXG4gICAgcGxheWVyLFxuICAgIHRhcmdldCxcbiAgICBsZWZ0LFxuICAgIHJpZ2h0LFxuICAgIHRvcCxcbiAgICBib3R0b21cbiAgXTtcblxuICBwaHlzaWNzX2VuZ2luZV9zdGVwX25ldyhnYW1lX29iamVjdHMpO1xuXG4gIGN0eC5zYXZlKCk7XG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgZ2FtZV9vYmplY3RzLmZvckVhY2goZnVuY3Rpb24ob2JqKXtcbiAgICBvYmouZGlzcGxheV9ib2R5LnJlbmRlcihjdHgpO1xuICB9KTtcbiAgY3R4LnJlc3RvcmUoKTtcbn1cblxuXG5mdW5jdGlvbiByb290X2Nsb25lKG9iail7XG4gIHZhciBjbG9uZSA9IHt9O1xuICBmb3IodmFyIGtleSBpbiBvYmope1xuICAgIGNsb25lW2tleV0gPSBvYmpba2V5XTtcbiAgfVxuICByZXR1cm4gY2xvbmU7XG59XG5cbm1pbl9zcGVlZCA9IDAuMDAzO1xuLyogc3RhdGU6XG57J3ZfeCc6IDEsXG4gJ3ZfeSc6IDEsXG4gJ2FfeCc6IDAuMSxcbiAnYV95JzogMC4xLFxuICdwb3NfeCc6IDEwLFxuICdwb3NfeSc6IDEwLFxuICdyYWRpdXMnOiA1LFxuICdmaWVsZF93aWR0aCc6IDYwMCxcbiAnZmllbGRfaGVpZ2h0JzogNjAwLFxuICdudW1fb2ZfdGlja3MnOiA2MDAwXG59XG4qL1xuZnVuY3Rpb24gcGh5c2ljc19lbmdpbmVfc3RlcChzdGF0ZSwgcmVuZGVyZXIpe1xuICB2YXIgc3RhdGVfY29weSA9IHJvb3RfY2xvbmUoc3RhdGUpO1xuICBzdGF0ZV9jb3B5Wydwb3NfeCddICs9IHN0YXRlX2NvcHlbJ3ZfeCddO1xuICBzdGF0ZV9jb3B5Wydwb3NfeSddICs9IHN0YXRlX2NvcHlbJ3ZfeSddO1xuICBzdGF0ZV9jb3B5Wyd2X3gnXSArPSBzdGF0ZV9jb3B5WydhX3gnXTtcbiAgc3RhdGVfY29weVsndl95J10gKz0gc3RhdGVfY29weVsnYV95J107XG4gIHN0YXRlX2NvcHlbJ3ZfeCddID4gMCA/IHN0YXRlX2NvcHlbJ3ZfeCddIC09IGZyaWN0aW9uIDogc3RhdGVfY29weVsndl94J10gKz0gZnJpY3Rpb247XG4gIHN0YXRlX2NvcHlbJ3ZfeSddID4gMCA/IHN0YXRlX2NvcHlbJ3ZfeSddIC09IGZyaWN0aW9uIDogc3RhdGVfY29weVsndl95J10gKz0gZnJpY3Rpb247XG4gIGlmKE1hdGguYWJzKHN0YXRlX2NvcHlbJ3ZfeCddKSA8PSBtaW5fc3BlZWQpe1xuICAgIHN0YXRlX2NvcHlbJ3ZfeCddID0gMDtcbiAgfVxuICBpZihNYXRoLmFicyhzdGF0ZV9jb3B5Wyd2X3knXSkgPD0gbWluX3NwZWVkKXtcbiAgICBzdGF0ZV9jb3B5Wyd2X3knXSA9IDA7XG4gIH1cblxuICAvLyByZWN0W3gsIHksIHdpZHRoLCBoZWlnaHRdXG4gIHZhciBsaXN0X29mX3JlY3RzID0gW107XG4gIGxpc3Rfb2ZfcmVjdHMucHVzaChbc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3gnXSwgc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3knXSwgc3RhdGVbJ2ZpZWxkX3dpZHRoJ10sIHN0YXRlWydmaWVsZF9oZWlnaHQnXSAtIHN0YXRlWydmaWVsZF90b3BfbGVmdF95J11dKVxuICBsaXN0X29mX3JlY3RzLnB1c2goWzEwMCwgMTAwLCAzMCwgMzBdKTtcbiAgdmFyIGJhbGxfY2VudGVyID0gW3N0YXRlX2NvcHlbJ3Bvc194J10sIHN0YXRlX2NvcHlbJ3Bvc195J11dO1xuICB2YXIgYmFsbF9yYWRpdXMgPSBzdGF0ZV9jb3B5WydyYWRpdXMnXTtcblxuICBmb3IodmFyIGkgPSAwIDsgaSA8IGxpc3Rfb2ZfcmVjdHMubGVuZ3RoIDsgaSArKyl7XG4gICAgdmFyIHJlY3QgPSBsaXN0X29mX3JlY3RzW2ldO1xuICAgIHZhciBsZWZ0X3ggPSByZWN0WzBdO1xuICAgIHZhciByaWdodF94ID0gcmVjdFswXSArIHJlY3RbMl07XG4gICAgdmFyIHRvcF95ID0gcmVjdFsxXTtcbiAgICB2YXIgYm90dG9tX3kgPSByZWN0WzFdICsgcmVjdFszXTtcbiAgICBpZihiYWxsX2NlbnRlclsxXSA+IHRvcF95XG4gICAgICAmJiBiYWxsX2NlbnRlclsxXSA8IGJvdHRvbV95XG4gICAgICAmJiggTWF0aC5hYnMoYmFsbF9jZW50ZXJbMF0gLSBsZWZ0X3gpIDw9IGJhbGxfcmFkaXVzIFxuICAgICAgICB8fCBNYXRoLmFicyhyaWdodF94IC0gYmFsbF9jZW50ZXJbMF0pIDw9IGJhbGxfcmFkaXVzKSl7XG4gICAgICBzdGF0ZV9jb3B5Wyd2X3gnXSAqPSAtMTtcbiAgICB9XG4gICAgaWYoYmFsbF9jZW50ZXJbMF0gPiBsZWZ0X3hcbiAgICAgICYmIGJhbGxfY2VudGVyWzBdIDwgcmlnaHRfeFxuICAgICAgJiYoIE1hdGguYWJzKGJhbGxfY2VudGVyWzFdIC0gdG9wX3kpIDw9IGJhbGxfcmFkaXVzIFxuICAgICAgfHwgTWF0aC5hYnMoYm90dG9tX3kgLSBiYWxsX2NlbnRlclsxXSkgPD0gYmFsbF9yYWRpdXMpKXtcbiAgICAgIHN0YXRlX2NvcHlbJ3ZfeSddICo9IC0xO1xuICAgIH1cbiAgfVxuICBpZihyZW5kZXJlciAhPT0gdW5kZWZpbmVkKXtcbiAgICByZW5kZXJlcihzdGF0ZV9jb3B5KTtcbiAgfVxuICB1cGRhdGVfdGltZV9iYXIoKTtcbiAgcmV0dXJuIHN0YXRlX2NvcHk7XG59XG5cbmNvbnNvbGUubG9nKCdzdGFydCEnKTtcblxuc2V0SW50ZXJ2YWwobWFpbkxvb3BOZXcsIDEwKTtcbi8vc2V0SW50ZXJ2YWwobWFpbkxvb3AsIDEwKTtcbiJdfQ==
