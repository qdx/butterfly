var Geometry = require('./Geometry.js');
var CollisionDetector = require('../physics/CollisionDetector.js');
var MyDebug = require('../MyDebug.js');

class Line extends Geometry{
  constructor(parallel_to, pos, length){
    super(Geometry.LINE);
    this.body_type = CollisionDetector.C_BODY_LINE;
    this.parallel_to = parallel_to;
    this.pos = pos;
    this.length = length;
  }

  serialize(){
    return {
      "shape": "Line",
      "parallel_to": this.parallel_to,
      "pos": this.pos,
      "length": this.length
    };
  }

  to_json(){
    return JSON.stringify(this.serialize());
  }

  clone(){
    var cloned_line = super.clone(new Line(this.parallel_to, this.pos, this.length));
    return cloned_line;
  }

  render(ctx, id=undefined){
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
    if(MyDebug.engine_debug && id){
      ctx.strokeText(id, this.pos.x, this.pos.y);
    }
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
}
module.exports = Line;
