var Geometry = require('./Geometry.js');

class AABB extends Geometry{
  constructor(min_x, min_y, max_x, max_y){
    super(Geometry.AABB);
    this.min = {};
    this.min.x = min_x;
    this.min.y = min_y;
    this.max = {};
    this.max.x = max_x;
    this.max.y = max_y;
  }
}
module.exports = AABB;
