const LINE = 1;
const AABB = 2;
const CIRCLE = 3;

class Geometry{
  constructor(shape){
    this.shape = shape;
  }
  clone(geometry){
    geometry.set_fillStyle(this.fillStyle);
    geometry.set_strokeStyle(this.strokeStyle);
    geometry.set_lineWidth(this.lineWidth);
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
