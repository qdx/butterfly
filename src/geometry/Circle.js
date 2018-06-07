var Geometry = require('./Geometry.js');
var CollisionDetector = require('../physics/CollisionDetector.js');
var MyDebug = require('../MyDebug.js');

class Circle extends Geometry{
  constructor(center_x, center_y, radius){
    super(Geometry.CIRCLE);
    this.center = {};
    this.center.x = center_x;
    this.center.y = center_y;
    this.r = radius;
  }
  clone(){
    return super.clone(new Circle(this.center.x, this.center.y, this.r));
  }
  render(ctx, id=undefined){
    ctx.save();
    ctx.beginPath();
    if(this.fillStyle){
      ctx.fillStyle = this.fillStyle;
    }
    if(this.strokeStyle){
      ctx.strokeStyle = this.strokeStyle;
    }
    if(this.lineWidth){
      ctx.lineWidth = this.lineWidth;
    }
    ctx.arc(this.center.x,this.center.y, this.r, 0, 2*Math.PI);
    ctx.stroke();
    if(MyDebug.engine_debug && id){
      // DEBUG
      ctx.font = "40px Arial";
      ctx.strokeText(id, this.center.x, this.center.y);
    }
    ctx.closePath();
    ctx.restore();
  }
}
module.exports = Circle;
