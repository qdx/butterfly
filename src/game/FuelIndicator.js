var Player = require('./Player.js');

class FuelIndicator{
  constructor(ctx, min_x, min_y, width, height){
    this.ctx = ctx;
    this.min_x = min_x;
    this.min_y = min_y;
    this.width = width;
    this.height = height;
  }

  init_player(player){
    this.player = player;
  }

  render(){
    this.ctx.save();
    // draw number of fuels left in text
    this.ctx.font = "25px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = 'bottom';
    let fuel_count = this.player.get_barrels_of_fuels();
    let fuel_count_width = this.ctx.measureText(fuel_count).width;
    this.ctx.fillText(fuel_count, this.min_x, this.min_y + this.height);
    this.ctx.restore();

    // draw border of the fuel bar
    let bar_width = this.width - fuel_count_width;
    let bar_min_x = fuel_count_width + this.min_x;
    let border_width = 1;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = border_width;
    this.ctx.rect(
      bar_min_x,
      this.min_y,
      bar_width,
      this.height);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();

    // fill the fuel bar with correct percentage
    let fill_percent = this.player.get_fuel_percent();
    this.ctx.save();
    this.ctx.beginPath();
    switch(this.player.engine_status){
      case Player.ENGINE_STATUS_OK:
        this.ctx.fillStyle = '#fcc12d';
        break;
      case Player.ENGINE_STATUS_REPLACE_FUEL:
        let time_passed = Date.now() - this.player.get_fuel_replacement_start_time();
        fill_percent = time_passed / this.player.get_fuel_replacement_time();
        this.ctx.fillStyle = '#fff2d3';
        break;
    }
    if(fill_percent > 0){
      this.ctx.rect(
        bar_min_x + border_width,
        this.min_y + border_width,
        (bar_width - 2 * border_width) * fill_percent,
        this.height - 2 * border_width
      );
      this.ctx.fill();
    }

    this.ctx.font = "22px Arial";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = 'hanging';
    switch(this.player.engine_status){
      case Player.ENGINE_STATUS_REPLACE_FUEL:
        this.ctx.fillStyle = 'grey';
        this.ctx.fillText('Refuelling...', bar_min_x + border_width, this.min_y + border_width);
        break;
      case Player.ENGINE_STATUS_NO_FUEL:
        this.ctx.fillStyle = 'red';
        this.ctx.fillText('Out of fuel', bar_min_x + border_width, this.min_y + border_width);
        break;
    }
    this.ctx.closePath();
    this.ctx.restore();
  }

}
module.exports = FuelIndicator;
