var Geometry = require('./Geometry.js');

//Axis Aligned line
class AALine extends Geometry{

  // default the direction of the AALine is along the direction of the axis
  constructor(axis, min, length){
    super(Geometry.AALINE);
    this.axis = axis;
    this.min = min;
    this.length = length;

    this.max = {};
    if(axis == Geometry.AXIS_X){
      this.max.y = min.y;
      this.max.x = min.x + length;
    }else{
      this.max.x = min.x;
      this.max.y = min.y + length;
    }
    Object.freeze(this);
  }

}
module.exports = AALine;
