class FuelIndicator{

  // TODO: the fuel indicator should display barrels of fuels left and current fuel left
  constructor(ctx, min_x, min_y, max_x, max_y, player){
    this.ctx = ctx;
    this.min_x = min_x;
    this.min_y = min_y;
    this.max_x = max_x;
    this.max_y = max_y;
    this.player = player;
  }

  set_barrels_of_fuels(n){
    this.barrels_of_fuels = n;
  }

  set_fill_percent(percent){
    this.fill_percent = percent;
  }

  render(){
    if(!this.ctx){return;}

    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.rect(
      this.min_x,
      this.min_y,
      this.max_x - this.min_x,
      this.max_y - this.min_y);
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.fillStyle = 'red';
    this.ctx.rect(
      this.min_x + 1, 
      this.min_y + 1, 
      (this.max_x - this.min_x - 2) * this.fill_percent,
      this.max_y - this.min_y - 2,
    )
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }

}
module.exports = FuelIndicator;
