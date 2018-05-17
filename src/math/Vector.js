class Vector{
  constructor(x, y){
    this.x = x;
    this.y = y;
  }

  clone(){
    return new Vector(this.x, this.y);
  }

  rotate_clockwise_90(){
    return new Vector(- this.y, this.x);
  }

  magnitude(){
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }

  dot_product(v){
    return this.x * v.x + this.y * v.y;
  }
}

module.exports = Vector;
