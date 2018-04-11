var Geometry = require('./Geometry.js');

class Circle extends Geometry{
  constructor(center_x, center_y, radius){
    super(Geometry.CIRCLE);
    this.center = {};
    this.center.x = center_x;
    this.center.y = center_y;
    this.r = radius;
  }
  render(ctx){
    ctx.beginPath();
    ctx.arc(this.center.x,this.center.y, this.r, 0, 2*Math.PI);
    ctx.stroke();
    ctx.closePath();
  }
}
module.exports = Circle;
