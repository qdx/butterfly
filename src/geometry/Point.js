var Geometry = require('./Geometry.js');

class Point extends Geometry{
  constructor(x, y){
    super(Geometry.POINT);
    this.x = x;
    this.y = y;
    Object.freeze(this);
  }
}
module.exports = Point;
