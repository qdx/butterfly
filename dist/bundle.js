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
var ImpluseResolver = require('./ImpluseResolver.js');

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
    let clamp_x = this._clamp(center.x, ab.min.x, ab.max.x);
    let clamp_y = this._clamp(center.y, ab.min.y, ab.max.y);
    let result = 0;
    if(Math.abs(center.x - clamp_x) < c.r
      && Math.abs(center.y - clamp_y) < c.r){
      console.log('collide!');
      result = {
        'contact_type': 0,
        'contact': {
          'point': {
            'x': clamp_x,
            'y': clamp_y },
          'aligned_axis': ''}};
      // collision happened
      if((clamp_x == ab.min.x || clamp_x == ab.max.x)
        &&(clamp_y == ab.min.y || clamp_y == ab.max.y)){
        // point contact with corner
        result['contact_type'] = ImpluseResolver.CONTACT_CIRCLE_2_POINT;
      }else if(clamp_x == ab.min.x || clamp_x == ab.max.x){
        // collision on y axis
        result['contact_type'] = ImpluseResolver.CONTACT_CIRCLE_2_AB_LINE;
        result['contact']['aligned_axis'] = 'y';
      }else if(clamp_y == ab.min.y || clamp_y == ab.max.y){
        // collision on x axis
        result['contact_type'] = ImpluseResolver.CONTACT_CIRCLE_2_AB_LINE;
        result['contact']['aligned_axis'] = 'x';
      }
    }
    return result;
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
    return false;
    let min = ab.min;
    let max = ab.max;
    let center = {};
    center.x = (ab.min.x + ab.max.x) / 2;
    center.y = (ab.min.y + ab.max.y) / 2;
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

},{"./Geometry.js":5,"./ImpluseResolver.js":6}],4:[function(require,module,exports){
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
var Vector = require('./Vector.js');

const CONTACT_CIRCLE_2_POINT = 1;
const CONTACT_CIRCLE_2_AB_LINE = 2;

class ImpluseResolver{
  resolve(obj1, obj2, contact){
    let collision_type = obj1.collision_body.shape + ':' + obj2.collision_body.shape;
    switch(collision_type){
      case Geometry.AABB + ':' + Geometry.AABB:
        console.log('aabb 2 aabb impluse resolution not supported');
        break;
      case Geometry.CIRCLE + ':' + Geometry.CIRCLE:
        console.log('circle 2 circle impluse resolution not supported');
        break;
      case Geometry.AABB + ':' + Geometry.CIRCLE:
        return this.circle_2_aabb_resolution(obj2, obj1, contact);
        break;
      case Geometry.CIRCLE + ':' + Geometry.AABB:
        return this.circle_2_aabb_resolution(obj1, obj2, contact);
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

  circle_2_aabb_resolution(c, ab, contact){
    console.log('resolving!');
    if(contact['contact_type'] == CONTACT_CIRCLE_2_POINT){
      this._circle_2_point_resolution(c, contact['contact']['point']);
    }else if(contact['contact_type'] == CONTACT_CIRCLE_2_AB_LINE){
      this._circle_2_ab_line_resolution(c, contact['contact']['aligned_axis']);
    }
  }

  _circle_2_ab_line_resolution(c, aligned_axis){
    switch(aligned_axis){
      case 'x':
        c.v_y *= -1;
        break
      case 'y':
        c.v_x *= -1;
        break
    }
  }

  _circle_2_point_resolution(c, contact_point){
    let circle_center = c.collision_body.center;
    let contact_vector = new Vector(
      contact_point.x - circle_center.x,
      contact_point.y - circle_center.y);
    let perp_contact_vector = contact_vector.rotate_clockwise_90();
    let velocity_vector = new Vector(c.v_x, c.v_y);

    // let theta be the angle between velocity_vector and perp_contact_vector
    // cos(theta) = V1 . V2 / (|V1| * |V2|)
    let cos_theta = (perp_contact_vector.dot_product(velocity_vector))
      /(perp_contact_vector.magnitude() * velocity_vector.magnitude());

    let sin_theta = Math.sqrt(1 - cos_theta);

    // Use vector rotation matrix:
    //|cos(2*theta), -sin(2*theta)|
    //|sin(2*theta),  cos(2*theta)|
    // to multiply velocity_vector to get the velocity after contact
    // note:
    // cos(2*theta) = cos_theta*cos_theta - sin_theta*sin_theta
    // sin(2*theta) = 2*sin(theta)*cos(theta)
    let middle_result1 = (cos_theta*cos_theta - sin_theta*sin_theta);
    let middle_result2 = 2 * cos_theta * sin_theta;
    let velocity_after_contact = new Vector(
      middle_result1 * velocity_vector.x - middle_result2 * velocity_vector.y,
      middle_result2 * velocity_vector.x + middle_result1 * velocity_vector.y
    )

    c.v_x = velocity_after_contact.x;
    c.v_y = velocity_after_contact.y;
  }

  circle_2_line_resolution(c, l){
    this._circle_2_ab_line_resolution(c, l.collision_body.parallel_to);
  }
}
module.exports = ImpluseResolver;
module.exports.CONTACT_CIRCLE_2_POINT  = CONTACT_CIRCLE_2_POINT;
module.exports.CONTACT_CIRCLE_2_AB_LINE = CONTACT_CIRCLE_2_AB_LINE;

},{"./Geometry.js":5,"./Vector.js":8}],7:[function(require,module,exports){
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
class Vector{
  constructor(x, y){
    this.x = x;
    this.y = y;
  }

  clone(){
    return new Vector(this.x, this.y);
  }

  rotate_clockwise_90(){
    return new Vector(- this.y, this.x);
  }

  magnitude(){
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }

  dot_product(v){
    return this.x * v.x + this.y * v.y;
  }
}

module.exports = Vector;

},{}],9:[function(require,module,exports){
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
      var contact = detector.can_collide(game_objects[i], game_objects[j]);
      if(i != j && contact != 0 ){
        collision_pairs.push([game_objects[i], game_objects[j], contact]);
      }
    }
  }
  //if(collision_pairs.length > 0){
    //console.log(collision_pairs);
  //}

  collision_pairs.forEach(function(c_pair){
    resolver.resolve(c_pair[0], c_pair[1], c_pair[2]);
  });
}

var player_body = new Circle(30, 31, 20);
var player = new GameObject(CollisionDetector.C_GROUP1, player_body, player_body, true);
player.set_velocity(4, 4);
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

var block_aabb = new AABB(100, 100, 300, 200);
var block = new GameObject(CollisionDetector.C_GROUP1, block_aabb, block_aabb, false);

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
    bottom,
    block
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

},{"./AABB.js":1,"./Circle.js":2,"./CollisionDetector.js":3,"./GameObject.js":4,"./ImpluseResolver.js":6,"./Line.js":7}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQUFCQi5qcyIsInNyYy9DaXJjbGUuanMiLCJzcmMvQ29sbGlzaW9uRGV0ZWN0b3IuanMiLCJzcmMvR2FtZU9iamVjdC5qcyIsInNyYy9HZW9tZXRyeS5qcyIsInNyYy9JbXBsdXNlUmVzb2x2ZXIuanMiLCJzcmMvTGluZS5qcyIsInNyYy9WZWN0b3IuanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIEdlb21ldHJ5ID0gcmVxdWlyZSgnLi9HZW9tZXRyeS5qcycpO1xudmFyIENvbGxpc2lvbkRldGVjdG9yID0gcmVxdWlyZSgnLi9Db2xsaXNpb25EZXRlY3Rvci5qcycpO1xuXG5jbGFzcyBBQUJCIGV4dGVuZHMgR2VvbWV0cnl7XG4gIGNvbnN0cnVjdG9yKG1pbl94LCBtaW5feSwgbWF4X3gsIG1heF95KXtcbiAgICBzdXBlcihHZW9tZXRyeS5BQUJCKTtcbiAgICB0aGlzLm1pbiA9IHt9O1xuICAgIHRoaXMubWluLnggPSBtaW5feDtcbiAgICB0aGlzLm1pbi55ID0gbWluX3k7XG4gICAgdGhpcy5tYXggPSB7fTtcbiAgICB0aGlzLm1heC54ID0gbWF4X3g7XG4gICAgdGhpcy5tYXgueSA9IG1heF95O1xuICAgIHRoaXMud2lkdGggPSBtYXhfeCAtIG1pbl94O1xuICAgIHRoaXMuaGVpZ2h0ID0gbWF4X3kgLSBtaW5feTtcbiAgfVxuICByZW5kZXIoY3R4KXtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnJlY3QoXG4gICAgICB0aGlzLm1pbi54LFxuICAgICAgdGhpcy5taW4ueSxcbiAgICAgIHRoaXMubWF4LnggLSB0aGlzLm1pbi54LFxuICAgICAgdGhpcy5tYXgueSAtIHRoaXMubWluLnkpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gQUFCQjtcbiIsInZhciBHZW9tZXRyeSA9IHJlcXVpcmUoJy4vR2VvbWV0cnkuanMnKTtcbnZhciBDb2xsaXNpb25EZXRlY3RvciA9IHJlcXVpcmUoJy4vQ29sbGlzaW9uRGV0ZWN0b3IuanMnKTtcblxuY2xhc3MgQ2lyY2xlIGV4dGVuZHMgR2VvbWV0cnl7XG4gIGNvbnN0cnVjdG9yKGNlbnRlcl94LCBjZW50ZXJfeSwgcmFkaXVzKXtcbiAgICBzdXBlcihHZW9tZXRyeS5DSVJDTEUpO1xuICAgIHRoaXMuY2VudGVyID0ge307XG4gICAgdGhpcy5jZW50ZXIueCA9IGNlbnRlcl94O1xuICAgIHRoaXMuY2VudGVyLnkgPSBjZW50ZXJfeTtcbiAgICB0aGlzLnIgPSByYWRpdXM7XG4gIH1cbiAgcmVuZGVyKGN0eCl7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5hcmModGhpcy5jZW50ZXIueCx0aGlzLmNlbnRlci55LCB0aGlzLnIsIDAsIDIqTWF0aC5QSSk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGU7XG4iLCJ2YXIgR2VvbWV0cnkgPSByZXF1aXJlKCcuL0dlb21ldHJ5LmpzJyk7XG52YXIgSW1wbHVzZVJlc29sdmVyID0gcmVxdWlyZSgnLi9JbXBsdXNlUmVzb2x2ZXIuanMnKTtcblxuY29uc3QgQ09MTElTSU9OX0dST1VQUyA9IFsweDAsXG4gIDB4MSwgMHgyLCAweDQsIDB4OF1cbi8vMHgxMCwgMHgyMCwgMHg0MCwgMHg4MCxcbi8vMHgxMDAsIDB4MjAwLCAweDQwMCwgMHg4MDAsXG4vLzB4MTAwMCwgMHgyMDAwLCAweDQwMDAsIDB4ODAwMF07XG5jb25zdCBOT19DT0xMSVNJT04gPSBDT0xMSVNJT05fR1JPVVBTWzBdO1xuY29uc3QgQ19HUk9VUDEgPSBDT0xMSVNJT05fR1JPVVBTWzFdO1xuY29uc3QgQ19HUk9VUDIgPSBDT0xMSVNJT05fR1JPVVBTWzJdO1xuY29uc3QgQ19HUk9VUDMgPSBDT0xMSVNJT05fR1JPVVBTWzNdO1xuY29uc3QgQ19HUk9VUDQgPSBDT0xMSVNJT05fR1JPVVBTWzRdO1xuLy9jb25zdCBDX0dST1VQNSA9IENPTExJU0lPTl9HUk9VUFNbNV07XG5cbmNsYXNzIENvbGxpc2lvbkRldGVjdG9ye1xuXG4gIC8vY29uc3RydWN0b3IoKXtcbiAgICAvL2NvbnNvbGUubG9nKCdbQ29sbGlzaW9uRGV0ZWN0b3JdIGNvbnN0cnVjdGluZycpO1xuICAvL31cblxuICBjYW5fY29sbGlkZShvYmoxLCBvYmoyKXtcbiAgICBsZXQgZ3JvdXBfY2FuX2NvbGxpZGUgPSAob2JqMS5jb2xsaXNpb25fZ3JvdXAgJiBvYmoyLmNvbGxpc2lvbl9ncm91cCkgPiAwO1xuICAgIGlmKCFncm91cF9jYW5fY29sbGlkZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IGNvbGxpc2lvbl90eXBlID0gb2JqMS5jb2xsaXNpb25fYm9keS5zaGFwZSArICc6JyArIG9iajIuY29sbGlzaW9uX2JvZHkuc2hhcGU7XG4gICAgLy8gRklYTUU6IG9wdGltaXplIHdpdGggYml0IG9wZXJhdGlvbiwgYml0IGNvbXBhcmlzb24gc2hvdWxkIGJlIG11Y2ggZmFzdGVyIHRoYW4gc3RyaW5nXG4gICAgbGV0IG9iajFfY19ib2R5ID0gb2JqMS5jb2xsaXNpb25fYm9keTtcbiAgICBsZXQgb2JqMl9jX2JvZHkgPSBvYmoyLmNvbGxpc2lvbl9ib2R5O1xuICAgIHN3aXRjaChjb2xsaXNpb25fdHlwZSl7XG4gICAgICBjYXNlIEdlb21ldHJ5LkFBQkIgKyAnOicgKyBHZW9tZXRyeS5BQUJCOlxuICAgICAgICByZXR1cm4gdGhpcy5hYWJiXzJfYWFiYl9jYW5fY29sbGlkZShvYmoxX2NfYm9keSwgb2JqMl9jX2JvZHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuQ0lSQ0xFICsgJzonICsgR2VvbWV0cnkuQ0lSQ0xFOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9jaXJjbGVfY2FuX2NvbGxpZGUob2JqMV9jX2JvZHksIG9iajJfY19ib2R5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkFBQkIgKyAnOicgKyBHZW9tZXRyeS5DSVJDTEU6XG4gICAgICAgIHJldHVybiB0aGlzLmNpcmNsZV8yX2FhYmJfY2FuX2NvbGxpZGUob2JqMl9jX2JvZHksIG9qYjEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuQ0lSQ0xFICsgJzonICsgR2VvbWV0cnkuQUFCQjpcbiAgICAgICAgcmV0dXJuIHRoaXMuY2lyY2xlXzJfYWFiYl9jYW5fY29sbGlkZShvYmoxX2NfYm9keSwgb2JqMl9jX2JvZHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuQ0lSQ0xFICsgJzonICsgR2VvbWV0cnkuTElORTpcbiAgICAgICAgcmV0dXJuIHRoaXMuY2lyY2xlXzJfbGluZV9jYW5fY29sbGlkZShvYmoxX2NfYm9keSwgb2JqMl9jX2JvZHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuTElORSArICc6JyArIEdlb21ldHJ5LkNJUkNMRTpcbiAgICAgICAgcmV0dXJuIHRoaXMuY2lyY2xlXzJfbGluZV9jYW5fY29sbGlkZShvYmoyX2NfYm9keSwgb2JqMV9jX2JvZHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuQUFCQiArICc6JyArIEdlb21ldHJ5LkxJTkU6XG4gICAgICAgIHJldHVybiB0aGlzLmFhYmJfMl9saW5lX2Nhbl9jb2xsaWRlKG9iajFfY19ib2R5LCBvYmoyX2NfYm9keSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5MSU5FKyAnOicgKyBHZW9tZXRyeS5BQUJCOlxuICAgICAgICByZXR1cm4gdGhpcy5hYWJiXzJfbGluZV9jYW5fY29sbGlkZShvYmoyX2NfYm9keSwgb2JqMV9jX2JvZHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBfZGlzdGFuY2UocG9pbnQxLCBwb2ludDIpe1xuICAgIHJldHVybiBNYXRoLnNxcnQoXG4gICAgICBNYXRoLnBvdyhwb2ludDEueC1wb2ludDIueCwgMilcbiAgICAgICsgTWF0aC5wb3cocG9pbnQxLnkgLSBwb2ludDIueSwgMilcbiAgICApO1xuICB9XG5cbiAgX2Rpc3RhbmNlX3NxdWFyZShwb2ludDEsIHBvaW50Mil7XG4gICAgcmV0dXJuIE1hdGgucG93KHBvaW50MS54LXBvaW50Mi54LCAyKVxuICAgICAgKyBNYXRoLnBvdyhwb2ludDEueSAtIHBvaW50Mi55LCAyKTtcbiAgfVxuXG4gIGFhYmJfMl9hYWJiX2Nhbl9jb2xsaWRlKGFiMSwgYWIyKXtcbiAgICBsZXQgbWluMSA9IGFiMS5taW47XG4gICAgbGV0IG1heDEgPSBhYjEubWF4O1xuICAgIGxldCBtaW4yID0gYWIyLm1pbjtcbiAgICBsZXQgbWF4MiA9IGFiMi5tYXg7XG4gICAgcmV0dXJuIChtaW4xLnggPD0gbWF4Mi54ICYmIG1heDEueCA+PSBtaW4yLngpXG4gICAgICAmJiAobWluMS55IDw9IG1heDIueSAmJiBtYXgxLnkgPj0gbWluMi55KTtcbiAgfVxuXG4gIGNpcmNsZV8yX2NpcmNsZV9jYW5fY29sbGlkZShjMSwgYzIpe1xuICAgIGxldCBjZW50ZXIxID0gYzEuY2VudGVyO1xuICAgIGxldCBjZW50ZXIyID0gYzIuY2VudGVyO1xuICAgIHJldHVybiBfZGlzdGFuY2Vfc3F1YXJlKGNlbnRlcjEsIGNlbnRlcjIpIDw9IE1hdGgucG93KGMxLnIgKyBjMi5yLCAyKTtcbiAgfVxuXG4gIC8vIHJldHVybiB4ICB3aGVuIG1pbiA8IHggPCBtYXgsIG90aGVyIHdpc2UgcmV0dXJuIHdoaWNoIGV2ZXIgaXMgY2xvc2VyIHRvIHggZnJvbSAobWluLCBtYXgpXG4gIF9jbGFtcCh4LCBtaW4sIG1heCl7XG4gICAgcmV0dXJuIHggPCBtaW4gPyBtaW4gOiB4ID4gbWF4ID8gbWF4IDogeDtcbiAgfVxuXG4gIGNpcmNsZV8yX2FhYmJfY2FuX2NvbGxpZGUoYywgYWIpe1xuICAgIGxldCBjZW50ZXIgPSBjLmNlbnRlcjtcbiAgICBsZXQgY2xhbXBfeCA9IHRoaXMuX2NsYW1wKGNlbnRlci54LCBhYi5taW4ueCwgYWIubWF4LngpO1xuICAgIGxldCBjbGFtcF95ID0gdGhpcy5fY2xhbXAoY2VudGVyLnksIGFiLm1pbi55LCBhYi5tYXgueSk7XG4gICAgbGV0IHJlc3VsdCA9IDA7XG4gICAgaWYoTWF0aC5hYnMoY2VudGVyLnggLSBjbGFtcF94KSA8IGMuclxuICAgICAgJiYgTWF0aC5hYnMoY2VudGVyLnkgLSBjbGFtcF95KSA8IGMucil7XG4gICAgICBjb25zb2xlLmxvZygnY29sbGlkZSEnKTtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgJ2NvbnRhY3RfdHlwZSc6IDAsXG4gICAgICAgICdjb250YWN0Jzoge1xuICAgICAgICAgICdwb2ludCc6IHtcbiAgICAgICAgICAgICd4JzogY2xhbXBfeCxcbiAgICAgICAgICAgICd5JzogY2xhbXBfeSB9LFxuICAgICAgICAgICdhbGlnbmVkX2F4aXMnOiAnJ319O1xuICAgICAgLy8gY29sbGlzaW9uIGhhcHBlbmVkXG4gICAgICBpZigoY2xhbXBfeCA9PSBhYi5taW4ueCB8fCBjbGFtcF94ID09IGFiLm1heC54KVxuICAgICAgICAmJihjbGFtcF95ID09IGFiLm1pbi55IHx8IGNsYW1wX3kgPT0gYWIubWF4LnkpKXtcbiAgICAgICAgLy8gcG9pbnQgY29udGFjdCB3aXRoIGNvcm5lclxuICAgICAgICByZXN1bHRbJ2NvbnRhY3RfdHlwZSddID0gSW1wbHVzZVJlc29sdmVyLkNPTlRBQ1RfQ0lSQ0xFXzJfUE9JTlQ7XG4gICAgICB9ZWxzZSBpZihjbGFtcF94ID09IGFiLm1pbi54IHx8IGNsYW1wX3ggPT0gYWIubWF4Lngpe1xuICAgICAgICAvLyBjb2xsaXNpb24gb24geSBheGlzXG4gICAgICAgIHJlc3VsdFsnY29udGFjdF90eXBlJ10gPSBJbXBsdXNlUmVzb2x2ZXIuQ09OVEFDVF9DSVJDTEVfMl9BQl9MSU5FO1xuICAgICAgICByZXN1bHRbJ2NvbnRhY3QnXVsnYWxpZ25lZF9heGlzJ10gPSAneSc7XG4gICAgICB9ZWxzZSBpZihjbGFtcF95ID09IGFiLm1pbi55IHx8IGNsYW1wX3kgPT0gYWIubWF4Lnkpe1xuICAgICAgICAvLyBjb2xsaXNpb24gb24geCBheGlzXG4gICAgICAgIHJlc3VsdFsnY29udGFjdF90eXBlJ10gPSBJbXBsdXNlUmVzb2x2ZXIuQ09OVEFDVF9DSVJDTEVfMl9BQl9MSU5FO1xuICAgICAgICByZXN1bHRbJ2NvbnRhY3QnXVsnYWxpZ25lZF9heGlzJ10gPSAneCc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBjaXJjbGVfMl9saW5lX2Nhbl9jb2xsaWRlKGMsIGwpe1xuICAgIGxldCBjZW50ZXIgPSBjLmNlbnRlcjtcbiAgICBzd2l0Y2gobC5wYXJhbGxlbF90byl7XG4gICAgICBjYXNlICd4JzpcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKGNlbnRlci55IC0gbC5wb3MpIDwgYy5yO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3knOlxuICAgICAgICByZXR1cm4gTWF0aC5hYnMoY2VudGVyLnggLSBsLnBvcykgPCBjLnI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGFhYmJfMl9saW5lX2Nhbl9jb2xsaWRlKGFiLCBsKXtcbiAgICByZXR1cm4gZmFsc2U7XG4gICAgbGV0IG1pbiA9IGFiLm1pbjtcbiAgICBsZXQgbWF4ID0gYWIubWF4O1xuICAgIGxldCBjZW50ZXIgPSB7fTtcbiAgICBjZW50ZXIueCA9IChhYi5taW4ueCArIGFiLm1heC54KSAvIDI7XG4gICAgY2VudGVyLnkgPSAoYWIubWluLnkgKyBhYi5tYXgueSkgLyAyO1xuICAgIHN3aXRjaChsLnBhcmFsbGVsX3RvKXtcbiAgICAgIGNhc2UgJ3gnOlxuICAgICAgICByZXR1cm4gY2VudGVyLnkgPD0gbWF4LnkgJiYgY2VudGVyLnkgPj0gbWluLnk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAneSc6XG4gICAgICAgIHJldHVybiBjZW50ZXIueCA8PSBtYXgueCAmJiBjZW50ZXIueCA+PSBtaW4ueDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uRGV0ZWN0b3I7XG5tb2R1bGUuZXhwb3J0cy5OT19DT0xMSVNJT04gPSBOT19DT0xMSVNJT047XG5tb2R1bGUuZXhwb3J0cy5DX0dST1VQMSA9IENfR1JPVVAxO1xubW9kdWxlLmV4cG9ydHMuQ19HUk9VUDIgPSBDX0dST1VQMjtcbm1vZHVsZS5leHBvcnRzLkNfR1JPVVAzID0gQ19HUk9VUDM7XG5tb2R1bGUuZXhwb3J0cy5DX0dST1VQNCA9IENfR1JPVVA0O1xuIiwidmFyIEdlb21ldHJ5ID0gcmVxdWlyZSgnLi9HZW9tZXRyeS5qcycpO1xuXG5jbGFzcyBHYW1lT2JqZWN0e1xuICBjb25zdHJ1Y3Rvcihjb2xsaXNpb25fZ3JvdXAsIGNvbGxpc2lvbl9ib2R5LCBkaXNwbGF5X2JvZHksIG1vdmVhYmxlKXtcbiAgICBjb25zb2xlLmxvZygnW0dhbWVPYmplY3RdIGNvbnN0cnVjdGluZycpO1xuICAgIHRoaXMuY29sbGlzaW9uX2dyb3VwID0gY29sbGlzaW9uX2dyb3VwO1xuICAgIHRoaXMuY29sbGlzaW9uX2JvZHkgPSBjb2xsaXNpb25fYm9keTtcbiAgICB0aGlzLmRpc3BsYXlfYm9keSA9IGRpc3BsYXlfYm9keTtcbiAgICB0aGlzLm1vdmVhYmxlID0gbW92ZWFibGU7XG5cbiAgICBpZihjb2xsaXNpb25fYm9keS5zaGFwZSA9PSBHZW9tZXRyeS5BQUJCKXtcbiAgICAgIHRoaXMueCA9IGNvbGxpc2lvbl9ib2R5Lm1pbi54O1xuICAgICAgdGhpcy55ID0gY29sbGlzaW9uX2JvZHkubWluLnk7XG4gICAgfWVsc2UgaWYoY29sbGlzaW9uX2JvZHkuc2hhcGUgPT0gR2VvbWV0cnkuQ0lSQ0xFKXtcbiAgICAgIHRoaXMueCA9IGNvbGxpc2lvbl9ib2R5LmNlbnRlci54O1xuICAgICAgdGhpcy55ID0gY29sbGlzaW9uX2JvZHkuY2VudGVyLnk7XG4gICAgfVxuICB9XG5cbiAgZ2V0X3Bvc2l0aW9uKCl7XG4gICAgcmV0dXJuIHsneCc6dGhpcy54LCAneSc6dGhpcy55fTtcbiAgfVxuXG4gIHNldF9wb3NpdGlvbih4LCB5KXtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgaWYodGhpcy5jb2xsaXNpb25fYm9keS5zaGFwZSA9PSBHZW9tZXRyeS5BQUJCKXtcbiAgICAgIHRoaXMuY29sbGlzaW9uX2JvZHkubWluX3ggPSB4O1xuICAgICAgdGhpcy5jb2xsaXNpb25fYm9keS5taW5feSA9IHk7XG4gICAgICB0aGlzLmNvbGxpc2lvbl9ib2R5Lm1heF94ID0geCArIHRoaXMuY29sbGlzaW9uX2JvZHkud2lkdGg7XG4gICAgICB0aGlzLmNvbGxpc2lvbl9ib2R5Lm1heF95ID0geSArIHRoaXMuY29sbGlzaW9uX2JvZHkuaGVpZ2h0O1xuICAgIH1lbHNlIGlmKHRoaXMuY29sbGlzaW9uX2JvZHkuc2hhcGUgPT0gR2VvbWV0cnkuTElORSl7XG4gICAgICBpZih0aGlzLmNvbGxpc2lvbl9ib2R5LnBhcmFsbGVsX3RvID09ICd4Jyl7XG4gICAgICAgIHRoaXMuY29sbGlzaW9uX2JvZHkucG9zID0geTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmNvbGxpc2lvbl9ib2R5LnBvcyA9IHg7XG4gICAgICB9XG4gICAgfWVsc2UgaWYodGhpcy5jb2xsaXNpb25fYm9keS5zaGFwZSA9PSBHZW9tZXRyeS5DSVJDTEUpe1xuICAgICAgdGhpcy5jb2xsaXNpb25fYm9keS5jZW50ZXIueCA9IHRoaXMueDtcbiAgICAgIHRoaXMuY29sbGlzaW9uX2JvZHkuY2VudGVyLnkgPSB0aGlzLnk7XG4gICAgfVxuICB9XG5cbiAgc2V0X3ZlbG9jaXR5KHZfeCwgdl95KXtcbiAgICB0aGlzLnZfeCA9IHZfeDtcbiAgICB0aGlzLnZfeSA9IHZfeTtcbiAgfVxuXG4gIHNldF9hY2NlbGVyYXRpb24oYV94LCBhX3kpe1xuICAgIHRoaXMuYV94ID0gYV94O1xuICAgIHRoaXMuYV95ID0gYV95O1xuICB9XG4gIC8vIGFhYmIgc2hvdWxkIGhhdmU6XG4gIC8vIG1pbjoge3g6IDw+LCB5Ojw+fVxuICAvLyBtYXg6IHt4OiA8PiwgeTo8Pn1cblxuICAvLyBjaXJjbGUgc2hvdWxkIGhhdmU6XG4gIC8vIGNlbnRlcjoge3g6IDw+LCB5Ojw+fVxuICAvLyByOiA8PlxuXG4gIC8vIGxpbmVzIGFyZSBpbmZpbml0ZSBsaW5lLCBhbmQgc2hvdWxkIGhhdmU6XG4gIC8vIHBhcmFsbGVsX3RvOiBbJ3gnfCd5J11cbiAgLy8gcG9zOiA8PlxuXG5cbn1cbm1vZHVsZS5leHBvcnRzID0gR2FtZU9iamVjdDtcbiIsImNvbnN0IExJTkUgPSAxO1xuY29uc3QgQUFCQiA9IDI7XG5jb25zdCBDSVJDTEUgPSAzO1xuXG5jbGFzcyBHZW9tZXRyeXtcbiAgY29uc3RydWN0b3Ioc2hhcGUpe1xuICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdlb21ldHJ5O1xubW9kdWxlLmV4cG9ydHMuTElORSA9IExJTkU7XG5tb2R1bGUuZXhwb3J0cy5BQUJCID0gQUFCQjtcbm1vZHVsZS5leHBvcnRzLkNJUkNMRSA9IENJUkNMRTtcbiIsInZhciBHZW9tZXRyeSA9IHJlcXVpcmUoJy4vR2VvbWV0cnkuanMnKTtcbnZhciBWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3Rvci5qcycpO1xuXG5jb25zdCBDT05UQUNUX0NJUkNMRV8yX1BPSU5UID0gMTtcbmNvbnN0IENPTlRBQ1RfQ0lSQ0xFXzJfQUJfTElORSA9IDI7XG5cbmNsYXNzIEltcGx1c2VSZXNvbHZlcntcbiAgcmVzb2x2ZShvYmoxLCBvYmoyLCBjb250YWN0KXtcbiAgICBsZXQgY29sbGlzaW9uX3R5cGUgPSBvYmoxLmNvbGxpc2lvbl9ib2R5LnNoYXBlICsgJzonICsgb2JqMi5jb2xsaXNpb25fYm9keS5zaGFwZTtcbiAgICBzd2l0Y2goY29sbGlzaW9uX3R5cGUpe1xuICAgICAgY2FzZSBHZW9tZXRyeS5BQUJCICsgJzonICsgR2VvbWV0cnkuQUFCQjpcbiAgICAgICAgY29uc29sZS5sb2coJ2FhYmIgMiBhYWJiIGltcGx1c2UgcmVzb2x1dGlvbiBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5DSVJDTEUgKyAnOicgKyBHZW9tZXRyeS5DSVJDTEU6XG4gICAgICAgIGNvbnNvbGUubG9nKCdjaXJjbGUgMiBjaXJjbGUgaW1wbHVzZSByZXNvbHV0aW9uIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkFBQkIgKyAnOicgKyBHZW9tZXRyeS5DSVJDTEU6XG4gICAgICAgIHJldHVybiB0aGlzLmNpcmNsZV8yX2FhYmJfcmVzb2x1dGlvbihvYmoyLCBvYmoxLCBjb250YWN0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkNJUkNMRSArICc6JyArIEdlb21ldHJ5LkFBQkI6XG4gICAgICAgIHJldHVybiB0aGlzLmNpcmNsZV8yX2FhYmJfcmVzb2x1dGlvbihvYmoxLCBvYmoyLCBjb250YWN0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkNJUkNMRSArICc6JyArIEdlb21ldHJ5LkxJTkU6XG4gICAgICAgIHJldHVybiB0aGlzLmNpcmNsZV8yX2xpbmVfcmVzb2x1dGlvbihvYmoxLCBvYmoyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkxJTkUgKyAnOicgKyBHZW9tZXRyeS5DSVJDTEU6XG4gICAgICAgIHJldHVybiB0aGlzLmNpcmNsZV8yX2xpbmVfcmVzb2x1dGlvbihvYmoyLCBvYmoxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkFBQkIgKyAnOicgKyBHZW9tZXRyeS5MSU5FOlxuICAgICAgICBjb25zb2xlLmxvZygnYWFiYiAyIGxpbmUgaW1wbHVzZSByZXNvbHV0aW9uIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkxJTkUrICc6JyArIEdlb21ldHJ5LkFBQkI6XG4gICAgICAgIGNvbnNvbGUubG9nKCdsaW5lIDIgYWFiYiBpbXBsdXNlIHJlc29sdXRpb24gbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBjaXJjbGVfMl9hYWJiX3Jlc29sdXRpb24oYywgYWIsIGNvbnRhY3Qpe1xuICAgIGNvbnNvbGUubG9nKCdyZXNvbHZpbmchJyk7XG4gICAgaWYoY29udGFjdFsnY29udGFjdF90eXBlJ10gPT0gQ09OVEFDVF9DSVJDTEVfMl9QT0lOVCl7XG4gICAgICB0aGlzLl9jaXJjbGVfMl9wb2ludF9yZXNvbHV0aW9uKGMsIGNvbnRhY3RbJ2NvbnRhY3QnXVsncG9pbnQnXSk7XG4gICAgfWVsc2UgaWYoY29udGFjdFsnY29udGFjdF90eXBlJ10gPT0gQ09OVEFDVF9DSVJDTEVfMl9BQl9MSU5FKXtcbiAgICAgIHRoaXMuX2NpcmNsZV8yX2FiX2xpbmVfcmVzb2x1dGlvbihjLCBjb250YWN0Wydjb250YWN0J11bJ2FsaWduZWRfYXhpcyddKTtcbiAgICB9XG4gIH1cblxuICBfY2lyY2xlXzJfYWJfbGluZV9yZXNvbHV0aW9uKGMsIGFsaWduZWRfYXhpcyl7XG4gICAgc3dpdGNoKGFsaWduZWRfYXhpcyl7XG4gICAgICBjYXNlICd4JzpcbiAgICAgICAgYy52X3kgKj0gLTE7XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICd5JzpcbiAgICAgICAgYy52X3ggKj0gLTE7XG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgX2NpcmNsZV8yX3BvaW50X3Jlc29sdXRpb24oYywgY29udGFjdF9wb2ludCl7XG4gICAgbGV0IGNpcmNsZV9jZW50ZXIgPSBjLmNvbGxpc2lvbl9ib2R5LmNlbnRlcjtcbiAgICBsZXQgY29udGFjdF92ZWN0b3IgPSBuZXcgVmVjdG9yKFxuICAgICAgY29udGFjdF9wb2ludC54IC0gY2lyY2xlX2NlbnRlci54LFxuICAgICAgY29udGFjdF9wb2ludC55IC0gY2lyY2xlX2NlbnRlci55KTtcbiAgICBsZXQgcGVycF9jb250YWN0X3ZlY3RvciA9IGNvbnRhY3RfdmVjdG9yLnJvdGF0ZV9jbG9ja3dpc2VfOTAoKTtcbiAgICBsZXQgdmVsb2NpdHlfdmVjdG9yID0gbmV3IFZlY3RvcihjLnZfeCwgYy52X3kpO1xuXG4gICAgLy8gbGV0IHRoZXRhIGJlIHRoZSBhbmdsZSBiZXR3ZWVuIHZlbG9jaXR5X3ZlY3RvciBhbmQgcGVycF9jb250YWN0X3ZlY3RvclxuICAgIC8vIGNvcyh0aGV0YSkgPSBWMSAuIFYyIC8gKHxWMXwgKiB8VjJ8KVxuICAgIGxldCBjb3NfdGhldGEgPSAocGVycF9jb250YWN0X3ZlY3Rvci5kb3RfcHJvZHVjdCh2ZWxvY2l0eV92ZWN0b3IpKVxuICAgICAgLyhwZXJwX2NvbnRhY3RfdmVjdG9yLm1hZ25pdHVkZSgpICogdmVsb2NpdHlfdmVjdG9yLm1hZ25pdHVkZSgpKTtcblxuICAgIGxldCBzaW5fdGhldGEgPSBNYXRoLnNxcnQoMSAtIGNvc190aGV0YSk7XG5cbiAgICAvLyBVc2UgdmVjdG9yIHJvdGF0aW9uIG1hdHJpeDpcbiAgICAvL3xjb3MoMip0aGV0YSksIC1zaW4oMip0aGV0YSl8XG4gICAgLy98c2luKDIqdGhldGEpLCAgY29zKDIqdGhldGEpfFxuICAgIC8vIHRvIG11bHRpcGx5IHZlbG9jaXR5X3ZlY3RvciB0byBnZXQgdGhlIHZlbG9jaXR5IGFmdGVyIGNvbnRhY3RcbiAgICAvLyBub3RlOlxuICAgIC8vIGNvcygyKnRoZXRhKSA9IGNvc190aGV0YSpjb3NfdGhldGEgLSBzaW5fdGhldGEqc2luX3RoZXRhXG4gICAgLy8gc2luKDIqdGhldGEpID0gMipzaW4odGhldGEpKmNvcyh0aGV0YSlcbiAgICBsZXQgbWlkZGxlX3Jlc3VsdDEgPSAoY29zX3RoZXRhKmNvc190aGV0YSAtIHNpbl90aGV0YSpzaW5fdGhldGEpO1xuICAgIGxldCBtaWRkbGVfcmVzdWx0MiA9IDIgKiBjb3NfdGhldGEgKiBzaW5fdGhldGE7XG4gICAgbGV0IHZlbG9jaXR5X2FmdGVyX2NvbnRhY3QgPSBuZXcgVmVjdG9yKFxuICAgICAgbWlkZGxlX3Jlc3VsdDEgKiB2ZWxvY2l0eV92ZWN0b3IueCAtIG1pZGRsZV9yZXN1bHQyICogdmVsb2NpdHlfdmVjdG9yLnksXG4gICAgICBtaWRkbGVfcmVzdWx0MiAqIHZlbG9jaXR5X3ZlY3Rvci54ICsgbWlkZGxlX3Jlc3VsdDEgKiB2ZWxvY2l0eV92ZWN0b3IueVxuICAgIClcblxuICAgIGMudl94ID0gdmVsb2NpdHlfYWZ0ZXJfY29udGFjdC54O1xuICAgIGMudl95ID0gdmVsb2NpdHlfYWZ0ZXJfY29udGFjdC55O1xuICB9XG5cbiAgY2lyY2xlXzJfbGluZV9yZXNvbHV0aW9uKGMsIGwpe1xuICAgIHRoaXMuX2NpcmNsZV8yX2FiX2xpbmVfcmVzb2x1dGlvbihjLCBsLmNvbGxpc2lvbl9ib2R5LnBhcmFsbGVsX3RvKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBJbXBsdXNlUmVzb2x2ZXI7XG5tb2R1bGUuZXhwb3J0cy5DT05UQUNUX0NJUkNMRV8yX1BPSU5UICA9IENPTlRBQ1RfQ0lSQ0xFXzJfUE9JTlQ7XG5tb2R1bGUuZXhwb3J0cy5DT05UQUNUX0NJUkNMRV8yX0FCX0xJTkUgPSBDT05UQUNUX0NJUkNMRV8yX0FCX0xJTkU7XG4iLCJ2YXIgR2VvbWV0cnkgPSByZXF1aXJlKCcuL0dlb21ldHJ5LmpzJyk7XG52YXIgQ29sbGlzaW9uRGV0ZWN0b3IgPSByZXF1aXJlKCcuL0NvbGxpc2lvbkRldGVjdG9yLmpzJyk7XG5cbmNsYXNzIExpbmUgZXh0ZW5kcyBHZW9tZXRyeXtcbiAgY29uc3RydWN0b3IocGFyYWxsZWxfdG8sIHBvcyl7XG4gICAgc3VwZXIoR2VvbWV0cnkuTElORSk7XG4gICAgdGhpcy5ib2R5X3R5cGUgPSBDb2xsaXNpb25EZXRlY3Rvci5DX0JPRFlfTElORTtcbiAgICB0aGlzLnBhcmFsbGVsX3RvID0gcGFyYWxsZWxfdG87XG4gICAgdGhpcy5wb3MgPSBwb3M7XG4gIH1cbiAgcmVuZGVyKGN0eCl7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHN3aXRjaCh0aGlzLnBhcmFsbGVsX3RvKXtcbiAgICAgIGNhc2UgJ3gnOlxuICAgICAgICBjdHgubW92ZVRvKDAsIHRoaXMucG9zKTtcbiAgICAgICAgY3R4LmxpbmVUbygxMDAwMCwgdGhpcy5wb3MpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3knOlxuICAgICAgICBjdHgubW92ZVRvKHRoaXMucG9zLCAwKTtcbiAgICAgICAgY3R4LmxpbmVUbyh0aGlzLnBvcywgMTAwMDApO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBMaW5lO1xuIiwiY2xhc3MgVmVjdG9ye1xuICBjb25zdHJ1Y3Rvcih4LCB5KXtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gIH1cblxuICBjbG9uZSgpe1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCwgdGhpcy55KTtcbiAgfVxuXG4gIHJvdGF0ZV9jbG9ja3dpc2VfOTAoKXtcbiAgICByZXR1cm4gbmV3IFZlY3RvcigtIHRoaXMueSwgdGhpcy54KTtcbiAgfVxuXG4gIG1hZ25pdHVkZSgpe1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54KnRoaXMueCArIHRoaXMueSp0aGlzLnkpO1xuICB9XG5cbiAgZG90X3Byb2R1Y3Qodil7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZlY3RvcjtcbiIsInZhciBDb2xsaXNpb25EZXRlY3RvciA9IHJlcXVpcmUoJy4vQ29sbGlzaW9uRGV0ZWN0b3IuanMnKTtcbnZhciBDaXJjbGUgPSByZXF1aXJlKCcuL0NpcmNsZS5qcycpO1xudmFyIEFBQkIgPSByZXF1aXJlKCcuL0FBQkIuanMnKTtcbnZhciBMaW5lID0gcmVxdWlyZSgnLi9MaW5lLmpzJyk7XG52YXIgR2FtZU9iamVjdCA9IHJlcXVpcmUoJy4vR2FtZU9iamVjdC5qcycpO1xudmFyIEltcGx1c2VSZXNvbHZlciA9IHJlcXVpcmUoJy4vSW1wbHVzZVJlc29sdmVyLmpzJyk7XG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVfZmllbGRcIik7XG52YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGtleURvd25IYW5kbGVyLCBmYWxzZSk7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwga2V5VXBIYW5kbGVyLCBmYWxzZSk7XG4vL2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBrZXlQcmVzc0hhbmRsZXIsIGZhbHNlKTtcblxuZ2FtZV9sZW5ndGggPSAxMDAwO1xuY3VycmVudF9nYW1lX3RpY2sgPSAwO1xuc3RhdGVfaGlzdG9yeSA9IHt9O1xuZW5kaW5nX3RpY2sgPSAwO1xuXG5nYW1lX3N0YXJ0ZWQgPSBmYWxzZTtcbnBhdXNlZCA9IGZhbHNlO1xucGF1c2Vfc3RhcnRfYXQgPSAwO1xudG90YWxfcGF1c2VkID0gMDtcbmdhbWVfZW5kZWQgPSBmYWxzZTtcbmdhbWVfZW5kX3dpdGhfc3RhdHVzID0gJyc7XG5cbkdBTUVfV09OX1NUQVRVUyA9ICd3aW4nO1xuR0FNRV9MT1NUX1NUQVRVUyA9ICdsb3N0JztcbklOX0dBTUVfU1RBVFVTID0gJ2luX2dhbWUnO1xuXG52YXIgZnJpY3Rpb24gPSAwLjAwMTtcbnZhciBhY2NlbGVyYXRpb24gPSAwLjAzO1xudmFyIGZ1ZWxfZWZmaWNpZW5jeSA9IDU7XG5cblxudmFyIHN0YXRlXzIgPSB7XG4gICdwbGF5ZXInOiBwbGF5ZXIsXG4gICd0YXJnZXQnOiB0YXJnZXQsXG4gICdwbGF5ZXJfZnV0dXJlJzogcGxheWVyX2Z1dHVyZVxufVxuXG52YXIgc3RhdGUgPSB7XG4gICdwb3NfeCc6IDEwLFxuICAncG9zX3knOiAyMDAsXG4gICd0X3Bvc194JzogNDAwLFxuICAndF9wb3NfeSc6IDgwLFxuICAnZl9wb3NfeCc6IDAsXG4gICdmX3Bvc195JzogMCxcbiAgJ3JhZGl1cyc6IDUsXG4gICd3aW5fZGlzdCc6IDE1LFxuICAndl94JzogMSxcbiAgJ3ZfeSc6IDEsXG4gICdhX3gnOiAwLFxuICAnYV95JzogMCxcbiAgJ2ZpZWxkX3dpZHRoJzogY2FudmFzLndpZHRoLFxuICAnZmllbGRfaGVpZ2h0JzogY2FudmFzLmhlaWdodCxcbiAgJ2ZpZWxkX3RvcF9sZWZ0X3gnOiAwLFxuICAnZmllbGRfdG9wX2xlZnRfeSc6IDUwLFxufVxuXG52YXIgdGltZV9iYXJfd2lkdGggPSAxMDA7XG52YXIgdGltZV9iYXIgPSB7XG4gICd3aWR0aCc6IHRpbWVfYmFyX3dpZHRoLFxuICAnaGVpZ2h0JzogMzAsXG4gICdwb3NfeCc6IGNhbnZhcy53aWR0aCAtIDEwIC0gdGltZV9iYXJfd2lkdGgsXG4gICdwb3NfeSc6IDEwLFxuICAnZmlsbCc6IHRpbWVfYmFyX3dpZHRoXG59XG5cbnZhciBmdWVsX2Jhcl93aWR0aCA9IDEwMDtcbnZhciBmdWVsX2JhciA9IHtcbiAgJ3dpZHRoJzogZnVlbF9iYXJfd2lkdGgsXG4gICdoZWlnaHQnOiAzMCxcbiAgJ3Bvc194JzogY2FudmFzLndpZHRoIC0gMTAgLSB0aW1lX2Jhcl93aWR0aCAtIGZ1ZWxfYmFyX3dpZHRoIC0gMTAsXG4gICdwb3NfeSc6IDEwLFxuICAnZmlsbCc6IGZ1ZWxfYmFyX3dpZHRoXG59XG5cbmZ1bmN0aW9uIHVwZGF0ZV90aW1lX2Jhcigpe1xuICB0aW1lX2JhclsnZmlsbCddID0gdGltZV9iYXJfd2lkdGggLSAoY3VycmVudF9nYW1lX3RpY2sgKiB0aW1lX2Jhcl93aWR0aCAvIGdhbWVfbGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyX2Z1ZWxfYmFyKGN0eCwgZnVlbF9iYXIpe1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gIGN0eC5yZWN0KGZ1ZWxfYmFyWydwb3NfeCddLCBmdWVsX2JhclsncG9zX3knXSwgZnVlbF9iYXJbJ3dpZHRoJ10sIGZ1ZWxfYmFyWydoZWlnaHQnXSk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmZpbGxTdHlsZSA9ICdyZWQnO1xuICBjdHgucmVjdChmdWVsX2JhclsncG9zX3gnXSArIDEsIGZ1ZWxfYmFyWydwb3NfeSddICsgMSwgZnVlbF9iYXJbJ2ZpbGwnXSAtIDIsIGZ1ZWxfYmFyWydoZWlnaHQnXSAtIDIpO1xuICBjdHguZmlsbCgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcl90aW1lX2JhcihjdHgsIHRpbWVfYmFyKXtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICBjdHgucmVjdCh0aW1lX2JhclsncG9zX3gnXSwgdGltZV9iYXJbJ3Bvc195J10sIHRpbWVfYmFyWyd3aWR0aCddLCB0aW1lX2JhclsnaGVpZ2h0J10pO1xuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5maWxsU3R5bGUgPSAnZ3JleSc7XG4gIGN0eC5yZWN0KHRpbWVfYmFyWydwb3NfeCddICsgMSwgdGltZV9iYXJbJ3Bvc195J10gKyAxLCB0aW1lX2JhclsnZmlsbCddIC0gMiwgdGltZV9iYXJbJ2hlaWdodCddIC0gMik7XG4gIGN0eC5maWxsKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyX2dhbWVfZW5kKGN0eCwgc3RhdHVzKXtcbiAgdmFyIGVuZGluZ190ZXh0ID0gJ1lvdSBXaW4hJztcbiAgaWYoc3RhdHVzID09IEdBTUVfTE9TVF9TVEFUVVMpe1xuICAgIGVuZGluZ190ZXh0ID0gJ1lvdSBsb3N0ISc7XG4gIH1cbiAgY3R4LmZvbnQgPSBcIjMwcHggQXJpYWxcIjtcbiAgY3R4LmZpbGxUZXh0KGVuZGluZ190ZXh0LCBjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0IC8gMik7XG59XG5cblxuXG52YXIgbW92ZXMgPSB7XG4gIFwiQXJyb3dEb3duXCI6IGZhbHNlLFxuICBcIkFycm93VXBcIjogZmFsc2UsXG4gIFwiQXJyb3dMZWZ0XCI6IGZhbHNlLFxuICBcIkFycm93UmlnaHRcIjogZmFsc2Vcbn1cblxuZnVuY3Rpb24ga2V5RG93bkhhbmRsZXIoZSl7XG4gIGlmKGUuY29kZSBpbiBtb3Zlcyl7XG4gICAgbW92ZXNbZS5jb2RlXSA9IHRydWU7XG4gICAgaWYoZnVlbF9iYXJbJ2ZpbGwnXSA+PSBmdWVsX2VmZmljaWVuY3kpe1xuICAgICAgc3dpdGNoKGUuY29kZSl7XG4gICAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgICAgc3RhdGVbJ2FfeSddIC09IGFjY2VsZXJhdGlvbjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICAgIHN0YXRlWydhX3knXSArPSBhY2NlbGVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJBcnJvd0xlZnRcIjpcbiAgICAgICAgICBzdGF0ZVsnYV94J10gLT0gYWNjZWxlcmF0aW9uO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiQXJyb3dSaWdodFwiOlxuICAgICAgICAgIHN0YXRlWydhX3gnXSArPSBhY2NlbGVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBmdWVsX2JhclsnZmlsbCddIC09IGZ1ZWxfZWZmaWNpZW5jeTtcbiAgICB9ZWxzZXtcbiAgICAgIGZ1ZWxfYmFyWydmaWxsJ10gPSAwO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBrZXlVcEhhbmRsZXIoZSl7XG4gIGlmKGUuY29kZSBpbiBtb3Zlcyl7XG4gICAgbW92ZXNbZS5jb2RlXSA9IGZhbHNlO1xuICAgIHN3aXRjaChlLmNvZGUpe1xuICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgc3RhdGVbJ2FfeSddID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dEb3duXCI6XG4gICAgICAgIHN0YXRlWydhX3knXSA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93TGVmdFwiOlxuICAgICAgICBzdGF0ZVsnYV94J10gPSAwO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJBcnJvd1JpZ2h0XCI6XG4gICAgICAgIHN0YXRlWydhX3gnXSA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBzdGF0ZV9wcmVkaWN0aW9uKCk7XG4gIH1cbn1cblxudmFyIG1pbl92ZWxvY2l0eSA9IDAuMDAzO1xuZnVuY3Rpb24gY2hlY2tfc3RvcHBlZChzdGF0ZSl7XG4gIHJldHVybiBNYXRoLmFicyhzdGF0ZVsndl94J10pIDw9IG1pbl92ZWxvY2l0eSAmJiBNYXRoLmFicyhzdGF0ZVsndl95J10pIDw9IG1pbl92ZWxvY2l0eTtcbn1cblxuZnVuY3Rpb24gc3RhdGVfcHJlZGljdGlvbigpe1xuICB2YXIgc3RhdGVfY29weSA9IHJvb3RfY2xvbmUoc3RhdGUpO1xuICBzdGF0ZV9oaXN0b3J5W2N1cnJlbnRfZ2FtZV90aWNrXSA9IHN0YXRlO1xuICB2YXIgaSA9IGN1cnJlbnRfZ2FtZV90aWNrO1xuICB3aGlsZSgoTWF0aC5hYnMoc3RhdGVfY29weVsndl94J10pID4gMC4wMDMgfHwgTWF0aC5hYnMoc3RhdGVfY29weVsndl95J10pID4gMC4wMDMpICYmIGkgPCBnYW1lX2xlbmd0aCl7XG4gICAgc3RhdGVfY29weSA9IHBoeXNpY3NfZW5naW5lX3N0ZXAoc3RhdGVfY29weSwgdW5kZWZpbmVkKTtcbiAgICBzdGF0ZV9oaXN0b3J5W2ldID0gc3RhdGVfY29weTtcbiAgICBpKys7XG4gIH1cbiAgZW5kaW5nX3RpY2sgPSBpIC0gMTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyZXIoc3RhdGUpe1xuICBjdHguc2F2ZSgpO1xuICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgcmVuZGVyX3RpbWVfYmFyKGN0eCwgdGltZV9iYXIpO1xuICByZW5kZXJfZnVlbF9iYXIoY3R4LCBmdWVsX2Jhcik7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICBjdHgucmVjdChzdGF0ZVsnZmllbGRfdG9wX2xlZnRfeCddLCBzdGF0ZVsnZmllbGRfdG9wX2xlZnRfeSddLCBzdGF0ZVsnZmllbGRfd2lkdGgnXSwgc3RhdGVbJ2ZpZWxkX2hlaWdodCddIC0gc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3knXSk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgY3R4LnJlY3QoMTAwLCAxMDAsIDMwLCAzMCk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gIGN0eC5hcmMoc3RhdGVbJ3Bvc194J10sIHN0YXRlWydwb3NfeSddLCBzdGF0ZVsncmFkaXVzJ10sIDAsIDIqTWF0aC5QSSk7XG4gIGN0eC5maWxsKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gIGN0eC5zZXRMaW5lRGFzaChbMl0pO1xuICBjdHguYXJjKHN0YXRlWydmX3Bvc194J10sIHN0YXRlWydmX3Bvc195J10sIHN0YXRlWydyYWRpdXMnXSwgMCwgMipNYXRoLlBJKTtcbiAgY3R4LnN0cm9rZSgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc2V0TGluZURhc2goW10pO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAncmVkJztcbiAgY3R4LmFyYyhzdGF0ZVsndF9wb3NfeCddLCBzdGF0ZVsndF9wb3NfeSddLCBzdGF0ZVsncmFkaXVzJ10qMiwgMCwgMipNYXRoLlBJKTtcbiAgY3R4LnN0cm9rZSgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgaWYoZ2FtZV9lbmRlZCl7XG4gICAgcmVuZGVyX2dhbWVfZW5kKGN0eCwgZ2FtZV9lbmRfd2l0aF9zdGF0dXMpO1xuICB9XG4gIGN0eC5yZXN0b3JlKCk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrX2dhbWVfZW5kKHN0YXRlKXtcbiAgdmFyIGRpc3RfdG9fZ29hbCA9IE1hdGguc3FydChNYXRoLnBvdyhzdGF0ZVsncG9zX3gnXSAtIHN0YXRlWyd0X3Bvc194J10sIDIpICsgTWF0aC5wb3coc3RhdGVbJ3Bvc195J10gLSBzdGF0ZVsndF9wb3NfeSddLCAyKSk7XG4gIGlmKGN1cnJlbnRfZ2FtZV90aWNrID49IGdhbWVfbGVuZ3RoKXtcbiAgICBpZihkaXN0X3RvX2dvYWwgPiBzdGF0ZVsnd2luX2Rpc3QnXSl7XG4gICAgICByZXR1cm4gR0FNRV9MT1NUX1NUQVRVUztcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBHQU1FX1dPTl9TVEFUVVM7XG4gICAgfVxuICB9ZWxzZXtcbiAgICBpZihjaGVja19zdG9wcGVkKHN0YXRlKSAgJiYgZGlzdF90b19nb2FsIDw9IHN0YXRlWyd3aW5fZGlzdCddKXtcbiAgICAgIHJldHVybiBHQU1FX1dPTl9TVEFUVVM7XG4gICAgfWVsc2UgaWYoY2hlY2tfc3RvcHBlZChzdGF0ZSkgJiYgZnVlbF9iYXJbJ2ZpbGwnXSA8IGZ1ZWxfZWZmaWNpZW5jeSl7XG4gICAgICByZXR1cm4gR0FNRV9MT1NUX1NUQVRVUztcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBJTl9HQU1FX1NUQVRVUztcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFpbkxvb3AoKXtcbiAgaWYoIWdhbWVfc3RhcnRlZCl7XG4gICAgZ2FtZV9zdGFydGVkID0gdHJ1ZTtcbiAgICBzdGF0ZV9wcmVkaWN0aW9uKCk7XG4gIH1cbiAgdmFyIGdhbWVfZW5kX3N0YXR1cyA9IGNoZWNrX2dhbWVfZW5kKHN0YXRlKTtcbiAgaWYoZ2FtZV9lbmRfc3RhdHVzID09IElOX0dBTUVfU1RBVFVTKXtcbiAgICBpZihjdXJyZW50X2dhbWVfdGljayA8IGdhbWVfbGVuZ3RoKXtcbiAgICAgIHN0YXRlWydmX3Bvc194J10gPSBzdGF0ZV9oaXN0b3J5W2VuZGluZ190aWNrXVsncG9zX3gnXTtcbiAgICAgIHN0YXRlWydmX3Bvc195J10gPSBzdGF0ZV9oaXN0b3J5W2VuZGluZ190aWNrXVsncG9zX3knXTtcbiAgICAgIHN0YXRlID0gcGh5c2ljc19lbmdpbmVfc3RlcChzdGF0ZSwgdW5kZWZpbmVkKTtcbiAgICAgIHJlbmRlcmVyKHN0YXRlKTtcbiAgICAgIGN1cnJlbnRfZ2FtZV90aWNrICs9IDE7XG4gICAgfVxuICB9ZWxzZXtcbiAgICBnYW1lX2VuZGVkID0gdHJ1ZTtcbiAgICBnYW1lX2VuZF93aXRoX3N0YXR1cyA9IGdhbWVfZW5kX3N0YXR1cztcbiAgICByZW5kZXJlcihzdGF0ZSk7XG4gICAgLy9jb25zb2xlLmxvZyhzdGF0ZSk7XG4gICAgLy92YXIgZGlzdF90b19nb2FsID0gTWF0aC5zcXJ0KE1hdGgucG93KHN0YXRlWydwb3NfeCddIC0gc3RhdGVbJ3RfcG9zX3gnXSwyKSArIE1hdGgucG93KHN0YXRlWydwb3NfeSddIC0gc3RhdGVbJ3RfcG9zX3knXSwyKSk7XG4gICAgLy9jb25zb2xlLmxvZyhkaXN0X3RvX2dvYWwpO1xuICB9XG59XG5cbnZhciBkZXRlY3RvciA9IG5ldyBDb2xsaXNpb25EZXRlY3RvcigpO1xudmFyIHJlc29sdmVyID0gbmV3IEltcGx1c2VSZXNvbHZlcigpO1xuXG5mdW5jdGlvbiBwaHlzaWNzX2VuZ2luZV9zdGVwX25ldyhnYW1lX29iamVjdHMpe1xuICBnYW1lX29iamVjdHMuZmlsdGVyKG9iaiA9PiBvYmoubW92ZWFibGUpLmZvckVhY2goZnVuY3Rpb24ob2JqKXtcbiAgICBsZXQgcG9zID0gb2JqLmdldF9wb3NpdGlvbigpO1xuICAgIG9iai5zZXRfcG9zaXRpb24ocG9zLnggKyBvYmoudl94LCBwb3MueSArIG9iai52X3kpO1xuICAgIG9iai52X3ggKz0gb2JqLmFfeDtcbiAgICBvYmoudl95ICs9IG9iai5hX3k7XG4gIH0pO1xuXG4gIHZhciBjb2xsaXNpb25fcGFpcnMgPSBbXTtcbiAgZm9yKHZhciBpID0gMCA7IGkgPCBnYW1lX29iamVjdHMubGVuZ3RoIDsgaSArKyl7XG4gICAgZm9yKHZhciBqID0gMSA7IGogPCBnYW1lX29iamVjdHMubGVuZ3RoIDsgaiArKyl7XG4gICAgICB2YXIgY29udGFjdCA9IGRldGVjdG9yLmNhbl9jb2xsaWRlKGdhbWVfb2JqZWN0c1tpXSwgZ2FtZV9vYmplY3RzW2pdKTtcbiAgICAgIGlmKGkgIT0gaiAmJiBjb250YWN0ICE9IDAgKXtcbiAgICAgICAgY29sbGlzaW9uX3BhaXJzLnB1c2goW2dhbWVfb2JqZWN0c1tpXSwgZ2FtZV9vYmplY3RzW2pdLCBjb250YWN0XSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vaWYoY29sbGlzaW9uX3BhaXJzLmxlbmd0aCA+IDApe1xuICAgIC8vY29uc29sZS5sb2coY29sbGlzaW9uX3BhaXJzKTtcbiAgLy99XG5cbiAgY29sbGlzaW9uX3BhaXJzLmZvckVhY2goZnVuY3Rpb24oY19wYWlyKXtcbiAgICByZXNvbHZlci5yZXNvbHZlKGNfcGFpclswXSwgY19wYWlyWzFdLCBjX3BhaXJbMl0pO1xuICB9KTtcbn1cblxudmFyIHBsYXllcl9ib2R5ID0gbmV3IENpcmNsZSgzMCwgMzEsIDIwKTtcbnZhciBwbGF5ZXIgPSBuZXcgR2FtZU9iamVjdChDb2xsaXNpb25EZXRlY3Rvci5DX0dST1VQMSwgcGxheWVyX2JvZHksIHBsYXllcl9ib2R5LCB0cnVlKTtcbnBsYXllci5zZXRfdmVsb2NpdHkoNCwgNCk7XG5wbGF5ZXIuc2V0X2FjY2VsZXJhdGlvbigwLCAwKTtcblxudmFyIHRhcmdldF9ib2R5ID0gbmV3IENpcmNsZSg0MDAsIDgwLCBwbGF5ZXJfYm9keS5yICogMik7XG52YXIgdGFyZ2V0ID0gbmV3IEdhbWVPYmplY3QoQ29sbGlzaW9uRGV0ZWN0b3IuTk9fQ09MTElTSU9OLCB0YXJnZXRfYm9keSwgdGFyZ2V0X2JvZHksIGZhbHNlKTtcblxudmFyIHBsYXllcl9mdXR1cmVfYm9keSA9IG5ldyBDaXJjbGUoMCwgMCwgcGxheWVyX2JvZHkucik7XG52YXIgcGxheWVyX2Z1dHVyZSA9IG5ldyBHYW1lT2JqZWN0KENvbGxpc2lvbkRldGVjdG9yLk5PX0NPTExJU0lPTiwgcGxheWVyX2Z1dHVyZV9ib2R5LCBwbGF5ZXJfZnV0dXJlX2JvZHksIGZhbHNlKTtcblxudmFyIGxlZnRfbGluZSA9IG5ldyBMaW5lKCd5JywgMCk7XG52YXIgcmlnaHRfbGluZSA9IG5ldyBMaW5lKCd5JywgY2FudmFzLndpZHRoKTtcbnZhciB0b3BfbGluZSA9IG5ldyBMaW5lKCd4JywgMCk7XG52YXIgYm90dG9tX2xpbmUgPSBuZXcgTGluZSgneCcsIGNhbnZhcy5oZWlnaHQpO1xudmFyIGxlZnQgPSBuZXcgR2FtZU9iamVjdChDb2xsaXNpb25EZXRlY3Rvci5DX0dST1VQMSwgbGVmdF9saW5lLCBsZWZ0X2xpbmUsIGZhbHNlKTtcbnZhciByaWdodCA9IG5ldyBHYW1lT2JqZWN0KENvbGxpc2lvbkRldGVjdG9yLkNfR1JPVVAxLCByaWdodF9saW5lLCByaWdodF9saW5lLCBmYWxzZSk7XG52YXIgdG9wID0gbmV3IEdhbWVPYmplY3QoQ29sbGlzaW9uRGV0ZWN0b3IuQ19HUk9VUDEsIHRvcF9saW5lLCB0b3BfbGluZSwgZmFsc2UpO1xudmFyIGJvdHRvbSA9IG5ldyBHYW1lT2JqZWN0KENvbGxpc2lvbkRldGVjdG9yLkNfR1JPVVAxLCBib3R0b21fbGluZSwgYm90dG9tX2xpbmUsIGZhbHNlKTtcblxudmFyIGJsb2NrX2FhYmIgPSBuZXcgQUFCQigxMDAsIDEwMCwgMzAwLCAyMDApO1xudmFyIGJsb2NrID0gbmV3IEdhbWVPYmplY3QoQ29sbGlzaW9uRGV0ZWN0b3IuQ19HUk9VUDEsIGJsb2NrX2FhYmIsIGJsb2NrX2FhYmIsIGZhbHNlKTtcblxuZnVuY3Rpb24gbWFpbkxvb3BOZXcoKXtcbiAgaWYoIWdhbWVfc3RhcnRlZCl7XG4gICAgZ2FtZV9zdGFydGVkID0gdHJ1ZTtcbiAgfVxuICB2YXIgZ2FtZV9vYmplY3RzID0gW1xuICAgIHBsYXllcixcbiAgICB0YXJnZXQsXG4gICAgbGVmdCxcbiAgICByaWdodCxcbiAgICB0b3AsXG4gICAgYm90dG9tLFxuICAgIGJsb2NrXG4gIF07XG5cbiAgcGh5c2ljc19lbmdpbmVfc3RlcF9uZXcoZ2FtZV9vYmplY3RzKTtcblxuICBjdHguc2F2ZSgpO1xuICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gIGdhbWVfb2JqZWN0cy5mb3JFYWNoKGZ1bmN0aW9uKG9iail7XG4gICAgb2JqLmRpc3BsYXlfYm9keS5yZW5kZXIoY3R4KTtcbiAgfSk7XG4gIGN0eC5yZXN0b3JlKCk7XG59XG5cblxuZnVuY3Rpb24gcm9vdF9jbG9uZShvYmope1xuICB2YXIgY2xvbmUgPSB7fTtcbiAgZm9yKHZhciBrZXkgaW4gb2JqKXtcbiAgICBjbG9uZVtrZXldID0gb2JqW2tleV07XG4gIH1cbiAgcmV0dXJuIGNsb25lO1xufVxuXG5taW5fc3BlZWQgPSAwLjAwMztcbi8qIHN0YXRlOlxueyd2X3gnOiAxLFxuICd2X3knOiAxLFxuICdhX3gnOiAwLjEsXG4gJ2FfeSc6IDAuMSxcbiAncG9zX3gnOiAxMCxcbiAncG9zX3knOiAxMCxcbiAncmFkaXVzJzogNSxcbiAnZmllbGRfd2lkdGgnOiA2MDAsXG4gJ2ZpZWxkX2hlaWdodCc6IDYwMCxcbiAnbnVtX29mX3RpY2tzJzogNjAwMFxufVxuKi9cbmZ1bmN0aW9uIHBoeXNpY3NfZW5naW5lX3N0ZXAoc3RhdGUsIHJlbmRlcmVyKXtcbiAgdmFyIHN0YXRlX2NvcHkgPSByb290X2Nsb25lKHN0YXRlKTtcbiAgc3RhdGVfY29weVsncG9zX3gnXSArPSBzdGF0ZV9jb3B5Wyd2X3gnXTtcbiAgc3RhdGVfY29weVsncG9zX3knXSArPSBzdGF0ZV9jb3B5Wyd2X3knXTtcbiAgc3RhdGVfY29weVsndl94J10gKz0gc3RhdGVfY29weVsnYV94J107XG4gIHN0YXRlX2NvcHlbJ3ZfeSddICs9IHN0YXRlX2NvcHlbJ2FfeSddO1xuICBzdGF0ZV9jb3B5Wyd2X3gnXSA+IDAgPyBzdGF0ZV9jb3B5Wyd2X3gnXSAtPSBmcmljdGlvbiA6IHN0YXRlX2NvcHlbJ3ZfeCddICs9IGZyaWN0aW9uO1xuICBzdGF0ZV9jb3B5Wyd2X3knXSA+IDAgPyBzdGF0ZV9jb3B5Wyd2X3knXSAtPSBmcmljdGlvbiA6IHN0YXRlX2NvcHlbJ3ZfeSddICs9IGZyaWN0aW9uO1xuICBpZihNYXRoLmFicyhzdGF0ZV9jb3B5Wyd2X3gnXSkgPD0gbWluX3NwZWVkKXtcbiAgICBzdGF0ZV9jb3B5Wyd2X3gnXSA9IDA7XG4gIH1cbiAgaWYoTWF0aC5hYnMoc3RhdGVfY29weVsndl95J10pIDw9IG1pbl9zcGVlZCl7XG4gICAgc3RhdGVfY29weVsndl95J10gPSAwO1xuICB9XG5cbiAgLy8gcmVjdFt4LCB5LCB3aWR0aCwgaGVpZ2h0XVxuICB2YXIgbGlzdF9vZl9yZWN0cyA9IFtdO1xuICBsaXN0X29mX3JlY3RzLnB1c2goW3N0YXRlWydmaWVsZF90b3BfbGVmdF94J10sIHN0YXRlWydmaWVsZF90b3BfbGVmdF95J10sIHN0YXRlWydmaWVsZF93aWR0aCddLCBzdGF0ZVsnZmllbGRfaGVpZ2h0J10gLSBzdGF0ZVsnZmllbGRfdG9wX2xlZnRfeSddXSlcbiAgbGlzdF9vZl9yZWN0cy5wdXNoKFsxMDAsIDEwMCwgMzAsIDMwXSk7XG4gIHZhciBiYWxsX2NlbnRlciA9IFtzdGF0ZV9jb3B5Wydwb3NfeCddLCBzdGF0ZV9jb3B5Wydwb3NfeSddXTtcbiAgdmFyIGJhbGxfcmFkaXVzID0gc3RhdGVfY29weVsncmFkaXVzJ107XG5cbiAgZm9yKHZhciBpID0gMCA7IGkgPCBsaXN0X29mX3JlY3RzLmxlbmd0aCA7IGkgKyspe1xuICAgIHZhciByZWN0ID0gbGlzdF9vZl9yZWN0c1tpXTtcbiAgICB2YXIgbGVmdF94ID0gcmVjdFswXTtcbiAgICB2YXIgcmlnaHRfeCA9IHJlY3RbMF0gKyByZWN0WzJdO1xuICAgIHZhciB0b3BfeSA9IHJlY3RbMV07XG4gICAgdmFyIGJvdHRvbV95ID0gcmVjdFsxXSArIHJlY3RbM107XG4gICAgaWYoYmFsbF9jZW50ZXJbMV0gPiB0b3BfeVxuICAgICAgJiYgYmFsbF9jZW50ZXJbMV0gPCBib3R0b21feVxuICAgICAgJiYoIE1hdGguYWJzKGJhbGxfY2VudGVyWzBdIC0gbGVmdF94KSA8PSBiYWxsX3JhZGl1cyBcbiAgICAgICAgfHwgTWF0aC5hYnMocmlnaHRfeCAtIGJhbGxfY2VudGVyWzBdKSA8PSBiYWxsX3JhZGl1cykpe1xuICAgICAgc3RhdGVfY29weVsndl94J10gKj0gLTE7XG4gICAgfVxuICAgIGlmKGJhbGxfY2VudGVyWzBdID4gbGVmdF94XG4gICAgICAmJiBiYWxsX2NlbnRlclswXSA8IHJpZ2h0X3hcbiAgICAgICYmKCBNYXRoLmFicyhiYWxsX2NlbnRlclsxXSAtIHRvcF95KSA8PSBiYWxsX3JhZGl1cyBcbiAgICAgIHx8IE1hdGguYWJzKGJvdHRvbV95IC0gYmFsbF9jZW50ZXJbMV0pIDw9IGJhbGxfcmFkaXVzKSl7XG4gICAgICBzdGF0ZV9jb3B5Wyd2X3knXSAqPSAtMTtcbiAgICB9XG4gIH1cbiAgaWYocmVuZGVyZXIgIT09IHVuZGVmaW5lZCl7XG4gICAgcmVuZGVyZXIoc3RhdGVfY29weSk7XG4gIH1cbiAgdXBkYXRlX3RpbWVfYmFyKCk7XG4gIHJldHVybiBzdGF0ZV9jb3B5O1xufVxuXG5jb25zb2xlLmxvZygnc3RhcnQhJyk7XG5cbnNldEludGVydmFsKG1haW5Mb29wTmV3LCAxMCk7XG4vL3NldEludGVydmFsKG1haW5Mb29wLCAxMCk7XG4iXX0=
