var Geometry = require('../geometry/Geometry.js');
var MathUtility = require('../math/MathUtility.js');
var MyDebug = require('../MyDebug.js');

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

// The CollisionDetector operates at the shape layer
class CollisionDetector{

  constructor(){
    this.collision_router = {
      [Geometry.AABB]: {
        [Geometry.AABB]: this.aabb_2_aabb_can_collide,
        [Geometry.CIRCLE]: this.aabb_2_circle_can_collide,
        [Geometry.AALINE]: this.aabb_2_aabb_can_collide,
        [Geometry.LINE]: this.aabb_2_line_can_collide
      },
      [Geometry.CIRCLE]:{
        [Geometry.AABB]: this.aabb_2_circle_can_collide,
        [Geometry.CIRCLE]: this.circle_2_circle_can_collide,
        [Geometry.AALINE]: this.circle_2_aabb_can_collide,
        [Geometry.LINE]: this.circle_2_line_can_collide
      },
      [Geometry.AALINE]:{
        [Geometry.AABB]: this.aabb_2_aabb_can_collide,
        [Geometry.CIRCLE]: this.circle_2_aabb_can_collide,
        [Geometry.AALINE]: this.aabb_2_aabb_can_collide,
        [Geometry.LINE]: this.aaline_2_line_can_collide
      },
      [Geometry.LINE]:{
        [Geometry.AABB]: this.aabb_2_line_can_collide,
        [Geometry.CIRCLE]: this.circle_2_line_can_collide,
        [Geometry.AALINE]: this.aaline_2_line_can_collide,
        [Geometry.LINE]: this.line_2_line_can_collide
      }
    }
  }

  //TODO: move this to a body collision manager somewhere outside of this one
  //is_collidable(obj1, obj2){
    //let group_can_collide = (obj1.collision_group & obj2.collision_group) > 0;
    //if(!group_can_collide) return false;
    //if(!obj1.movable && !obj2.movable) return false;
    //return true;
  //}

  detect_collision(shape1, shape2){
    let collision_detector = this.collision_router[shape1.shape][shape2.shape];
    return collision_detector(shape1, shape2);
  }

  aabb_2_aabb_can_collide(shape1, shape2){
    let min1 = shape1.min;
    let max1 = shape1.max;
    let min2 = shape2.min;
    let max2 = shape2.max;
    return (min1.x <= max2.x && max1.x >= min2.x)
      && (min1.y <= max2.y && max1.y >= min2.y);
  }

  aabb_2_circle_can_collide(shape1, shape2){
    let c, ab;
    if(shape1.shape == Geometry.CIRCLE){
      c = shape1;
      ab = shape2;
    }else{
      c = shape2;
      ab = shape1;
    }

    let center = c.center;
    let clamp_x = MathUtility.clamp(center.x, ab.min.x, ab.max.x);
    let clamp_y = MathUtility.clamp(center.y, ab.min.y, ab.max.y);
    let center_to_clamp_square =
      MathUtility.distance_square(clamp_x, clamp_y, center.x, center.y);

    // eab = extended ab:
    // +----------------+
    // | A  |  c.r | B  | 
    // |----+------+----|
    // |c.r-|  ab  |c.r-|
    // |----+------+----|
    // | D  |  c.r | C  |
    // +----------------+
    //
    // circle center within extended aabb' = aabb.min.*-r, aabb.max.*+r
    // based on above graph, eab contains center
    if(Math.abs(center.x - clamp_x) <= c.r
      && Math.abs(center.y - clamp_y) <= c.r){
      // circle center within 4 small corner square
      // based on above graph, one of A,B,C,D contains center
      if((clamp_x == ab.min.x || clamp_x == ab.max.x)
        &&(clamp_y == ab.min.y || clamp_y == ab.max.y)){
        // collide, since distance from center to clamp is smaller than r
        return center_to_clamp_square <= c.r*c.r;
      }else{
        return true;
      }
    }else{
      return false;
    }
  }

  circle_2_circle_can_collide(shape1, shape2){
    let c1 = shape1.center;
    let c2 = shape2.center;
    let circle_center_distance_square = MathUtility.distance_square(c1.x, c1.y, c2.x, c2.y);
    return circle_center_distance_square <= Math.pow(shape1.r + shape2.r, 2);
  }

  aabb_2_line_can_collide(obj1, obj2){
    console.warn('aabb 2 line collision not implemented!');
  }

  circle_2_line_can_collide(obj1, obj2){
    console.warn('circle 2 line collision not implemented!');
  }

  aaline_2_line_can_collide(obj1, obj2){
    console.warn('aaline 2 line collision not implemented!');
  }

  line_2_line_can_collide(obj1, obj2){
    console.warn('line 2 line collision not implemented!');
  }
}

module.exports = CollisionDetector;
module.exports.NO_COLLISION = NO_COLLISION;
module.exports.C_GROUP1 = C_GROUP1;
module.exports.C_GROUP2 = C_GROUP2;
module.exports.C_GROUP3 = C_GROUP3;
module.exports.C_GROUP4 = C_GROUP4;
