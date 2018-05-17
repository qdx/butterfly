var Geometry = require('./Geometry.js');
var CollisionDetector = require('../physics/CollisionDetector.js');
var MyDebug = require('../MyDebug.js');

class AABB extends Geometry{
  constructor(min_x, min_y, max_x, max_y){
    super(Geometry.AABB);
    this.min = {};
    this.min.x = min_x;
    this.min.y = min_y;
    this.max = {};
    this.max.x = max_x;
    this.max.y = max_y;
    this.width = max_x - min_x;
    this.height = max_y - min_y;
  }
  render(ctx, id=undefined){
    ctx.beginPath();
    ctx.rect(
      this.min.x,
      this.min.y,
      this.max.x - this.min.x,
      this.max.y - this.min.y);
    ctx.stroke();
    if(MyDebug.engine_debug){
      // DEBUG
      if(id){
        ctx.strokeText(id, this.min.x, this.min.y);
      }
    }
    ctx.closePath();
  }
}
module.exports = AABB;
