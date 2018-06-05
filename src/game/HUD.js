var Geometry = require('../geometry/Geometry.js');
var BarIndicator = require('./BarIndicator.js');
var FuelIndicator = require('./FuelIndicator.js');

class HUD{
  constructor(ctx, min_x, min_y, max_x, max_y){
    this.ctx = ctx;
    this.min_x = min_x;
    this.min_y = min_y;
    this.max_x = max_x;
    this.max_y = max_y;
    this._setup_time_indicator();
    this._setup_fuel_indicator();
  }

  clone(){
    return new HUD(this.ctx, this.min_x, this.min_y, this.max_x, this.max_y);
  }

  init_player(player){
    this.player = player;
    this.fuel_bar.init_player(player);
  }

  set_level(level){
    this.level = level;
  }

  _setup_fuel_indicator(){
    var fuel_bar_config = {
      "x": 200,
      "y": 10,
      "width": 200,
      "height": 30
    };
    this.fuel_bar = new FuelIndicator(
      this.ctx,
      this.min_x + fuel_bar_config.x,
      this.min_y + fuel_bar_config.y,
      fuel_bar_config.width,
      fuel_bar_config.height
    );
  }

  _setup_time_indicator(){
    var time_bar_config = {
      "x": 10,
      "y": 10,
      "width": 100,
      "height": 30,
      "border-color": "black",
      "fill-color": "red"
    };
    this.time_bar = new BarIndicator(
      this.ctx,
      this.min_x + time_bar_config.x,
      this.min_y + time_bar_config.y,
      this.min_x + time_bar_config.x + time_bar_config.width,
      this.min_y + time_bar_config.y + time_bar_config.height
    );
  }

  render(){
    let c_time = Date.now();
    let time_percent_left = (this.level.time_limit - (c_time - this.level.start_time))/this.level.time_limit;
    this._render_time_bar(time_percent_left > 0 ? time_percent_left : 0);


    let fuel_percent_left = this.level.player.current_fuel / this.level.player.max_fuel;
    this._render_fuel_bar(fuel_percent_left);
  }

  _render_time_bar(percent = 1){
    this.time_bar.set_fill_percent(percent);
    this.time_bar.render();
  }

  _render_fuel_bar(){
    this.fuel_bar.render();
  }

}

module.exports = HUD;
