var _ = require('underscore');

class AABBView{
  constructor(aabb, style={}, fill=false){
    this.style = style;
    this.fill = fill;
    _.extend(this, aabb);
    this.boundBox = aabb;
  }
}
module.exports = AABBView;
