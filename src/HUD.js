var Geometry = require('./Geometry.js');
var BarIndicator = require('./BarIndicator.js');

class HUD{
  constructor(level, ctx, min_x, min_y, max_x, max_y){
    this.level = level;
    this.ctx = ctx;
    this.min_x = min_x;
    this.min_y = min_y;
    this.max_x = max_x;
    this.max_y = max_y;
    this._setup_time_indicator();
    this._setup_fuel_indicator();
  }

  set_level(level){
    this.level = level;
  }

  _setup_fuel_indicator(){
    var fuel_bar_config = {
      "x": 120,
      "y": 10,
      "width": 100,
      "height": 30,
      "border-color": "black",
      "fill-color": "red"
    };
    this.fuel_bar = new BarIndicator(
      this.ctx,
      this.min_x + fuel_bar_config.x,
      this.min_y + fuel_bar_config.y,
      this.min_x + fuel_bar_config.x + fuel_bar_config.width,
      this.min_y + fuel_bar_config.y + fuel_bar_config.height
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
    console.log(this.time_bar);
  }

  render(){
    let c_time = Date.now();
    let percent_left = (this.level.time_limit - (c_time - this.level.start_time) / 1000)/this.level.time_limit;
    this._render_time_bar(percent_left > 0 ? percent_left : 0);
    this._render_fuel_bar();
  }

  _render_time_bar(percent = 1){
    this.time_bar.set_fill_percent(percent);
    this.time_bar.render();
  }

  _render_fuel_bar(percent = 1){
    this.fuel_bar.set_fill_percent(percent);
    this.fuel_bar.render();
  }

}

module.exports = HUD;
