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
