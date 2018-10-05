var AABB = require('../geometry/AABB.js');
var _ = require('underscore');

class CircleView{
  constructor(circle,  style={}, fill=false){
    this.style = style;
    this.fill = fill;
    _.extend(this, circle);
    this.boundBox = new AABB(
      circle.center.x - circle.r,
      circle.center.y - circle.r,
      circle.center.x + circle.r,
      circle.center.y + circle.r
    );
  }
}
module.exports = CircleView;
