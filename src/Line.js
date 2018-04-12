var Geometry = require('./Geometry.js');
var CollisionDetector = require('./CollisionDetector.js');

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
        ctx.moveTo(0, this.pos);
        ctx.lineTo(10000, this.pos);
        break;
      case 'y':
        ctx.moveTo(this.pos, 0);
        ctx.lineTo(this.pos, 10000);
        break;
    }
    ctx.stroke();
    ctx.closePath();
  }
}
module.exports = Line;
