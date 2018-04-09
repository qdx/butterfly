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

const C_BODY_TYPE_LINE = 1;
const C_BODY_TYPE_AABB = 2;
const C_BODY_TYPE_CIRCLE = 3;


class CollisionDetector{

  constructor(){
    console.log('[CollisionDetector] constructing');
  }

  can_collide(obj1, obj2){
    let group_can_collide = (obj1.collision_group & obj2.collision_group) > 0;
    if(!group_can_collide) return false;

    let collision_type = obj1.collision_body.type + ':' + obj2.collision_body.type;
    // FIXME: optimize with bit operation, bit comparison should be much faster than string
    switch(collision_type){
      case C_BODY_TYPE_AABB + ':' + C_BODY_TYPE_AABB:
        return aabb_2_aabb_can_collide(obj1, obj2);
        break;
      case C_BODY_TYPE_CIRCLE + ':' + C_BODY_TYPE_CIRCLE:
        return circle_2_circle_can_collide(obj1, obj2);
        break;
      case C_BODY_TYPE_AABB + ':' + C_BODY_TYPE_CIRCLE:
        return circle_2_aabb_can_collide(obj2, ojb1);
        break;
      case C_BODY_TYPE_CIRCLE + ':' + C_BODY_TYPE_AABB:
        return circle_2_aabb_can_collide(obj1, obj2);
        break;
      case C_BODY_TYPE_CIRCLE + ':' + C_BODY_TYPE_LINE:
        return circle_2_line_can_collide(obj1, obj2);
        break;
      case C_BODY_TYPE_LINE + ':' + C_BODY_TYPE_CIRCLE:
        return circle_2_line_can_collide(obj2, obj1);
        break;
      case C_BODY_TYPE_AABB + ':' + C_BODY_LINE:
        return aabb_2_line_can_collide(obj1, obj2);
        break;
      case C_BODY_LINE + ':' + C_BODY_TYPE_AABB:
        return aabb_2_line_can_collide(obj2, obj1);
        break;
      default:
        return false;
    }
  }

  aabb_2_aabb_can_collide(aabb1, aabb2){

    // TODO: start implement collision detection from here
    // The following code is a good reference on aabb2aabb collision detection
    //Bounds.overlaps = function(boundsA, boundsB) {
        //return (boundsA.min.x <= boundsB.max.x && boundsA.max.x >= boundsB.min.x
                //&& boundsA.max.y >= boundsB.min.y && boundsA.min.y <= boundsB.max.y);
    //};

  }

  circle_2_circle_can_collide(c, aabb){

  }

  circle_2_aabb_can_collide(c, aabb){

  }

  circle_2_line_can_collide(c, b){

  }

  aabb_2_line_can_collide(aabb, b){

  }

}

module.exports = CollisionDetector;
module.exports.NO_COLLISION = NO_COLLISION;
module.exports.C_GROUP1 = C_GROUP1;
module.exports.C_GROUP2 = C_GROUP2;
module.exports.C_GROUP3 = C_GROUP3;
module.exports.C_GROUP4 = C_GROUP4;
module.exports.C_BODY_TYPE_LINE = C_BODY_TYPE_LINE;
module.exports.C_BODY_TYPE_AABB = C_BODY_TYPE_AABB;
module.exports.C_BODY_TYPE_CIRCLE = C_BODY_TYPE_CIRCLE;
