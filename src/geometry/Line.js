var Geometry = require('./Geometry.js');
var CollisionDetector = require('../physics/CollisionDetector.js');

class Line extends Geometry{
  constructor(parallel_to, pos, length){
    super(Geometry.LINE);
    this.body_type = CollisionDetector.C_BODY_LINE;
    this.parallel_to = parallel_to;
    this.pos = pos;
    this.length = length;
  }

  clone(){
    var cloned_line = super.clone(new Line(this.parallel_to, this.pos, this.length));
    return cloned_line;
  }

  render(ctx){
    ctx.beginPath();
    switch(this.parallel_to){
      case 'x':
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(this.length, this.pos.y);
        break;
      case 'y':
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(this.pos.x, this.length);
        break;
    }
    ctx.stroke();
    ctx.closePath();
  }
}
module.exports = Line;
