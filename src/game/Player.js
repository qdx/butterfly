var GameObject = require('./GameObject.js');
const MAX_FUEL = 100;
const ENGINE_STATUS_OK = 'ok';
const ENGINE_STATUS_NO_FUEL = 'no_fuel';
const ENGINE_STATUS_REPLACE_FUEL = 'replacing_fuel';

class Player {
  constructor(game_object){
    this.game_object = game_object;
    // engine_status:
    // ok, no_fuel, replacing_fuel
    this.engine_status = ENGINE_STATUS_OK;
    this.fuel_efficiency = 20;
    this.acceleration = 0.2;
    this.barrels_of_fuels = 0;
    this.current_fuel = 0;
    this.fuel_replacement_time = 3000;
  }

  clone(){
    var cloned_player = new Player(this.game_object.clone());
    cloned_player.set_fuel_efficiency(this.get_fuel_efficiency());
    cloned_player.set_acceleration(this.get_acceleration());
    cloned_player.set_barrels_of_fuels(this.get_barrels_of_fuels());
    cloned_player.set_current_fuel(this.get_current_fuel());
    cloned_player.set_fuel_replacement_time(this.get_fuel_replacement_time());
    return cloned_player;
  }

  set_fuel_efficiency(f){
    this.fuel_efficiency = f;
  }

  get_fuel_efficiency(){
    return this.fuel_efficiency;
  }

  clear_intersection(){
    this.game_object.clear_intersection()
  }

  update(){
    this.check_engine();
  }

  get_fuel_replacement_start_time(){
    return this.fuel_replacement_start;
  }

  get_engine_status(){
    return this.engine_status;
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
        if(this.current_fuel < 1){
          if(this.barrels_of_fuels < 1){
            this.engine_status = ENGINE_STATUS_NO_FUEL;
          }else{
            this.replace_fuel();
          }
        }
        break;
    }
  }

  add_fuel_barrel(n){
    this.barrels_of_fuels += n;
  }

  add_fuel_percent(p){
    this.current_fuel += p;
    if(this.current_fuel > MAX_FUEL){
      this.barrels_of_fuels += (this.current_fuel / MAX_FUEL);
      this.current_fuel = this.current_fuel % MAX_FUEL;
    }
  }

  set_current_fuel(f){
    this.current_fuel = f;
  }

  get_current_fuel(){
    return this.current_fuel;
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
      this.fuel_replacement_start = Date.now();
      this.engine_status = ENGINE_STATUS_REPLACE_FUEL;
    }else{
      this.engine_status = ENGINE_STATUS_NO_FUEL;
    }
  }

  try_finish_fuel_replacement(){
    if(Date.now() - this.fuel_replacement_start 
        >= this.fuel_replacement_time){
      this.current_fuel = MAX_FUEL;
      this.engine_status = ENGINE_STATUS_OK;
      this.fuel_replacement_start = null;
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
module.exports.ENGINE_STATUS_OK = ENGINE_STATUS_OK;
module.exports.ENGINE_STATUS_NO_FUEL = ENGINE_STATUS_NO_FUEL;
module.exports.ENGINE_STATUS_REPLACE_FUEL = ENGINE_STATUS_REPLACE_FUEL ;
