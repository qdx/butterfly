var GameObject = require('./GameObject.js');

class Player {
  constructor(level, game_object, max_fuel){
    this.level = level;
    this.game_object = game_object;
    this.max_fuel = max_fuel;
    this.current_fuel = max_fuel;
  }

  set_acceleration(acc){
    this.acceleration = acc;
  }

  get_fuel_percent(){
    return this.current_fuel / this.max_fuel;
  }

  set_level(level){
    this.level = level;
  }
}
module.exports = Player;
