var AABB = require('../geometry/AABB.js');
var _ = require('underscore');

//Axis Aligned line
class AALineView{
  constructor(aaLine, style={}){
    this.style = style;
    _.extend(this, aaLine);
    var max = {
      'x': aaLine.axis == 'x' ? aaLine.min.x + aaLine.length : aaLine.min.x,
      'y': aaLine.axis == 'y' ? aaLine.min.y + aaLine.length : aaLine.min.y
    };
    this.boundBox = new AABB(
      aaLine.min.x,
      aaLine.min.y,
      max.x,
      max.y
    );
  }
}
module.exports = AALineView;
