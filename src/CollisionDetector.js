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
