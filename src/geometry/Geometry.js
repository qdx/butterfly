const LINE = 1;
const AABB = 2;
const CIRCLE = 3;

class Geometry{
  constructor(shape){
    this.shape = shape;
  }
  clone(geometry){
    geometry.fillStyle = this.fillStyle;
    geometry.strokeStyle = this.strokeStyle;
    geometry.lineWidth = this.lineWidth;
    return geometry;
  }
  set_fillStyle(fillStyle){
    this.fillStyle = fillStyle;
  }
  set_strokeStyle(strokeStyle){
    this.strokeStyle = strokeStyle;
  }
  set_lineWidth(lineWidth){
    this.lineWidth = lineWidth;
  }
}

module.exports = Geometry;
module.exports.LINE = LINE;
module.exports.AABB = AABB;
module.exports.CIRCLE = CIRCLE;
