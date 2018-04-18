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
