var Geometry = require('./Geometry.js');
var Vector = require('./Vector.js');

const CONTACT_CIRCLE_2_POINT = 1;
const CONTACT_CIRCLE_2_AB_LINE = 2;

class ImpluseResolver{
  resolve(obj1, obj2, contact){
    if(obj1.pass_through || obj2.pass_through){
      return;
    }
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
