var Geometry = require('./Geometry.js');
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
    this.center = {};
    this.center.x = (this.min.x + this.max.x) / 2;
    this.center.y = (this.min.y + this.max.y) / 2;
    Object.freeze(this);
  }

  contains_point(p){
    return this.min.x <= p.x && p.x <= this.max.x
    && this.min.y <= p.y && p.y <= this.max.y;
  }

  get_center(){
    return this.center;
  }

  serialize(){
    return {
      "shape": "AABB",
      "min": this.min,
      "max": this.max
    };
  }

  to_json(){
    return JSON.stringify(this.serialize());
  }

  clone(){
    return super.clone(new AABB(this.min_x, this.min_y, this.max_x, this.max_y));
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
