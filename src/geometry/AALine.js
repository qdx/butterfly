var Geometry = require('./Geometry.js');

//Axis Aligned line
class AALine extends Geometry{
  constructor(axis, min, length){
    super(Geometry.AALINE);
    this.axis = axis;
    this.min = min;
    this.length = length;
    Object.freeze(this);
  }
}
module.exports = AALine;
