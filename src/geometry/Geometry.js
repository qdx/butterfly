const LINE = 1;
const AABB = 2;
const CIRCLE = 3;

class Geometry{
  constructor(shape){
    this.shape = shape;
  }
  from_json(json_string){
    var data = JSON.parse(json_string);
    switch(data.shape){
      case "Circle":
        return new Circle(data.center.x, data.center.y, data.radius);
        break;
      case "Line":
        return new Line(data.parallel_to, data.pos, data.length)
        break;
      case "AABB":
        return new AABB(data.min.x, data.min.y, data.max.x, data.max.y);
        break;
      default:
        return undefined;
        break;
    }
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
