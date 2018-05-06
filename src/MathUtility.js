class MathUtility{

  static distance(x1, y1, x2, y2){
    return Math.sqrt(
      Math.pow(x1 - x2, 2)
      + Math.pow(y1 - y2, 2)
    );
  }

  static distance_square(x1, y1, x2, y2){
    let x_sub = x1 - x2;
    let y_sub = y1 - y2;
    return x_sub * x_sub + y_sub * y_sub;
  }

}
module.exports = MathUtility;
