var Geometry = require('../geometry/Geometry.js');
var Vector = require('../math/Vector.js');
var MyDebug = require('../MyDebug.js');

const CONTACT_CIRCLE_2_POINT = 1;
const CONTACT_CIRCLE_2_AB_LINE = 2;

class ImpluseResolver{
  resolve(obj1, obj2, contact){
    if(obj1.pass_through || obj2.pass_through){
      return;
    }
    let collision_type = obj1.collision_body.shape + ':' + obj2.collision_body.shape;
    let result = undefined;
    // we haven't resolved the impulse between obj1 and obj2 since their collision yet
    if(!obj1.impulse_resolved_with_target(obj2)){
      if(MyDebug.engine_debug){
        console.log('resolving!');
        console.log(obj1.id + ',' + obj2.id);
        console.log('before: v_x' + obj1.v_x + ',' + obj1.v_y);
      }
      switch(collision_type){
        case Geometry.AABB + ':' + Geometry.AABB:
          console.log('aabb 2 aabb impluse resolution not supported');
          break;
        case Geometry.CIRCLE + ':' + Geometry.CIRCLE:
          console.log('circle 2 circle impluse resolution not supported');
          break;
        case Geometry.AABB + ':' + Geometry.CIRCLE:
          result = this.circle_2_aabb_resolution(obj2, obj1, contact);
          break;
        case Geometry.CIRCLE + ':' + Geometry.AABB:
          result = this.circle_2_aabb_resolution(obj1, obj2, contact);
          break;
        case Geometry.CIRCLE + ':' + Geometry.LINE:
          result = this.circle_2_line_resolution(obj1, obj2);
          break;
        case Geometry.LINE + ':' + Geometry.CIRCLE:
          result = this.circle_2_line_resolution(obj2, obj1);
          break;
        case Geometry.AABB + ':' + Geometry.LINE:
          console.log('aabb 2 line impluse resolution not supported');
          break;
        case Geometry.LINE+ ':' + Geometry.AABB:
          console.log('line 2 aabb impluse resolution not supported');
          break;
      }
      // remember the fact that we have resolved the impulse between obj1 obj2 already
      // to avoid multiple resolution in case of deep penetration
      obj1.set_impulse_resolve_target(obj2);
      obj2.set_impulse_resolve_target(obj1);
      if(MyDebug.engine_debug){
        console.log('after: v_x' + obj1.v_x + ',' + obj1.v_y);
      }
    }else{
      if(MyDebug.engine_debug){
        console.log('skip resolving!');
        console.log(obj1.id + ',' + obj2.id);
      }
    }
    return result;
  }

  circle_2_aabb_resolution(c, ab, contact){
    if(c.is_intersect_with !== ab || ab.is_intersect_with != c){
      if(MyDebug.engine_debug){
        console.log('intersect!');
        console.log(c.id + ',' + ab.id);
        console.log(contact);
      }
      if(contact['contact_type'] == CONTACT_CIRCLE_2_POINT){
        this._circle_2_point_resolution(c, contact['contact']['point']);
      }else if(contact['contact_type'] == CONTACT_CIRCLE_2_AB_LINE){
        this._circle_2_ab_line_resolution(c, contact['contact']['aligned_axis']);
      }else{
        if(MyDebug.engine_debug){
          console.log('error! unknown contact type:' +  contact['contact_type']);
        }
      }
    }else{
      if(MyDebug.engine_debug){
        console.log('did not intersect!');
      }
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
    if(c.is_intersect_with !== l || l.is_intersect_with != c){
      this._circle_2_ab_line_resolution(c, l.collision_body.parallel_to);
    }
  }
}
module.exports = ImpluseResolver;
module.exports.CONTACT_CIRCLE_2_POINT  = CONTACT_CIRCLE_2_POINT;
module.exports.CONTACT_CIRCLE_2_AB_LINE = CONTACT_CIRCLE_2_AB_LINE;
