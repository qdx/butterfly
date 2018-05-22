var HUD = require('./HUD.js');
var GameArea = require('./GameArea.js');
var MathUtility = require('../math/MathUtility.js');


class Level{
  //this.ctx
  //this.time_limit
  //this.hud
  //this.game_area
  //this.player

  constructor(ctx, hud, game_area, time_limit, id){
    this.id = id;
    this.ctx = ctx;
    this.time_limit = time_limit;

    this.hud = hud;
    this.hud.set_level(this);

    this.game_area = game_area;
    this.game_area.set_level(this);
  }

  init_player(player){
    this.player = player;

    this.player.game_object.set_velocity(1, 1);
    this.game_area.objects.push(player.game_object);
    this.player.set_level(this);

    let player_entry = this.game_area.entries[0];
    this.player.game_object.x = player_entry.x;
    this.player.game_object.y = player_entry.y;
    this.player.game_object.set_velocity(player_entry.v_x, player_entry.v_y);

    this.hud.init_player(this.player);
  }

  start_game(){
    this.start_time = Date.now();
  }

  check_game_end(){
    if(this.player.game_object.is_intersect_with(this.game_area.exits[0])){
      return true;
    }else{
      return false;
    }
  }

  end_game(){
    var tmp_player = this.player;
    this.player = undefined;
    this.ctx = undefined;
    this.ctx = undefined;
    this.time_limit = undefined;
    this.hud = undefined;
    this.game_area = undefined;
    return tmp_player;
  }
}

module.exports = Level;
