const LINE = 1;
const AABB = 2;
const CIRCLE = 3;

class Geometry{
  constructor(shape){
    this.shape = shape;
  }
}

module.exports = Geometry;
module.exports.LINE = LINE;
module.exports.AABB = AABB;
module.exports.CIRCLE = CIRCLE;
