var HUD = require('./HUD.js');
var GameArea = require('./GameArea.js');
var MathUtility = require('../math/MathUtility.js');


class Level{
  //this.ctx
  //this.time_limit in seconds
  //this.hud
  //this.game_area
  //this.player

  constructor(ctx, hud, game_area, time_limit, id, fuel_supply){
    this.id = id;
    this.ctx = ctx;
    this.time_limit = time_limit;

    this.hud = hud;
    this.hud.set_level(this);

    this.game_area = game_area;
    this.game_area.set_level(this);

    this.fuel_supply = fuel_supply;
    this.game_status = 'init';
  }

  clone(){
    //TODO: this clone will lose the player in the level
    return new Level(this.ctx, this.hud.clone(), this.game_area.clone(), this.time_limit, this.id, this.fuel_supply);
  }

  init_player(player){
    this.player = player;

    this.player.game_object.set_velocity(1, 1);
    this.game_area.add_object(player.game_object);
    this.player.set_level(this);

    let player_entry = this.game_area.entries[0];
    this.player.game_object.x = player_entry.x;
    this.player.game_object.y = player_entry.y;
    this.player.game_object.set_velocity(player_entry.v_x, player_entry.v_y);

    this.player.add_fuel_barrel(this.fuel_supply);

    this.hud.init_player(this.player);
  }

  start_game(){
    this.start_time = Date.now();
    this.game_status = 'started';
  }

  // 1: win
  // -1: lost
  // 0: otherwise
  check_game_end(){
    if(this.game_status == 'started'){
      if((!this.game_area.in_game_area(this.player.game_object.x, this.player.game_object.y) 
        || Date.now() - this.start_time > this.time_limit)){
        this.game_status = 'lost';
      }else if(this.player.game_object.is_intersect_with(this.game_area.exits[0])) {
        this.game_status = 'win';
      }
    }
  }

  end_game(){
    this.player.clear_intersection();
    var tmp_player = this.player;
    this.player = undefined;
    this.ctx = undefined;
    this.ctx = undefined;
    this.time_limit = undefined;
    this.hud = undefined;
    this.game_area = undefined;
    this.game_status = 'ended';
    return tmp_player;
  }
}

module.exports = Level;
