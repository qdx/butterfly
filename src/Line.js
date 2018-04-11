var Geometry = require('./Geometry.js');

class Line extends Geometry{
  constructor(parallel_to, pos){
    super(Geometry.LINE);
    this.body_type = CollisionDetector.C_BODY_LINE;
    this.parallel_to = parallel_to;
    this.pos = pos;
  }
  render(ctx){
    ctx.beginPath();
    switch(this.parallel_to){
      case 'x':
        ctx.moveTo(0, pos);
        ctx.lineTo(10000, pos);
        break;
      case 'y':
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, 10000);
        break;
    }
  }
  ctx.stroke();
  ctx.closePath();
}
module.exports = Line;
