var Geometry = require('./Geometry.js');

class Line extends Geometry{
  constructor(p1, p2){
    super(Geometry.LINE);
    this.p1 = p1;
    this.p2 = p2;
    Object.freeze(this);
  }
}
module.exports = Line;
