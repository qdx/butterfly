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

},{"./CollisionDetector.js":3,"./Geometry.js":6}],2:[function(require,module,exports){
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

},{"./CollisionDetector.js":3,"./Geometry.js":6}],3:[function(require,module,exports){
var Geometry = require('./Geometry.js');
var ImpluseResolver = require('./ImpluseResolver.js');
var Contact = require('./Contact.js');

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
    switch(collision_type){
      case Geometry.AABB + ':' + Geometry.AABB:
        return this.aabb_2_aabb_can_collide(obj1, obj2);
        break;
      case Geometry.CIRCLE + ':' + Geometry.CIRCLE:
        return this.circle_2_circle_can_collide(obj1, obj2);
        break;
      case Geometry.AABB + ':' + Geometry.CIRCLE:
        return this.circle_2_aabb_can_collide(obj2, ojb1);
        break;
      case Geometry.CIRCLE + ':' + Geometry.AABB:
        return this.circle_2_aabb_can_collide(obj1, obj2);
        break;
      case Geometry.CIRCLE + ':' + Geometry.LINE:
        return this.circle_2_line_can_collide(obj1, obj2);
        break;
      case Geometry.LINE + ':' + Geometry.CIRCLE:
        return this.circle_2_line_can_collide(obj2, obj1);
        break;
      case Geometry.AABB + ':' + Geometry.LINE:
        return this.aabb_2_line_can_collide(obj1, obj2);
        break;
      case Geometry.LINE+ ':' + Geometry.AABB:
        return this.aabb_2_line_can_collide(obj2, obj1);
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
    let x_sub = point1.x-point2.x;
    let y_sub = point1.y - point2.y;
    return x_sub * x_sub + y_sub * y_sub
  }

  _distance_square(x1, y1, x2, y2){
    let x_sub = x1 - x2;
    let y_sub = y1 - y2;
    return x_sub * x_sub + y_sub * y_sub;
  }

  aabb_2_aabb_can_collide(obj1, obj2){
    let ab1 = obj1.collision_body;
    let ab2 = obj2.collision_body;
    let min1 = ab1.min;
    let max1 = ab1.max;
    let min2 = ab2.min;
    let max2 = ab2.max;
    if((min1.x <= max2.x && max1.x >= min2.x)
      && (min1.y <= max2.y && max1.y >= min2.y)){
      // TODO: implement penetration
      return new Contact(obj1, obj2);
    }else{
      return undefined;
    }
  }

  circle_2_circle_can_collide(obj1, obj2){
    let c1 = obj1.collision_body;
    let c2 = obj2.collision_body;
    let center1 = c1.center;
    let center2 = c2.center;
    if(_distance_square(center1, center2) <= Math.pow(c1.r + c2.r, 2)){
      // TODO: implement penetration
      return new Contact(obj1, obj2);
    }else{
      return undefined;
    }
  }

  // return x  when min < x < max, other wise return which ever is closer to x from (min, max)
  _clamp(x, min, max){
    return x < min ? min : x > max ? max : x;
  }

  circle_2_aabb_can_collide(obj1, obj2){
    let c = obj1.collision_body;
    let ab = obj2.collision_body;
    let center = c.center;
    let clamp_x = this._clamp(center.x, ab.min.x, ab.max.x);
    let clamp_y = this._clamp(center.y, ab.min.y, ab.max.y);
    let result = 0;
    if(Math.abs(center.x - clamp_x) < c.r
      && Math.abs(center.y - clamp_y) < c.r){
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
        let center_to_clamp = this._distance_square(
          clamp_x,
          clamp_y,
          c.center.x,
          c.center.y);
        if( center_to_clamp <= c.r*c.r){
          result['contact_type'] = Contact.CONTACT_CIRCLE_2_POINT;
        }
      }
      else if(clamp_x == ab.min.x || clamp_x == ab.max.x){
        // collision on y axis
        result['contact_type'] = Contact.CONTACT_CIRCLE_2_AB_LINE;
        result['contact']['aligned_axis'] = 'y';
      }else if(clamp_y == ab.min.y || clamp_y == ab.max.y){
        // collision on x axis
        result['contact_type'] = Contact.CONTACT_CIRCLE_2_AB_LINE;
        result['contact']['aligned_axis'] = 'x';
      }else{
        // circle center inside AABB

      }
    }
    if(!result){
      obj1.set_intersection(undefined);
      obj2.set_intersection(undefined);
    }
    return result;
  }

  circle_2_line_can_collide(obj1, obj2){
    let c = obj1.collision_body;
    let l = obj2.collision_body;

    let center = c.center;
    let result = 0;
    switch(l.parallel_to){
      case 'x':
        if(Math.abs(center.y - l.pos) < c.r){
          result = new Contact(obj1, obj2);
        }
        break;
      case 'y':
        if(Math.abs(center.x - l.pos) < c.r){
          result = new Contact(obj1, obj2);
        }
        break;
    }
    if(!result){
      obj1.set_intersection(undefined);
      obj2.set_intersection(undefined);
    }
    return result;
  }

  aabb_2_line_can_collide(obj1, obj2){
    let ab = obj1.collision_body;
    let l = obj2.collision_body;
    // disabling this since we don't support it right now
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

},{"./Contact.js":4,"./Geometry.js":6,"./ImpluseResolver.js":7}],4:[function(require,module,exports){
const CONTACT_CIRCLE_2_POINT = 1;
const CONTACT_CIRCLE_2_AB_LINE = 2;

class Contact{
  constructor(obj1, obj2){
    this.obj1 = obj1;
    this.obj2 = obj2;
  }

  // contact_point example: {x: 0, y: 0}
  set_point_contact(contact_point){
    this.contact_type = CONTACT_CIRCLE_2_POINT;
    this.contact_point = contact_point;
  }

  // algined_axis example: 'x'
  set_aa_line_contact(aligned_axis){
    this.contact_type = CONTACT_CIRCLE_2_AB_LINE;
    this.aligned_axis = aligned_axis;
  }

  set_penetration(as_vector){
    this.penetration = as_vector;
  }
}

module.exports = Contact;
module.exports.CONTACT_CIRCLE_2_POINT  = CONTACT_CIRCLE_2_POINT;
module.exports.CONTACT_CIRCLE_2_AB_LINE = CONTACT_CIRCLE_2_AB_LINE;

},{}],5:[function(require,module,exports){
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

  set_intersection(obj){
    this.intersect_with = obj;
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

},{"./Geometry.js":6}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
    if(c.intersect_with !== ab || ab.intersect_with != c){
      if(contact['contact_type'] == CONTACT_CIRCLE_2_POINT){
        this._circle_2_point_resolution(c, contact['contact']['point']);
      }else if(contact['contact_type'] == CONTACT_CIRCLE_2_AB_LINE){
        this._circle_2_ab_line_resolution(c, contact['contact']['aligned_axis']);
      }
      c.set_intersection(ab);
      ab.set_intersection(c);
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

    let sin_theta = Math.sqrt(1 - cos_theta * cos_theta);

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
    if(c.intersect_with !== l || l.intersect_with != c){
      this._circle_2_ab_line_resolution(c, l.collision_body.parallel_to);
      c.set_intersection(l);
      l.set_intersection(c);
    }
  }
}
module.exports = ImpluseResolver;
module.exports.CONTACT_CIRCLE_2_POINT  = CONTACT_CIRCLE_2_POINT;
module.exports.CONTACT_CIRCLE_2_AB_LINE = CONTACT_CIRCLE_2_AB_LINE;

},{"./Geometry.js":6,"./Vector.js":9}],8:[function(require,module,exports){
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

},{"./CollisionDetector.js":3,"./Geometry.js":6}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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
player.set_velocity(6, 6);
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
  console.log('v' + (player.v_x * player.v_x + player.v_y * player.v_y));

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

},{"./AABB.js":1,"./Circle.js":2,"./CollisionDetector.js":3,"./GameObject.js":5,"./ImpluseResolver.js":7,"./Line.js":8}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQUFCQi5qcyIsInNyYy9DaXJjbGUuanMiLCJzcmMvQ29sbGlzaW9uRGV0ZWN0b3IuanMiLCJzcmMvQ29udGFjdC5qcyIsInNyYy9HYW1lT2JqZWN0LmpzIiwic3JjL0dlb21ldHJ5LmpzIiwic3JjL0ltcGx1c2VSZXNvbHZlci5qcyIsInNyYy9MaW5lLmpzIiwic3JjL1ZlY3Rvci5qcyIsInNyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgR2VvbWV0cnkgPSByZXF1aXJlKCcuL0dlb21ldHJ5LmpzJyk7XG52YXIgQ29sbGlzaW9uRGV0ZWN0b3IgPSByZXF1aXJlKCcuL0NvbGxpc2lvbkRldGVjdG9yLmpzJyk7XG5cbmNsYXNzIEFBQkIgZXh0ZW5kcyBHZW9tZXRyeXtcbiAgY29uc3RydWN0b3IobWluX3gsIG1pbl95LCBtYXhfeCwgbWF4X3kpe1xuICAgIHN1cGVyKEdlb21ldHJ5LkFBQkIpO1xuICAgIHRoaXMubWluID0ge307XG4gICAgdGhpcy5taW4ueCA9IG1pbl94O1xuICAgIHRoaXMubWluLnkgPSBtaW5feTtcbiAgICB0aGlzLm1heCA9IHt9O1xuICAgIHRoaXMubWF4LnggPSBtYXhfeDtcbiAgICB0aGlzLm1heC55ID0gbWF4X3k7XG4gICAgdGhpcy53aWR0aCA9IG1heF94IC0gbWluX3g7XG4gICAgdGhpcy5oZWlnaHQgPSBtYXhfeSAtIG1pbl95O1xuICB9XG4gIHJlbmRlcihjdHgpe1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHgucmVjdChcbiAgICAgIHRoaXMubWluLngsXG4gICAgICB0aGlzLm1pbi55LFxuICAgICAgdGhpcy5tYXgueCAtIHRoaXMubWluLngsXG4gICAgICB0aGlzLm1heC55IC0gdGhpcy5taW4ueSk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBBQUJCO1xuIiwidmFyIEdlb21ldHJ5ID0gcmVxdWlyZSgnLi9HZW9tZXRyeS5qcycpO1xudmFyIENvbGxpc2lvbkRldGVjdG9yID0gcmVxdWlyZSgnLi9Db2xsaXNpb25EZXRlY3Rvci5qcycpO1xuXG5jbGFzcyBDaXJjbGUgZXh0ZW5kcyBHZW9tZXRyeXtcbiAgY29uc3RydWN0b3IoY2VudGVyX3gsIGNlbnRlcl95LCByYWRpdXMpe1xuICAgIHN1cGVyKEdlb21ldHJ5LkNJUkNMRSk7XG4gICAgdGhpcy5jZW50ZXIgPSB7fTtcbiAgICB0aGlzLmNlbnRlci54ID0gY2VudGVyX3g7XG4gICAgdGhpcy5jZW50ZXIueSA9IGNlbnRlcl95O1xuICAgIHRoaXMuciA9IHJhZGl1cztcbiAgfVxuICByZW5kZXIoY3R4KXtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmFyYyh0aGlzLmNlbnRlci54LHRoaXMuY2VudGVyLnksIHRoaXMuciwgMCwgMipNYXRoLlBJKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IENpcmNsZTtcbiIsInZhciBHZW9tZXRyeSA9IHJlcXVpcmUoJy4vR2VvbWV0cnkuanMnKTtcbnZhciBJbXBsdXNlUmVzb2x2ZXIgPSByZXF1aXJlKCcuL0ltcGx1c2VSZXNvbHZlci5qcycpO1xudmFyIENvbnRhY3QgPSByZXF1aXJlKCcuL0NvbnRhY3QuanMnKTtcblxuY29uc3QgQ09MTElTSU9OX0dST1VQUyA9IFsweDAsXG4gIDB4MSwgMHgyLCAweDQsIDB4OF1cbi8vMHgxMCwgMHgyMCwgMHg0MCwgMHg4MCxcbi8vMHgxMDAsIDB4MjAwLCAweDQwMCwgMHg4MDAsXG4vLzB4MTAwMCwgMHgyMDAwLCAweDQwMDAsIDB4ODAwMF07XG5jb25zdCBOT19DT0xMSVNJT04gPSBDT0xMSVNJT05fR1JPVVBTWzBdO1xuY29uc3QgQ19HUk9VUDEgPSBDT0xMSVNJT05fR1JPVVBTWzFdO1xuY29uc3QgQ19HUk9VUDIgPSBDT0xMSVNJT05fR1JPVVBTWzJdO1xuY29uc3QgQ19HUk9VUDMgPSBDT0xMSVNJT05fR1JPVVBTWzNdO1xuY29uc3QgQ19HUk9VUDQgPSBDT0xMSVNJT05fR1JPVVBTWzRdO1xuLy9jb25zdCBDX0dST1VQNSA9IENPTExJU0lPTl9HUk9VUFNbNV07XG5cbmNsYXNzIENvbGxpc2lvbkRldGVjdG9ye1xuXG4gIC8vY29uc3RydWN0b3IoKXtcbiAgICAvL2NvbnNvbGUubG9nKCdbQ29sbGlzaW9uRGV0ZWN0b3JdIGNvbnN0cnVjdGluZycpO1xuICAvL31cblxuICBjYW5fY29sbGlkZShvYmoxLCBvYmoyKXtcbiAgICBsZXQgZ3JvdXBfY2FuX2NvbGxpZGUgPSAob2JqMS5jb2xsaXNpb25fZ3JvdXAgJiBvYmoyLmNvbGxpc2lvbl9ncm91cCkgPiAwO1xuICAgIGlmKCFncm91cF9jYW5fY29sbGlkZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IGNvbGxpc2lvbl90eXBlID0gb2JqMS5jb2xsaXNpb25fYm9keS5zaGFwZSArICc6JyArIG9iajIuY29sbGlzaW9uX2JvZHkuc2hhcGU7XG4gICAgLy8gRklYTUU6IG9wdGltaXplIHdpdGggYml0IG9wZXJhdGlvbiwgYml0IGNvbXBhcmlzb24gc2hvdWxkIGJlIG11Y2ggZmFzdGVyIHRoYW4gc3RyaW5nXG4gICAgc3dpdGNoKGNvbGxpc2lvbl90eXBlKXtcbiAgICAgIGNhc2UgR2VvbWV0cnkuQUFCQiArICc6JyArIEdlb21ldHJ5LkFBQkI6XG4gICAgICAgIHJldHVybiB0aGlzLmFhYmJfMl9hYWJiX2Nhbl9jb2xsaWRlKG9iajEsIG9iajIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuQ0lSQ0xFICsgJzonICsgR2VvbWV0cnkuQ0lSQ0xFOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9jaXJjbGVfY2FuX2NvbGxpZGUob2JqMSwgb2JqMik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5BQUJCICsgJzonICsgR2VvbWV0cnkuQ0lSQ0xFOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9hYWJiX2Nhbl9jb2xsaWRlKG9iajIsIG9qYjEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuQ0lSQ0xFICsgJzonICsgR2VvbWV0cnkuQUFCQjpcbiAgICAgICAgcmV0dXJuIHRoaXMuY2lyY2xlXzJfYWFiYl9jYW5fY29sbGlkZShvYmoxLCBvYmoyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEdlb21ldHJ5LkNJUkNMRSArICc6JyArIEdlb21ldHJ5LkxJTkU6XG4gICAgICAgIHJldHVybiB0aGlzLmNpcmNsZV8yX2xpbmVfY2FuX2NvbGxpZGUob2JqMSwgb2JqMik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5MSU5FICsgJzonICsgR2VvbWV0cnkuQ0lSQ0xFOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9saW5lX2Nhbl9jb2xsaWRlKG9iajIsIG9iajEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuQUFCQiArICc6JyArIEdlb21ldHJ5LkxJTkU6XG4gICAgICAgIHJldHVybiB0aGlzLmFhYmJfMl9saW5lX2Nhbl9jb2xsaWRlKG9iajEsIG9iajIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuTElORSsgJzonICsgR2VvbWV0cnkuQUFCQjpcbiAgICAgICAgcmV0dXJuIHRoaXMuYWFiYl8yX2xpbmVfY2FuX2NvbGxpZGUob2JqMiwgb2JqMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIF9kaXN0YW5jZShwb2ludDEsIHBvaW50Mil7XG4gICAgcmV0dXJuIE1hdGguc3FydChcbiAgICAgIE1hdGgucG93KHBvaW50MS54LXBvaW50Mi54LCAyKVxuICAgICAgKyBNYXRoLnBvdyhwb2ludDEueSAtIHBvaW50Mi55LCAyKVxuICAgICk7XG4gIH1cblxuICBfZGlzdGFuY2Vfc3F1YXJlKHBvaW50MSwgcG9pbnQyKXtcbiAgICBsZXQgeF9zdWIgPSBwb2ludDEueC1wb2ludDIueDtcbiAgICBsZXQgeV9zdWIgPSBwb2ludDEueSAtIHBvaW50Mi55O1xuICAgIHJldHVybiB4X3N1YiAqIHhfc3ViICsgeV9zdWIgKiB5X3N1YlxuICB9XG5cbiAgX2Rpc3RhbmNlX3NxdWFyZSh4MSwgeTEsIHgyLCB5Mil7XG4gICAgbGV0IHhfc3ViID0geDEgLSB4MjtcbiAgICBsZXQgeV9zdWIgPSB5MSAtIHkyO1xuICAgIHJldHVybiB4X3N1YiAqIHhfc3ViICsgeV9zdWIgKiB5X3N1YjtcbiAgfVxuXG4gIGFhYmJfMl9hYWJiX2Nhbl9jb2xsaWRlKG9iajEsIG9iajIpe1xuICAgIGxldCBhYjEgPSBvYmoxLmNvbGxpc2lvbl9ib2R5O1xuICAgIGxldCBhYjIgPSBvYmoyLmNvbGxpc2lvbl9ib2R5O1xuICAgIGxldCBtaW4xID0gYWIxLm1pbjtcbiAgICBsZXQgbWF4MSA9IGFiMS5tYXg7XG4gICAgbGV0IG1pbjIgPSBhYjIubWluO1xuICAgIGxldCBtYXgyID0gYWIyLm1heDtcbiAgICBpZigobWluMS54IDw9IG1heDIueCAmJiBtYXgxLnggPj0gbWluMi54KVxuICAgICAgJiYgKG1pbjEueSA8PSBtYXgyLnkgJiYgbWF4MS55ID49IG1pbjIueSkpe1xuICAgICAgLy8gVE9ETzogaW1wbGVtZW50IHBlbmV0cmF0aW9uXG4gICAgICByZXR1cm4gbmV3IENvbnRhY3Qob2JqMSwgb2JqMik7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNpcmNsZV8yX2NpcmNsZV9jYW5fY29sbGlkZShvYmoxLCBvYmoyKXtcbiAgICBsZXQgYzEgPSBvYmoxLmNvbGxpc2lvbl9ib2R5O1xuICAgIGxldCBjMiA9IG9iajIuY29sbGlzaW9uX2JvZHk7XG4gICAgbGV0IGNlbnRlcjEgPSBjMS5jZW50ZXI7XG4gICAgbGV0IGNlbnRlcjIgPSBjMi5jZW50ZXI7XG4gICAgaWYoX2Rpc3RhbmNlX3NxdWFyZShjZW50ZXIxLCBjZW50ZXIyKSA8PSBNYXRoLnBvdyhjMS5yICsgYzIuciwgMikpe1xuICAgICAgLy8gVE9ETzogaW1wbGVtZW50IHBlbmV0cmF0aW9uXG4gICAgICByZXR1cm4gbmV3IENvbnRhY3Qob2JqMSwgb2JqMik7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8vIHJldHVybiB4ICB3aGVuIG1pbiA8IHggPCBtYXgsIG90aGVyIHdpc2UgcmV0dXJuIHdoaWNoIGV2ZXIgaXMgY2xvc2VyIHRvIHggZnJvbSAobWluLCBtYXgpXG4gIF9jbGFtcCh4LCBtaW4sIG1heCl7XG4gICAgcmV0dXJuIHggPCBtaW4gPyBtaW4gOiB4ID4gbWF4ID8gbWF4IDogeDtcbiAgfVxuXG4gIGNpcmNsZV8yX2FhYmJfY2FuX2NvbGxpZGUob2JqMSwgb2JqMil7XG4gICAgbGV0IGMgPSBvYmoxLmNvbGxpc2lvbl9ib2R5O1xuICAgIGxldCBhYiA9IG9iajIuY29sbGlzaW9uX2JvZHk7XG4gICAgbGV0IGNlbnRlciA9IGMuY2VudGVyO1xuICAgIGxldCBjbGFtcF94ID0gdGhpcy5fY2xhbXAoY2VudGVyLngsIGFiLm1pbi54LCBhYi5tYXgueCk7XG4gICAgbGV0IGNsYW1wX3kgPSB0aGlzLl9jbGFtcChjZW50ZXIueSwgYWIubWluLnksIGFiLm1heC55KTtcbiAgICBsZXQgcmVzdWx0ID0gMDtcbiAgICBpZihNYXRoLmFicyhjZW50ZXIueCAtIGNsYW1wX3gpIDwgYy5yXG4gICAgICAmJiBNYXRoLmFicyhjZW50ZXIueSAtIGNsYW1wX3kpIDwgYy5yKXtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgJ2NvbnRhY3RfdHlwZSc6IDAsXG4gICAgICAgICdjb250YWN0Jzoge1xuICAgICAgICAgICdwb2ludCc6IHtcbiAgICAgICAgICAgICd4JzogY2xhbXBfeCxcbiAgICAgICAgICAgICd5JzogY2xhbXBfeSB9LFxuICAgICAgICAgICdhbGlnbmVkX2F4aXMnOiAnJ319O1xuICAgICAgLy8gY29sbGlzaW9uIGhhcHBlbmVkXG4gICAgICBpZigoY2xhbXBfeCA9PSBhYi5taW4ueCB8fCBjbGFtcF94ID09IGFiLm1heC54KVxuICAgICAgICAmJihjbGFtcF95ID09IGFiLm1pbi55IHx8IGNsYW1wX3kgPT0gYWIubWF4LnkpKXtcbiAgICAgICAgLy8gcG9pbnQgY29udGFjdCB3aXRoIGNvcm5lclxuICAgICAgICBsZXQgY2VudGVyX3RvX2NsYW1wID0gdGhpcy5fZGlzdGFuY2Vfc3F1YXJlKFxuICAgICAgICAgIGNsYW1wX3gsXG4gICAgICAgICAgY2xhbXBfeSxcbiAgICAgICAgICBjLmNlbnRlci54LFxuICAgICAgICAgIGMuY2VudGVyLnkpO1xuICAgICAgICBpZiggY2VudGVyX3RvX2NsYW1wIDw9IGMucipjLnIpe1xuICAgICAgICAgIHJlc3VsdFsnY29udGFjdF90eXBlJ10gPSBDb250YWN0LkNPTlRBQ1RfQ0lSQ0xFXzJfUE9JTlQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYoY2xhbXBfeCA9PSBhYi5taW4ueCB8fCBjbGFtcF94ID09IGFiLm1heC54KXtcbiAgICAgICAgLy8gY29sbGlzaW9uIG9uIHkgYXhpc1xuICAgICAgICByZXN1bHRbJ2NvbnRhY3RfdHlwZSddID0gQ29udGFjdC5DT05UQUNUX0NJUkNMRV8yX0FCX0xJTkU7XG4gICAgICAgIHJlc3VsdFsnY29udGFjdCddWydhbGlnbmVkX2F4aXMnXSA9ICd5JztcbiAgICAgIH1lbHNlIGlmKGNsYW1wX3kgPT0gYWIubWluLnkgfHwgY2xhbXBfeSA9PSBhYi5tYXgueSl7XG4gICAgICAgIC8vIGNvbGxpc2lvbiBvbiB4IGF4aXNcbiAgICAgICAgcmVzdWx0Wydjb250YWN0X3R5cGUnXSA9IENvbnRhY3QuQ09OVEFDVF9DSVJDTEVfMl9BQl9MSU5FO1xuICAgICAgICByZXN1bHRbJ2NvbnRhY3QnXVsnYWxpZ25lZF9heGlzJ10gPSAneCc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8gY2lyY2xlIGNlbnRlciBpbnNpZGUgQUFCQlxuXG4gICAgICB9XG4gICAgfVxuICAgIGlmKCFyZXN1bHQpe1xuICAgICAgb2JqMS5zZXRfaW50ZXJzZWN0aW9uKHVuZGVmaW5lZCk7XG4gICAgICBvYmoyLnNldF9pbnRlcnNlY3Rpb24odW5kZWZpbmVkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGNpcmNsZV8yX2xpbmVfY2FuX2NvbGxpZGUob2JqMSwgb2JqMil7XG4gICAgbGV0IGMgPSBvYmoxLmNvbGxpc2lvbl9ib2R5O1xuICAgIGxldCBsID0gb2JqMi5jb2xsaXNpb25fYm9keTtcblxuICAgIGxldCBjZW50ZXIgPSBjLmNlbnRlcjtcbiAgICBsZXQgcmVzdWx0ID0gMDtcbiAgICBzd2l0Y2gobC5wYXJhbGxlbF90byl7XG4gICAgICBjYXNlICd4JzpcbiAgICAgICAgaWYoTWF0aC5hYnMoY2VudGVyLnkgLSBsLnBvcykgPCBjLnIpe1xuICAgICAgICAgIHJlc3VsdCA9IG5ldyBDb250YWN0KG9iajEsIG9iajIpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAneSc6XG4gICAgICAgIGlmKE1hdGguYWJzKGNlbnRlci54IC0gbC5wb3MpIDwgYy5yKXtcbiAgICAgICAgICByZXN1bHQgPSBuZXcgQ29udGFjdChvYmoxLCBvYmoyKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYoIXJlc3VsdCl7XG4gICAgICBvYmoxLnNldF9pbnRlcnNlY3Rpb24odW5kZWZpbmVkKTtcbiAgICAgIG9iajIuc2V0X2ludGVyc2VjdGlvbih1bmRlZmluZWQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgYWFiYl8yX2xpbmVfY2FuX2NvbGxpZGUob2JqMSwgb2JqMil7XG4gICAgbGV0IGFiID0gb2JqMS5jb2xsaXNpb25fYm9keTtcbiAgICBsZXQgbCA9IG9iajIuY29sbGlzaW9uX2JvZHk7XG4gICAgLy8gZGlzYWJsaW5nIHRoaXMgc2luY2Ugd2UgZG9uJ3Qgc3VwcG9ydCBpdCByaWdodCBub3dcbiAgICByZXR1cm4gZmFsc2U7XG4gICAgbGV0IG1pbiA9IGFiLm1pbjtcbiAgICBsZXQgbWF4ID0gYWIubWF4O1xuICAgIGxldCBjZW50ZXIgPSB7fTtcbiAgICBjZW50ZXIueCA9IChhYi5taW4ueCArIGFiLm1heC54KSAvIDI7XG4gICAgY2VudGVyLnkgPSAoYWIubWluLnkgKyBhYi5tYXgueSkgLyAyO1xuICAgIHN3aXRjaChsLnBhcmFsbGVsX3RvKXtcbiAgICAgIGNhc2UgJ3gnOlxuICAgICAgICByZXR1cm4gY2VudGVyLnkgPD0gbWF4LnkgJiYgY2VudGVyLnkgPj0gbWluLnk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAneSc6XG4gICAgICAgIHJldHVybiBjZW50ZXIueCA8PSBtYXgueCAmJiBjZW50ZXIueCA+PSBtaW4ueDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uRGV0ZWN0b3I7XG5tb2R1bGUuZXhwb3J0cy5OT19DT0xMSVNJT04gPSBOT19DT0xMSVNJT047XG5tb2R1bGUuZXhwb3J0cy5DX0dST1VQMSA9IENfR1JPVVAxO1xubW9kdWxlLmV4cG9ydHMuQ19HUk9VUDIgPSBDX0dST1VQMjtcbm1vZHVsZS5leHBvcnRzLkNfR1JPVVAzID0gQ19HUk9VUDM7XG5tb2R1bGUuZXhwb3J0cy5DX0dST1VQNCA9IENfR1JPVVA0O1xuIiwiY29uc3QgQ09OVEFDVF9DSVJDTEVfMl9QT0lOVCA9IDE7XG5jb25zdCBDT05UQUNUX0NJUkNMRV8yX0FCX0xJTkUgPSAyO1xuXG5jbGFzcyBDb250YWN0e1xuICBjb25zdHJ1Y3RvcihvYmoxLCBvYmoyKXtcbiAgICB0aGlzLm9iajEgPSBvYmoxO1xuICAgIHRoaXMub2JqMiA9IG9iajI7XG4gIH1cblxuICAvLyBjb250YWN0X3BvaW50IGV4YW1wbGU6IHt4OiAwLCB5OiAwfVxuICBzZXRfcG9pbnRfY29udGFjdChjb250YWN0X3BvaW50KXtcbiAgICB0aGlzLmNvbnRhY3RfdHlwZSA9IENPTlRBQ1RfQ0lSQ0xFXzJfUE9JTlQ7XG4gICAgdGhpcy5jb250YWN0X3BvaW50ID0gY29udGFjdF9wb2ludDtcbiAgfVxuXG4gIC8vIGFsZ2luZWRfYXhpcyBleGFtcGxlOiAneCdcbiAgc2V0X2FhX2xpbmVfY29udGFjdChhbGlnbmVkX2F4aXMpe1xuICAgIHRoaXMuY29udGFjdF90eXBlID0gQ09OVEFDVF9DSVJDTEVfMl9BQl9MSU5FO1xuICAgIHRoaXMuYWxpZ25lZF9heGlzID0gYWxpZ25lZF9heGlzO1xuICB9XG5cbiAgc2V0X3BlbmV0cmF0aW9uKGFzX3ZlY3Rvcil7XG4gICAgdGhpcy5wZW5ldHJhdGlvbiA9IGFzX3ZlY3RvcjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRhY3Q7XG5tb2R1bGUuZXhwb3J0cy5DT05UQUNUX0NJUkNMRV8yX1BPSU5UICA9IENPTlRBQ1RfQ0lSQ0xFXzJfUE9JTlQ7XG5tb2R1bGUuZXhwb3J0cy5DT05UQUNUX0NJUkNMRV8yX0FCX0xJTkUgPSBDT05UQUNUX0NJUkNMRV8yX0FCX0xJTkU7XG4iLCJ2YXIgR2VvbWV0cnkgPSByZXF1aXJlKCcuL0dlb21ldHJ5LmpzJyk7XG5cbmNsYXNzIEdhbWVPYmplY3R7XG4gIGNvbnN0cnVjdG9yKGNvbGxpc2lvbl9ncm91cCwgY29sbGlzaW9uX2JvZHksIGRpc3BsYXlfYm9keSwgbW92ZWFibGUpe1xuICAgIGNvbnNvbGUubG9nKCdbR2FtZU9iamVjdF0gY29uc3RydWN0aW5nJyk7XG4gICAgdGhpcy5jb2xsaXNpb25fZ3JvdXAgPSBjb2xsaXNpb25fZ3JvdXA7XG4gICAgdGhpcy5jb2xsaXNpb25fYm9keSA9IGNvbGxpc2lvbl9ib2R5O1xuICAgIHRoaXMuZGlzcGxheV9ib2R5ID0gZGlzcGxheV9ib2R5O1xuICAgIHRoaXMubW92ZWFibGUgPSBtb3ZlYWJsZTtcblxuICAgIGlmKGNvbGxpc2lvbl9ib2R5LnNoYXBlID09IEdlb21ldHJ5LkFBQkIpe1xuICAgICAgdGhpcy54ID0gY29sbGlzaW9uX2JvZHkubWluLng7XG4gICAgICB0aGlzLnkgPSBjb2xsaXNpb25fYm9keS5taW4ueTtcbiAgICB9ZWxzZSBpZihjb2xsaXNpb25fYm9keS5zaGFwZSA9PSBHZW9tZXRyeS5DSVJDTEUpe1xuICAgICAgdGhpcy54ID0gY29sbGlzaW9uX2JvZHkuY2VudGVyLng7XG4gICAgICB0aGlzLnkgPSBjb2xsaXNpb25fYm9keS5jZW50ZXIueTtcbiAgICB9XG4gIH1cblxuICBnZXRfcG9zaXRpb24oKXtcbiAgICByZXR1cm4geyd4Jzp0aGlzLngsICd5Jzp0aGlzLnl9O1xuICB9XG5cbiAgc2V0X3Bvc2l0aW9uKHgsIHkpe1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICBpZih0aGlzLmNvbGxpc2lvbl9ib2R5LnNoYXBlID09IEdlb21ldHJ5LkFBQkIpe1xuICAgICAgdGhpcy5jb2xsaXNpb25fYm9keS5taW5feCA9IHg7XG4gICAgICB0aGlzLmNvbGxpc2lvbl9ib2R5Lm1pbl95ID0geTtcbiAgICAgIHRoaXMuY29sbGlzaW9uX2JvZHkubWF4X3ggPSB4ICsgdGhpcy5jb2xsaXNpb25fYm9keS53aWR0aDtcbiAgICAgIHRoaXMuY29sbGlzaW9uX2JvZHkubWF4X3kgPSB5ICsgdGhpcy5jb2xsaXNpb25fYm9keS5oZWlnaHQ7XG4gICAgfWVsc2UgaWYodGhpcy5jb2xsaXNpb25fYm9keS5zaGFwZSA9PSBHZW9tZXRyeS5MSU5FKXtcbiAgICAgIGlmKHRoaXMuY29sbGlzaW9uX2JvZHkucGFyYWxsZWxfdG8gPT0gJ3gnKXtcbiAgICAgICAgdGhpcy5jb2xsaXNpb25fYm9keS5wb3MgPSB5O1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuY29sbGlzaW9uX2JvZHkucG9zID0geDtcbiAgICAgIH1cbiAgICB9ZWxzZSBpZih0aGlzLmNvbGxpc2lvbl9ib2R5LnNoYXBlID09IEdlb21ldHJ5LkNJUkNMRSl7XG4gICAgICB0aGlzLmNvbGxpc2lvbl9ib2R5LmNlbnRlci54ID0gdGhpcy54O1xuICAgICAgdGhpcy5jb2xsaXNpb25fYm9keS5jZW50ZXIueSA9IHRoaXMueTtcbiAgICB9XG4gIH1cblxuICBzZXRfdmVsb2NpdHkodl94LCB2X3kpe1xuICAgIHRoaXMudl94ID0gdl94O1xuICAgIHRoaXMudl95ID0gdl95O1xuICB9XG5cbiAgc2V0X2FjY2VsZXJhdGlvbihhX3gsIGFfeSl7XG4gICAgdGhpcy5hX3ggPSBhX3g7XG4gICAgdGhpcy5hX3kgPSBhX3k7XG4gIH1cblxuICBzZXRfaW50ZXJzZWN0aW9uKG9iail7XG4gICAgdGhpcy5pbnRlcnNlY3Rfd2l0aCA9IG9iajtcbiAgfVxuICAvLyBhYWJiIHNob3VsZCBoYXZlOlxuICAvLyBtaW46IHt4OiA8PiwgeTo8Pn1cbiAgLy8gbWF4OiB7eDogPD4sIHk6PD59XG5cbiAgLy8gY2lyY2xlIHNob3VsZCBoYXZlOlxuICAvLyBjZW50ZXI6IHt4OiA8PiwgeTo8Pn1cbiAgLy8gcjogPD5cblxuICAvLyBsaW5lcyBhcmUgaW5maW5pdGUgbGluZSwgYW5kIHNob3VsZCBoYXZlOlxuICAvLyBwYXJhbGxlbF90bzogWyd4J3wneSddXG4gIC8vIHBvczogPD5cblxuXG59XG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPYmplY3Q7XG4iLCJjb25zdCBMSU5FID0gMTtcbmNvbnN0IEFBQkIgPSAyO1xuY29uc3QgQ0lSQ0xFID0gMztcblxuY2xhc3MgR2VvbWV0cnl7XG4gIGNvbnN0cnVjdG9yKHNoYXBlKXtcbiAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBHZW9tZXRyeTtcbm1vZHVsZS5leHBvcnRzLkxJTkUgPSBMSU5FO1xubW9kdWxlLmV4cG9ydHMuQUFCQiA9IEFBQkI7XG5tb2R1bGUuZXhwb3J0cy5DSVJDTEUgPSBDSVJDTEU7XG4iLCJ2YXIgR2VvbWV0cnkgPSByZXF1aXJlKCcuL0dlb21ldHJ5LmpzJyk7XG52YXIgVmVjdG9yID0gcmVxdWlyZSgnLi9WZWN0b3IuanMnKTtcblxuY29uc3QgQ09OVEFDVF9DSVJDTEVfMl9QT0lOVCA9IDE7XG5jb25zdCBDT05UQUNUX0NJUkNMRV8yX0FCX0xJTkUgPSAyO1xuXG5jbGFzcyBJbXBsdXNlUmVzb2x2ZXJ7XG4gIHJlc29sdmUob2JqMSwgb2JqMiwgY29udGFjdCl7XG4gICAgbGV0IGNvbGxpc2lvbl90eXBlID0gb2JqMS5jb2xsaXNpb25fYm9keS5zaGFwZSArICc6JyArIG9iajIuY29sbGlzaW9uX2JvZHkuc2hhcGU7XG4gICAgc3dpdGNoKGNvbGxpc2lvbl90eXBlKXtcbiAgICAgIGNhc2UgR2VvbWV0cnkuQUFCQiArICc6JyArIEdlb21ldHJ5LkFBQkI6XG4gICAgICAgIGNvbnNvbGUubG9nKCdhYWJiIDIgYWFiYiBpbXBsdXNlIHJlc29sdXRpb24gbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgR2VvbWV0cnkuQ0lSQ0xFICsgJzonICsgR2VvbWV0cnkuQ0lSQ0xFOlxuICAgICAgICBjb25zb2xlLmxvZygnY2lyY2xlIDIgY2lyY2xlIGltcGx1c2UgcmVzb2x1dGlvbiBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5BQUJCICsgJzonICsgR2VvbWV0cnkuQ0lSQ0xFOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9hYWJiX3Jlc29sdXRpb24ob2JqMiwgb2JqMSwgY29udGFjdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5DSVJDTEUgKyAnOicgKyBHZW9tZXRyeS5BQUJCOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9hYWJiX3Jlc29sdXRpb24ob2JqMSwgb2JqMiwgY29udGFjdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5DSVJDTEUgKyAnOicgKyBHZW9tZXRyeS5MSU5FOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9saW5lX3Jlc29sdXRpb24ob2JqMSwgb2JqMik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5MSU5FICsgJzonICsgR2VvbWV0cnkuQ0lSQ0xFOlxuICAgICAgICByZXR1cm4gdGhpcy5jaXJjbGVfMl9saW5lX3Jlc29sdXRpb24ob2JqMiwgb2JqMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5BQUJCICsgJzonICsgR2VvbWV0cnkuTElORTpcbiAgICAgICAgY29uc29sZS5sb2coJ2FhYmIgMiBsaW5lIGltcGx1c2UgcmVzb2x1dGlvbiBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBHZW9tZXRyeS5MSU5FKyAnOicgKyBHZW9tZXRyeS5BQUJCOlxuICAgICAgICBjb25zb2xlLmxvZygnbGluZSAyIGFhYmIgaW1wbHVzZSByZXNvbHV0aW9uIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgY2lyY2xlXzJfYWFiYl9yZXNvbHV0aW9uKGMsIGFiLCBjb250YWN0KXtcbiAgICBpZihjLmludGVyc2VjdF93aXRoICE9PSBhYiB8fCBhYi5pbnRlcnNlY3Rfd2l0aCAhPSBjKXtcbiAgICAgIGlmKGNvbnRhY3RbJ2NvbnRhY3RfdHlwZSddID09IENPTlRBQ1RfQ0lSQ0xFXzJfUE9JTlQpe1xuICAgICAgICB0aGlzLl9jaXJjbGVfMl9wb2ludF9yZXNvbHV0aW9uKGMsIGNvbnRhY3RbJ2NvbnRhY3QnXVsncG9pbnQnXSk7XG4gICAgICB9ZWxzZSBpZihjb250YWN0Wydjb250YWN0X3R5cGUnXSA9PSBDT05UQUNUX0NJUkNMRV8yX0FCX0xJTkUpe1xuICAgICAgICB0aGlzLl9jaXJjbGVfMl9hYl9saW5lX3Jlc29sdXRpb24oYywgY29udGFjdFsnY29udGFjdCddWydhbGlnbmVkX2F4aXMnXSk7XG4gICAgICB9XG4gICAgICBjLnNldF9pbnRlcnNlY3Rpb24oYWIpO1xuICAgICAgYWIuc2V0X2ludGVyc2VjdGlvbihjKTtcbiAgICB9XG4gIH1cblxuICBfY2lyY2xlXzJfYWJfbGluZV9yZXNvbHV0aW9uKGMsIGFsaWduZWRfYXhpcyl7XG4gICAgc3dpdGNoKGFsaWduZWRfYXhpcyl7XG4gICAgICBjYXNlICd4JzpcbiAgICAgICAgYy52X3kgKj0gLTE7XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICd5JzpcbiAgICAgICAgYy52X3ggKj0gLTE7XG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgX2NpcmNsZV8yX3BvaW50X3Jlc29sdXRpb24oYywgY29udGFjdF9wb2ludCl7XG4gICAgbGV0IGNpcmNsZV9jZW50ZXIgPSBjLmNvbGxpc2lvbl9ib2R5LmNlbnRlcjtcbiAgICBsZXQgY29udGFjdF92ZWN0b3IgPSBuZXcgVmVjdG9yKFxuICAgICAgY29udGFjdF9wb2ludC54IC0gY2lyY2xlX2NlbnRlci54LFxuICAgICAgY29udGFjdF9wb2ludC55IC0gY2lyY2xlX2NlbnRlci55KTtcbiAgICBsZXQgcGVycF9jb250YWN0X3ZlY3RvciA9IGNvbnRhY3RfdmVjdG9yLnJvdGF0ZV9jbG9ja3dpc2VfOTAoKTtcbiAgICBsZXQgdmVsb2NpdHlfdmVjdG9yID0gbmV3IFZlY3RvcihjLnZfeCwgYy52X3kpO1xuXG4gICAgLy8gbGV0IHRoZXRhIGJlIHRoZSBhbmdsZSBiZXR3ZWVuIHZlbG9jaXR5X3ZlY3RvciBhbmQgcGVycF9jb250YWN0X3ZlY3RvclxuICAgIC8vIGNvcyh0aGV0YSkgPSBWMSAuIFYyIC8gKHxWMXwgKiB8VjJ8KVxuICAgIGxldCBjb3NfdGhldGEgPSAocGVycF9jb250YWN0X3ZlY3Rvci5kb3RfcHJvZHVjdCh2ZWxvY2l0eV92ZWN0b3IpKVxuICAgICAgLyhwZXJwX2NvbnRhY3RfdmVjdG9yLm1hZ25pdHVkZSgpICogdmVsb2NpdHlfdmVjdG9yLm1hZ25pdHVkZSgpKTtcblxuICAgIGxldCBzaW5fdGhldGEgPSBNYXRoLnNxcnQoMSAtIGNvc190aGV0YSAqIGNvc190aGV0YSk7XG5cbiAgICAvLyBVc2UgdmVjdG9yIHJvdGF0aW9uIG1hdHJpeDpcbiAgICAvL3xjb3MoMip0aGV0YSksIC1zaW4oMip0aGV0YSl8XG4gICAgLy98c2luKDIqdGhldGEpLCAgY29zKDIqdGhldGEpfFxuICAgIC8vIHRvIG11bHRpcGx5IHZlbG9jaXR5X3ZlY3RvciB0byBnZXQgdGhlIHZlbG9jaXR5IGFmdGVyIGNvbnRhY3RcbiAgICAvLyBub3RlOlxuICAgIC8vIGNvcygyKnRoZXRhKSA9IGNvc190aGV0YSpjb3NfdGhldGEgLSBzaW5fdGhldGEqc2luX3RoZXRhXG4gICAgLy8gc2luKDIqdGhldGEpID0gMipzaW4odGhldGEpKmNvcyh0aGV0YSlcbiAgICBsZXQgbWlkZGxlX3Jlc3VsdDEgPSAoY29zX3RoZXRhKmNvc190aGV0YSAtIHNpbl90aGV0YSpzaW5fdGhldGEpO1xuICAgIGxldCBtaWRkbGVfcmVzdWx0MiA9IDIgKiBjb3NfdGhldGEgKiBzaW5fdGhldGE7XG4gICAgbGV0IHZlbG9jaXR5X2FmdGVyX2NvbnRhY3QgPSBuZXcgVmVjdG9yKFxuICAgICAgbWlkZGxlX3Jlc3VsdDEgKiB2ZWxvY2l0eV92ZWN0b3IueCAtIG1pZGRsZV9yZXN1bHQyICogdmVsb2NpdHlfdmVjdG9yLnksXG4gICAgICBtaWRkbGVfcmVzdWx0MiAqIHZlbG9jaXR5X3ZlY3Rvci54ICsgbWlkZGxlX3Jlc3VsdDEgKiB2ZWxvY2l0eV92ZWN0b3IueVxuICAgIClcblxuICAgIGMudl94ID0gdmVsb2NpdHlfYWZ0ZXJfY29udGFjdC54O1xuICAgIGMudl95ID0gdmVsb2NpdHlfYWZ0ZXJfY29udGFjdC55O1xuICB9XG5cbiAgY2lyY2xlXzJfbGluZV9yZXNvbHV0aW9uKGMsIGwpe1xuICAgIGlmKGMuaW50ZXJzZWN0X3dpdGggIT09IGwgfHwgbC5pbnRlcnNlY3Rfd2l0aCAhPSBjKXtcbiAgICAgIHRoaXMuX2NpcmNsZV8yX2FiX2xpbmVfcmVzb2x1dGlvbihjLCBsLmNvbGxpc2lvbl9ib2R5LnBhcmFsbGVsX3RvKTtcbiAgICAgIGMuc2V0X2ludGVyc2VjdGlvbihsKTtcbiAgICAgIGwuc2V0X2ludGVyc2VjdGlvbihjKTtcbiAgICB9XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gSW1wbHVzZVJlc29sdmVyO1xubW9kdWxlLmV4cG9ydHMuQ09OVEFDVF9DSVJDTEVfMl9QT0lOVCAgPSBDT05UQUNUX0NJUkNMRV8yX1BPSU5UO1xubW9kdWxlLmV4cG9ydHMuQ09OVEFDVF9DSVJDTEVfMl9BQl9MSU5FID0gQ09OVEFDVF9DSVJDTEVfMl9BQl9MSU5FO1xuIiwidmFyIEdlb21ldHJ5ID0gcmVxdWlyZSgnLi9HZW9tZXRyeS5qcycpO1xudmFyIENvbGxpc2lvbkRldGVjdG9yID0gcmVxdWlyZSgnLi9Db2xsaXNpb25EZXRlY3Rvci5qcycpO1xuXG5jbGFzcyBMaW5lIGV4dGVuZHMgR2VvbWV0cnl7XG4gIGNvbnN0cnVjdG9yKHBhcmFsbGVsX3RvLCBwb3Mpe1xuICAgIHN1cGVyKEdlb21ldHJ5LkxJTkUpO1xuICAgIHRoaXMuYm9keV90eXBlID0gQ29sbGlzaW9uRGV0ZWN0b3IuQ19CT0RZX0xJTkU7XG4gICAgdGhpcy5wYXJhbGxlbF90byA9IHBhcmFsbGVsX3RvO1xuICAgIHRoaXMucG9zID0gcG9zO1xuICB9XG4gIHJlbmRlcihjdHgpe1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBzd2l0Y2godGhpcy5wYXJhbGxlbF90byl7XG4gICAgICBjYXNlICd4JzpcbiAgICAgICAgY3R4Lm1vdmVUbygwLCB0aGlzLnBvcyk7XG4gICAgICAgIGN0eC5saW5lVG8oMTAwMDAsIHRoaXMucG9zKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd5JzpcbiAgICAgICAgY3R4Lm1vdmVUbyh0aGlzLnBvcywgMCk7XG4gICAgICAgIGN0eC5saW5lVG8odGhpcy5wb3MsIDEwMDAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gTGluZTtcbiIsImNsYXNzIFZlY3RvcntcbiAgY29uc3RydWN0b3IoeCwgeSl7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICB9XG5cbiAgY2xvbmUoKXtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLngsIHRoaXMueSk7XG4gIH1cblxuICByb3RhdGVfY2xvY2t3aXNlXzkwKCl7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IoLSB0aGlzLnksIHRoaXMueCk7XG4gIH1cblxuICBtYWduaXR1ZGUoKXtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMueCp0aGlzLnggKyB0aGlzLnkqdGhpcy55KTtcbiAgfVxuXG4gIGRvdF9wcm9kdWN0KHYpe1xuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2Lnk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBWZWN0b3I7XG4iLCJ2YXIgQ29sbGlzaW9uRGV0ZWN0b3IgPSByZXF1aXJlKCcuL0NvbGxpc2lvbkRldGVjdG9yLmpzJyk7XG52YXIgQ2lyY2xlID0gcmVxdWlyZSgnLi9DaXJjbGUuanMnKTtcbnZhciBBQUJCID0gcmVxdWlyZSgnLi9BQUJCLmpzJyk7XG52YXIgTGluZSA9IHJlcXVpcmUoJy4vTGluZS5qcycpO1xudmFyIEdhbWVPYmplY3QgPSByZXF1aXJlKCcuL0dhbWVPYmplY3QuanMnKTtcbnZhciBJbXBsdXNlUmVzb2x2ZXIgPSByZXF1aXJlKCcuL0ltcGx1c2VSZXNvbHZlci5qcycpO1xuXG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lX2ZpZWxkXCIpO1xudmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBrZXlEb3duSGFuZGxlciwgZmFsc2UpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGtleVVwSGFuZGxlciwgZmFsc2UpO1xuLy9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwga2V5UHJlc3NIYW5kbGVyLCBmYWxzZSk7XG5cbmdhbWVfbGVuZ3RoID0gMTAwMDtcbmN1cnJlbnRfZ2FtZV90aWNrID0gMDtcbnN0YXRlX2hpc3RvcnkgPSB7fTtcbmVuZGluZ190aWNrID0gMDtcblxuZ2FtZV9zdGFydGVkID0gZmFsc2U7XG5wYXVzZWQgPSBmYWxzZTtcbnBhdXNlX3N0YXJ0X2F0ID0gMDtcbnRvdGFsX3BhdXNlZCA9IDA7XG5nYW1lX2VuZGVkID0gZmFsc2U7XG5nYW1lX2VuZF93aXRoX3N0YXR1cyA9ICcnO1xuXG5HQU1FX1dPTl9TVEFUVVMgPSAnd2luJztcbkdBTUVfTE9TVF9TVEFUVVMgPSAnbG9zdCc7XG5JTl9HQU1FX1NUQVRVUyA9ICdpbl9nYW1lJztcblxudmFyIGZyaWN0aW9uID0gMC4wMDE7XG52YXIgYWNjZWxlcmF0aW9uID0gMC4wMztcbnZhciBmdWVsX2VmZmljaWVuY3kgPSA1O1xuXG5cbnZhciBzdGF0ZV8yID0ge1xuICAncGxheWVyJzogcGxheWVyLFxuICAndGFyZ2V0JzogdGFyZ2V0LFxuICAncGxheWVyX2Z1dHVyZSc6IHBsYXllcl9mdXR1cmVcbn1cblxudmFyIHN0YXRlID0ge1xuICAncG9zX3gnOiAxMCxcbiAgJ3Bvc195JzogMjAwLFxuICAndF9wb3NfeCc6IDQwMCxcbiAgJ3RfcG9zX3knOiA4MCxcbiAgJ2ZfcG9zX3gnOiAwLFxuICAnZl9wb3NfeSc6IDAsXG4gICdyYWRpdXMnOiA1LFxuICAnd2luX2Rpc3QnOiAxNSxcbiAgJ3ZfeCc6IDEsXG4gICd2X3knOiAxLFxuICAnYV94JzogMCxcbiAgJ2FfeSc6IDAsXG4gICdmaWVsZF93aWR0aCc6IGNhbnZhcy53aWR0aCxcbiAgJ2ZpZWxkX2hlaWdodCc6IGNhbnZhcy5oZWlnaHQsXG4gICdmaWVsZF90b3BfbGVmdF94JzogMCxcbiAgJ2ZpZWxkX3RvcF9sZWZ0X3knOiA1MCxcbn1cblxudmFyIHRpbWVfYmFyX3dpZHRoID0gMTAwO1xudmFyIHRpbWVfYmFyID0ge1xuICAnd2lkdGgnOiB0aW1lX2Jhcl93aWR0aCxcbiAgJ2hlaWdodCc6IDMwLFxuICAncG9zX3gnOiBjYW52YXMud2lkdGggLSAxMCAtIHRpbWVfYmFyX3dpZHRoLFxuICAncG9zX3knOiAxMCxcbiAgJ2ZpbGwnOiB0aW1lX2Jhcl93aWR0aFxufVxuXG52YXIgZnVlbF9iYXJfd2lkdGggPSAxMDA7XG52YXIgZnVlbF9iYXIgPSB7XG4gICd3aWR0aCc6IGZ1ZWxfYmFyX3dpZHRoLFxuICAnaGVpZ2h0JzogMzAsXG4gICdwb3NfeCc6IGNhbnZhcy53aWR0aCAtIDEwIC0gdGltZV9iYXJfd2lkdGggLSBmdWVsX2Jhcl93aWR0aCAtIDEwLFxuICAncG9zX3knOiAxMCxcbiAgJ2ZpbGwnOiBmdWVsX2Jhcl93aWR0aFxufVxuXG5mdW5jdGlvbiB1cGRhdGVfdGltZV9iYXIoKXtcbiAgdGltZV9iYXJbJ2ZpbGwnXSA9IHRpbWVfYmFyX3dpZHRoIC0gKGN1cnJlbnRfZ2FtZV90aWNrICogdGltZV9iYXJfd2lkdGggLyBnYW1lX2xlbmd0aCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcl9mdWVsX2JhcihjdHgsIGZ1ZWxfYmFyKXtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICBjdHgucmVjdChmdWVsX2JhclsncG9zX3gnXSwgZnVlbF9iYXJbJ3Bvc195J10sIGZ1ZWxfYmFyWyd3aWR0aCddLCBmdWVsX2JhclsnaGVpZ2h0J10pO1xuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5maWxsU3R5bGUgPSAncmVkJztcbiAgY3R4LnJlY3QoZnVlbF9iYXJbJ3Bvc194J10gKyAxLCBmdWVsX2JhclsncG9zX3knXSArIDEsIGZ1ZWxfYmFyWydmaWxsJ10gLSAyLCBmdWVsX2JhclsnaGVpZ2h0J10gLSAyKTtcbiAgY3R4LmZpbGwoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJfdGltZV9iYXIoY3R4LCB0aW1lX2Jhcil7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgY3R4LnJlY3QodGltZV9iYXJbJ3Bvc194J10sIHRpbWVfYmFyWydwb3NfeSddLCB0aW1lX2Jhclsnd2lkdGgnXSwgdGltZV9iYXJbJ2hlaWdodCddKTtcbiAgY3R4LnN0cm9rZSgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguZmlsbFN0eWxlID0gJ2dyZXknO1xuICBjdHgucmVjdCh0aW1lX2JhclsncG9zX3gnXSArIDEsIHRpbWVfYmFyWydwb3NfeSddICsgMSwgdGltZV9iYXJbJ2ZpbGwnXSAtIDIsIHRpbWVfYmFyWydoZWlnaHQnXSAtIDIpO1xuICBjdHguZmlsbCgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcl9nYW1lX2VuZChjdHgsIHN0YXR1cyl7XG4gIHZhciBlbmRpbmdfdGV4dCA9ICdZb3UgV2luISc7XG4gIGlmKHN0YXR1cyA9PSBHQU1FX0xPU1RfU1RBVFVTKXtcbiAgICBlbmRpbmdfdGV4dCA9ICdZb3UgbG9zdCEnO1xuICB9XG4gIGN0eC5mb250ID0gXCIzMHB4IEFyaWFsXCI7XG4gIGN0eC5maWxsVGV4dChlbmRpbmdfdGV4dCwgY2FudmFzLndpZHRoIC8gMiwgY2FudmFzLmhlaWdodCAvIDIpO1xufVxuXG5cblxudmFyIG1vdmVzID0ge1xuICBcIkFycm93RG93blwiOiBmYWxzZSxcbiAgXCJBcnJvd1VwXCI6IGZhbHNlLFxuICBcIkFycm93TGVmdFwiOiBmYWxzZSxcbiAgXCJBcnJvd1JpZ2h0XCI6IGZhbHNlXG59XG5cbmZ1bmN0aW9uIGtleURvd25IYW5kbGVyKGUpe1xuICBpZihlLmNvZGUgaW4gbW92ZXMpe1xuICAgIG1vdmVzW2UuY29kZV0gPSB0cnVlO1xuICAgIGlmKGZ1ZWxfYmFyWydmaWxsJ10gPj0gZnVlbF9lZmZpY2llbmN5KXtcbiAgICAgIHN3aXRjaChlLmNvZGUpe1xuICAgICAgICBjYXNlIFwiQXJyb3dVcFwiOlxuICAgICAgICAgIHN0YXRlWydhX3knXSAtPSBhY2NlbGVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJBcnJvd0Rvd25cIjpcbiAgICAgICAgICBzdGF0ZVsnYV95J10gKz0gYWNjZWxlcmF0aW9uO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiQXJyb3dMZWZ0XCI6XG4gICAgICAgICAgc3RhdGVbJ2FfeCddIC09IGFjY2VsZXJhdGlvbjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIkFycm93UmlnaHRcIjpcbiAgICAgICAgICBzdGF0ZVsnYV94J10gKz0gYWNjZWxlcmF0aW9uO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZnVlbF9iYXJbJ2ZpbGwnXSAtPSBmdWVsX2VmZmljaWVuY3k7XG4gICAgfWVsc2V7XG4gICAgICBmdWVsX2JhclsnZmlsbCddID0gMDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24ga2V5VXBIYW5kbGVyKGUpe1xuICBpZihlLmNvZGUgaW4gbW92ZXMpe1xuICAgIG1vdmVzW2UuY29kZV0gPSBmYWxzZTtcbiAgICBzd2l0Y2goZS5jb2RlKXtcbiAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgIHN0YXRlWydhX3knXSA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICBzdGF0ZVsnYV95J10gPSAwO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJBcnJvd0xlZnRcIjpcbiAgICAgICAgc3RhdGVbJ2FfeCddID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dSaWdodFwiOlxuICAgICAgICBzdGF0ZVsnYV94J10gPSAwO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgc3RhdGVfcHJlZGljdGlvbigpO1xuICB9XG59XG5cbnZhciBtaW5fdmVsb2NpdHkgPSAwLjAwMztcbmZ1bmN0aW9uIGNoZWNrX3N0b3BwZWQoc3RhdGUpe1xuICByZXR1cm4gTWF0aC5hYnMoc3RhdGVbJ3ZfeCddKSA8PSBtaW5fdmVsb2NpdHkgJiYgTWF0aC5hYnMoc3RhdGVbJ3ZfeSddKSA8PSBtaW5fdmVsb2NpdHk7XG59XG5cbmZ1bmN0aW9uIHN0YXRlX3ByZWRpY3Rpb24oKXtcbiAgdmFyIHN0YXRlX2NvcHkgPSByb290X2Nsb25lKHN0YXRlKTtcbiAgc3RhdGVfaGlzdG9yeVtjdXJyZW50X2dhbWVfdGlja10gPSBzdGF0ZTtcbiAgdmFyIGkgPSBjdXJyZW50X2dhbWVfdGljaztcbiAgd2hpbGUoKE1hdGguYWJzKHN0YXRlX2NvcHlbJ3ZfeCddKSA+IDAuMDAzIHx8IE1hdGguYWJzKHN0YXRlX2NvcHlbJ3ZfeSddKSA+IDAuMDAzKSAmJiBpIDwgZ2FtZV9sZW5ndGgpe1xuICAgIHN0YXRlX2NvcHkgPSBwaHlzaWNzX2VuZ2luZV9zdGVwKHN0YXRlX2NvcHksIHVuZGVmaW5lZCk7XG4gICAgc3RhdGVfaGlzdG9yeVtpXSA9IHN0YXRlX2NvcHk7XG4gICAgaSsrO1xuICB9XG4gIGVuZGluZ190aWNrID0gaSAtIDE7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcmVyKHN0YXRlKXtcbiAgY3R4LnNhdmUoKTtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gIHJlbmRlcl90aW1lX2JhcihjdHgsIHRpbWVfYmFyKTtcbiAgcmVuZGVyX2Z1ZWxfYmFyKGN0eCwgZnVlbF9iYXIpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgY3R4LnJlY3Qoc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3gnXSwgc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3knXSwgc3RhdGVbJ2ZpZWxkX3dpZHRoJ10sIHN0YXRlWydmaWVsZF9oZWlnaHQnXSAtIHN0YXRlWydmaWVsZF90b3BfbGVmdF95J10pO1xuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gIGN0eC5yZWN0KDEwMCwgMTAwLCAzMCwgMzApO1xuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICBjdHguYXJjKHN0YXRlWydwb3NfeCddLCBzdGF0ZVsncG9zX3knXSwgc3RhdGVbJ3JhZGl1cyddLCAwLCAyKk1hdGguUEkpO1xuICBjdHguZmlsbCgpO1xuICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICBjdHguc2V0TGluZURhc2goWzJdKTtcbiAgY3R4LmFyYyhzdGF0ZVsnZl9wb3NfeCddLCBzdGF0ZVsnZl9wb3NfeSddLCBzdGF0ZVsncmFkaXVzJ10sIDAsIDIqTWF0aC5QSSk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LnNldExpbmVEYXNoKFtdKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ3JlZCc7XG4gIGN0eC5hcmMoc3RhdGVbJ3RfcG9zX3gnXSwgc3RhdGVbJ3RfcG9zX3knXSwgc3RhdGVbJ3JhZGl1cyddKjIsIDAsIDIqTWF0aC5QSSk7XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gIGlmKGdhbWVfZW5kZWQpe1xuICAgIHJlbmRlcl9nYW1lX2VuZChjdHgsIGdhbWVfZW5kX3dpdGhfc3RhdHVzKTtcbiAgfVxuICBjdHgucmVzdG9yZSgpO1xufVxuXG5mdW5jdGlvbiBjaGVja19nYW1lX2VuZChzdGF0ZSl7XG4gIHZhciBkaXN0X3RvX2dvYWwgPSBNYXRoLnNxcnQoTWF0aC5wb3coc3RhdGVbJ3Bvc194J10gLSBzdGF0ZVsndF9wb3NfeCddLCAyKSArIE1hdGgucG93KHN0YXRlWydwb3NfeSddIC0gc3RhdGVbJ3RfcG9zX3knXSwgMikpO1xuICBpZihjdXJyZW50X2dhbWVfdGljayA+PSBnYW1lX2xlbmd0aCl7XG4gICAgaWYoZGlzdF90b19nb2FsID4gc3RhdGVbJ3dpbl9kaXN0J10pe1xuICAgICAgcmV0dXJuIEdBTUVfTE9TVF9TVEFUVVM7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gR0FNRV9XT05fU1RBVFVTO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgaWYoY2hlY2tfc3RvcHBlZChzdGF0ZSkgICYmIGRpc3RfdG9fZ29hbCA8PSBzdGF0ZVsnd2luX2Rpc3QnXSl7XG4gICAgICByZXR1cm4gR0FNRV9XT05fU1RBVFVTO1xuICAgIH1lbHNlIGlmKGNoZWNrX3N0b3BwZWQoc3RhdGUpICYmIGZ1ZWxfYmFyWydmaWxsJ10gPCBmdWVsX2VmZmljaWVuY3kpe1xuICAgICAgcmV0dXJuIEdBTUVfTE9TVF9TVEFUVVM7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gSU5fR0FNRV9TVEFUVVM7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1haW5Mb29wKCl7XG4gIGlmKCFnYW1lX3N0YXJ0ZWQpe1xuICAgIGdhbWVfc3RhcnRlZCA9IHRydWU7XG4gICAgc3RhdGVfcHJlZGljdGlvbigpO1xuICB9XG4gIHZhciBnYW1lX2VuZF9zdGF0dXMgPSBjaGVja19nYW1lX2VuZChzdGF0ZSk7XG4gIGlmKGdhbWVfZW5kX3N0YXR1cyA9PSBJTl9HQU1FX1NUQVRVUyl7XG4gICAgaWYoY3VycmVudF9nYW1lX3RpY2sgPCBnYW1lX2xlbmd0aCl7XG4gICAgICBzdGF0ZVsnZl9wb3NfeCddID0gc3RhdGVfaGlzdG9yeVtlbmRpbmdfdGlja11bJ3Bvc194J107XG4gICAgICBzdGF0ZVsnZl9wb3NfeSddID0gc3RhdGVfaGlzdG9yeVtlbmRpbmdfdGlja11bJ3Bvc195J107XG4gICAgICBzdGF0ZSA9IHBoeXNpY3NfZW5naW5lX3N0ZXAoc3RhdGUsIHVuZGVmaW5lZCk7XG4gICAgICByZW5kZXJlcihzdGF0ZSk7XG4gICAgICBjdXJyZW50X2dhbWVfdGljayArPSAxO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgZ2FtZV9lbmRlZCA9IHRydWU7XG4gICAgZ2FtZV9lbmRfd2l0aF9zdGF0dXMgPSBnYW1lX2VuZF9zdGF0dXM7XG4gICAgcmVuZGVyZXIoc3RhdGUpO1xuICAgIC8vY29uc29sZS5sb2coc3RhdGUpO1xuICAgIC8vdmFyIGRpc3RfdG9fZ29hbCA9IE1hdGguc3FydChNYXRoLnBvdyhzdGF0ZVsncG9zX3gnXSAtIHN0YXRlWyd0X3Bvc194J10sMikgKyBNYXRoLnBvdyhzdGF0ZVsncG9zX3knXSAtIHN0YXRlWyd0X3Bvc195J10sMikpO1xuICAgIC8vY29uc29sZS5sb2coZGlzdF90b19nb2FsKTtcbiAgfVxufVxuXG52YXIgZGV0ZWN0b3IgPSBuZXcgQ29sbGlzaW9uRGV0ZWN0b3IoKTtcbnZhciByZXNvbHZlciA9IG5ldyBJbXBsdXNlUmVzb2x2ZXIoKTtcblxuZnVuY3Rpb24gcGh5c2ljc19lbmdpbmVfc3RlcF9uZXcoZ2FtZV9vYmplY3RzKXtcbiAgZ2FtZV9vYmplY3RzLmZpbHRlcihvYmogPT4gb2JqLm1vdmVhYmxlKS5mb3JFYWNoKGZ1bmN0aW9uKG9iail7XG4gICAgbGV0IHBvcyA9IG9iai5nZXRfcG9zaXRpb24oKTtcbiAgICBvYmouc2V0X3Bvc2l0aW9uKHBvcy54ICsgb2JqLnZfeCwgcG9zLnkgKyBvYmoudl95KTtcbiAgICBvYmoudl94ICs9IG9iai5hX3g7XG4gICAgb2JqLnZfeSArPSBvYmouYV95O1xuICB9KTtcblxuICB2YXIgY29sbGlzaW9uX3BhaXJzID0gW107XG4gIGZvcih2YXIgaSA9IDAgOyBpIDwgZ2FtZV9vYmplY3RzLmxlbmd0aCA7IGkgKyspe1xuICAgIGZvcih2YXIgaiA9IDEgOyBqIDwgZ2FtZV9vYmplY3RzLmxlbmd0aCA7IGogKyspe1xuICAgICAgdmFyIGNvbnRhY3QgPSBkZXRlY3Rvci5jYW5fY29sbGlkZShnYW1lX29iamVjdHNbaV0sIGdhbWVfb2JqZWN0c1tqXSk7XG4gICAgICBpZihpICE9IGogJiYgY29udGFjdCAhPSAwICl7XG4gICAgICAgIGNvbGxpc2lvbl9wYWlycy5wdXNoKFtnYW1lX29iamVjdHNbaV0sIGdhbWVfb2JqZWN0c1tqXSwgY29udGFjdF0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvL2lmKGNvbGxpc2lvbl9wYWlycy5sZW5ndGggPiAwKXtcbiAgICAvL2NvbnNvbGUubG9nKGNvbGxpc2lvbl9wYWlycyk7XG4gIC8vfVxuXG4gIGNvbGxpc2lvbl9wYWlycy5mb3JFYWNoKGZ1bmN0aW9uKGNfcGFpcil7XG4gICAgcmVzb2x2ZXIucmVzb2x2ZShjX3BhaXJbMF0sIGNfcGFpclsxXSwgY19wYWlyWzJdKTtcbiAgfSk7XG59XG5cbnZhciBwbGF5ZXJfYm9keSA9IG5ldyBDaXJjbGUoMzAsIDMxLCAyMCk7XG52YXIgcGxheWVyID0gbmV3IEdhbWVPYmplY3QoQ29sbGlzaW9uRGV0ZWN0b3IuQ19HUk9VUDEsIHBsYXllcl9ib2R5LCBwbGF5ZXJfYm9keSwgdHJ1ZSk7XG5wbGF5ZXIuc2V0X3ZlbG9jaXR5KDYsIDYpO1xucGxheWVyLnNldF9hY2NlbGVyYXRpb24oMCwgMCk7XG5cbnZhciB0YXJnZXRfYm9keSA9IG5ldyBDaXJjbGUoNDAwLCA4MCwgcGxheWVyX2JvZHkuciAqIDIpO1xudmFyIHRhcmdldCA9IG5ldyBHYW1lT2JqZWN0KENvbGxpc2lvbkRldGVjdG9yLk5PX0NPTExJU0lPTiwgdGFyZ2V0X2JvZHksIHRhcmdldF9ib2R5LCBmYWxzZSk7XG5cbnZhciBwbGF5ZXJfZnV0dXJlX2JvZHkgPSBuZXcgQ2lyY2xlKDAsIDAsIHBsYXllcl9ib2R5LnIpO1xudmFyIHBsYXllcl9mdXR1cmUgPSBuZXcgR2FtZU9iamVjdChDb2xsaXNpb25EZXRlY3Rvci5OT19DT0xMSVNJT04sIHBsYXllcl9mdXR1cmVfYm9keSwgcGxheWVyX2Z1dHVyZV9ib2R5LCBmYWxzZSk7XG5cbnZhciBsZWZ0X2xpbmUgPSBuZXcgTGluZSgneScsIDApO1xudmFyIHJpZ2h0X2xpbmUgPSBuZXcgTGluZSgneScsIGNhbnZhcy53aWR0aCk7XG52YXIgdG9wX2xpbmUgPSBuZXcgTGluZSgneCcsIDApO1xudmFyIGJvdHRvbV9saW5lID0gbmV3IExpbmUoJ3gnLCBjYW52YXMuaGVpZ2h0KTtcbnZhciBsZWZ0ID0gbmV3IEdhbWVPYmplY3QoQ29sbGlzaW9uRGV0ZWN0b3IuQ19HUk9VUDEsIGxlZnRfbGluZSwgbGVmdF9saW5lLCBmYWxzZSk7XG52YXIgcmlnaHQgPSBuZXcgR2FtZU9iamVjdChDb2xsaXNpb25EZXRlY3Rvci5DX0dST1VQMSwgcmlnaHRfbGluZSwgcmlnaHRfbGluZSwgZmFsc2UpO1xudmFyIHRvcCA9IG5ldyBHYW1lT2JqZWN0KENvbGxpc2lvbkRldGVjdG9yLkNfR1JPVVAxLCB0b3BfbGluZSwgdG9wX2xpbmUsIGZhbHNlKTtcbnZhciBib3R0b20gPSBuZXcgR2FtZU9iamVjdChDb2xsaXNpb25EZXRlY3Rvci5DX0dST1VQMSwgYm90dG9tX2xpbmUsIGJvdHRvbV9saW5lLCBmYWxzZSk7XG5cbnZhciBibG9ja19hYWJiID0gbmV3IEFBQkIoMTAwLCAxMDAsIDMwMCwgMjAwKTtcbnZhciBibG9jayA9IG5ldyBHYW1lT2JqZWN0KENvbGxpc2lvbkRldGVjdG9yLkNfR1JPVVAxLCBibG9ja19hYWJiLCBibG9ja19hYWJiLCBmYWxzZSk7XG5cbmZ1bmN0aW9uIG1haW5Mb29wTmV3KCl7XG4gIGlmKCFnYW1lX3N0YXJ0ZWQpe1xuICAgIGdhbWVfc3RhcnRlZCA9IHRydWU7XG4gIH1cbiAgdmFyIGdhbWVfb2JqZWN0cyA9IFtcbiAgICBwbGF5ZXIsXG4gICAgdGFyZ2V0LFxuICAgIGxlZnQsXG4gICAgcmlnaHQsXG4gICAgdG9wLFxuICAgIGJvdHRvbSxcbiAgICBibG9ja1xuICBdO1xuXG4gIHBoeXNpY3NfZW5naW5lX3N0ZXBfbmV3KGdhbWVfb2JqZWN0cyk7XG4gIGNvbnNvbGUubG9nKCd2JyArIChwbGF5ZXIudl94ICogcGxheWVyLnZfeCArIHBsYXllci52X3kgKiBwbGF5ZXIudl95KSk7XG5cbiAgY3R4LnNhdmUoKTtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICBnYW1lX29iamVjdHMuZm9yRWFjaChmdW5jdGlvbihvYmope1xuICAgIG9iai5kaXNwbGF5X2JvZHkucmVuZGVyKGN0eCk7XG4gIH0pO1xuICBjdHgucmVzdG9yZSgpO1xufVxuXG5cbmZ1bmN0aW9uIHJvb3RfY2xvbmUob2JqKXtcbiAgdmFyIGNsb25lID0ge307XG4gIGZvcih2YXIga2V5IGluIG9iail7XG4gICAgY2xvbmVba2V5XSA9IG9ialtrZXldO1xuICB9XG4gIHJldHVybiBjbG9uZTtcbn1cblxubWluX3NwZWVkID0gMC4wMDM7XG4vKiBzdGF0ZTpcbnsndl94JzogMSxcbiAndl95JzogMSxcbiAnYV94JzogMC4xLFxuICdhX3knOiAwLjEsXG4gJ3Bvc194JzogMTAsXG4gJ3Bvc195JzogMTAsXG4gJ3JhZGl1cyc6IDUsXG4gJ2ZpZWxkX3dpZHRoJzogNjAwLFxuICdmaWVsZF9oZWlnaHQnOiA2MDAsXG4gJ251bV9vZl90aWNrcyc6IDYwMDBcbn1cbiovXG5mdW5jdGlvbiBwaHlzaWNzX2VuZ2luZV9zdGVwKHN0YXRlLCByZW5kZXJlcil7XG4gIHZhciBzdGF0ZV9jb3B5ID0gcm9vdF9jbG9uZShzdGF0ZSk7XG4gIHN0YXRlX2NvcHlbJ3Bvc194J10gKz0gc3RhdGVfY29weVsndl94J107XG4gIHN0YXRlX2NvcHlbJ3Bvc195J10gKz0gc3RhdGVfY29weVsndl95J107XG4gIHN0YXRlX2NvcHlbJ3ZfeCddICs9IHN0YXRlX2NvcHlbJ2FfeCddO1xuICBzdGF0ZV9jb3B5Wyd2X3knXSArPSBzdGF0ZV9jb3B5WydhX3knXTtcbiAgc3RhdGVfY29weVsndl94J10gPiAwID8gc3RhdGVfY29weVsndl94J10gLT0gZnJpY3Rpb24gOiBzdGF0ZV9jb3B5Wyd2X3gnXSArPSBmcmljdGlvbjtcbiAgc3RhdGVfY29weVsndl95J10gPiAwID8gc3RhdGVfY29weVsndl95J10gLT0gZnJpY3Rpb24gOiBzdGF0ZV9jb3B5Wyd2X3knXSArPSBmcmljdGlvbjtcbiAgaWYoTWF0aC5hYnMoc3RhdGVfY29weVsndl94J10pIDw9IG1pbl9zcGVlZCl7XG4gICAgc3RhdGVfY29weVsndl94J10gPSAwO1xuICB9XG4gIGlmKE1hdGguYWJzKHN0YXRlX2NvcHlbJ3ZfeSddKSA8PSBtaW5fc3BlZWQpe1xuICAgIHN0YXRlX2NvcHlbJ3ZfeSddID0gMDtcbiAgfVxuXG4gIC8vIHJlY3RbeCwgeSwgd2lkdGgsIGhlaWdodF1cbiAgdmFyIGxpc3Rfb2ZfcmVjdHMgPSBbXTtcbiAgbGlzdF9vZl9yZWN0cy5wdXNoKFtzdGF0ZVsnZmllbGRfdG9wX2xlZnRfeCddLCBzdGF0ZVsnZmllbGRfdG9wX2xlZnRfeSddLCBzdGF0ZVsnZmllbGRfd2lkdGgnXSwgc3RhdGVbJ2ZpZWxkX2hlaWdodCddIC0gc3RhdGVbJ2ZpZWxkX3RvcF9sZWZ0X3knXV0pXG4gIGxpc3Rfb2ZfcmVjdHMucHVzaChbMTAwLCAxMDAsIDMwLCAzMF0pO1xuICB2YXIgYmFsbF9jZW50ZXIgPSBbc3RhdGVfY29weVsncG9zX3gnXSwgc3RhdGVfY29weVsncG9zX3knXV07XG4gIHZhciBiYWxsX3JhZGl1cyA9IHN0YXRlX2NvcHlbJ3JhZGl1cyddO1xuXG4gIGZvcih2YXIgaSA9IDAgOyBpIDwgbGlzdF9vZl9yZWN0cy5sZW5ndGggOyBpICsrKXtcbiAgICB2YXIgcmVjdCA9IGxpc3Rfb2ZfcmVjdHNbaV07XG4gICAgdmFyIGxlZnRfeCA9IHJlY3RbMF07XG4gICAgdmFyIHJpZ2h0X3ggPSByZWN0WzBdICsgcmVjdFsyXTtcbiAgICB2YXIgdG9wX3kgPSByZWN0WzFdO1xuICAgIHZhciBib3R0b21feSA9IHJlY3RbMV0gKyByZWN0WzNdO1xuICAgIGlmKGJhbGxfY2VudGVyWzFdID4gdG9wX3lcbiAgICAgICYmIGJhbGxfY2VudGVyWzFdIDwgYm90dG9tX3lcbiAgICAgICYmKCBNYXRoLmFicyhiYWxsX2NlbnRlclswXSAtIGxlZnRfeCkgPD0gYmFsbF9yYWRpdXMgXG4gICAgICAgIHx8IE1hdGguYWJzKHJpZ2h0X3ggLSBiYWxsX2NlbnRlclswXSkgPD0gYmFsbF9yYWRpdXMpKXtcbiAgICAgIHN0YXRlX2NvcHlbJ3ZfeCddICo9IC0xO1xuICAgIH1cbiAgICBpZihiYWxsX2NlbnRlclswXSA+IGxlZnRfeFxuICAgICAgJiYgYmFsbF9jZW50ZXJbMF0gPCByaWdodF94XG4gICAgICAmJiggTWF0aC5hYnMoYmFsbF9jZW50ZXJbMV0gLSB0b3BfeSkgPD0gYmFsbF9yYWRpdXMgXG4gICAgICB8fCBNYXRoLmFicyhib3R0b21feSAtIGJhbGxfY2VudGVyWzFdKSA8PSBiYWxsX3JhZGl1cykpe1xuICAgICAgc3RhdGVfY29weVsndl95J10gKj0gLTE7XG4gICAgfVxuICB9XG4gIGlmKHJlbmRlcmVyICE9PSB1bmRlZmluZWQpe1xuICAgIHJlbmRlcmVyKHN0YXRlX2NvcHkpO1xuICB9XG4gIHVwZGF0ZV90aW1lX2JhcigpO1xuICByZXR1cm4gc3RhdGVfY29weTtcbn1cblxuY29uc29sZS5sb2coJ3N0YXJ0IScpO1xuXG5zZXRJbnRlcnZhbChtYWluTG9vcE5ldywgMTApO1xuLy9zZXRJbnRlcnZhbChtYWluTG9vcCwgMTApO1xuIl19
