var GameObject = require('./GameObject.js');
const MAX_FUEL = 100;
const ENGINE_STATUS_OK = 'ok';
const ENGINE_STATUS_NO_FUEL = 'no_fuel';
const ENGINE_STATUS_REPLACE_FUEL = 'replacing_fuel';

class Player {
  constructor(level, game_object){
    this.level = level;
    this.game_object = game_object;
    this.fuel_efficiency = 20;
    this.acceleration = 0.1;
    this.barrels_of_fuels = 1;
    this.current_fuel = MAX_FUEL;
    this.fuel_replacement_time = 500;
    // engine_status:
    // ok, no_fuel, replacing_fuel
    this.engine_status = ENGINE_STATUS_OK;
  }

  // TODO: the game engine should always call update() on player to refresh player status
  update(){
    this.check_engine();
  }

  check_engine(){
    switch(this.engine_status){
      case ENGINE_STATUS_NO_FUEL:
        if(this.barrels_of_fuels > 0){
          this.replace_fuel();
        }
        break;
      case ENGINE_STATUS_REPLACE_FUEL:
        this.try_finish_fuel_replacement();
        break;
      case ENGINE_STATUS_OK:
        if(this.barrels_of_fuels < 1 
          && this.current_fuel < 1){
          this.engine_status = ENGINE_STATUS_NO_FUEL;
        }
        break;
    }
  }

  get_fuel_percent(){
    return this.current_fuel / MAX_FUEL;
  }

  burn_fuel(){
    if(this.engine_status == ENGINE_STATUS_OK
      && this.current_fuel >= this.fuel_efficiency){
      this.current_fuel -= this.fuel_efficiency;
      if(this.current_fuel < 1){
        this.replace_fuel();
      }
      return true;// yes we have fuel was burnt
    }else{
      return false;// no fuel was not burnt
    }
  }

  replace_fuel(){
    if(this.barrels_of_fuels >= 1){
      this.barrels_of_fuels -= 1;
      this.battery_replacement_start = Date.now();
      this.engine_status = ENGINE_STATUS_REPLACE_FUEL;
    }else{
      this.engine_status = ENGINE_STATUS_NO_FUEL;
    }
  }

  try_finish_fuel_replacement(){
    if(Date.now() - this.battery_replacement_start 
        >= this.fuel_replacement_time){
      this.current_fuel = MAX_FUEL;
      this.engine_status = ENGINE_STATUS_OK;
      this.fuel_replacement_time = null;
      return true;
    }else{
      return false;
    }
  }

  set_fuel_replacement_time(t){
    this.fuel_replacement_time = t;
  }

  get_fuel_replacement_time(){
    return this.fuel_replacement_time;
  }

  set_barrels_of_fuels(n){
    this.barrels_of_fuels = n;
  }

  get_barrels_of_fuels(){
    return this.barrels_of_fuels;
  }

  set_acceleration(acc){
    this.acceleration = acc;
  }

  get_acceleration(){
    return this.acceleration;
  }

  set_level(level){
    this.level = level;
  }
}
module.exports = Player;
