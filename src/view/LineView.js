var AABB = require('../geometry/AABB.js');
var _ = require('underscore');

class LineView{
  constructor(line, style={}){
    this.style = style;
    _.extend(this, line);
    this.boundBox = new AABB(
      line.p1.x,
      line.p1.y,
      line.p2.x,
      line.p2.y
    );
  }
}
module.exports = LineView;
