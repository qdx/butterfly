var HUD = require('./HUD.js');
var GameArea = require('./GameArea.js');
var MathUtility = require('./MathUtility.js');

class Level{

  constructor(ctx, player, hud, game_area, time_limit){
    this.ctx = ctx;
    this.player = player;
    this.player.set_level(this);
    this.time_limit = time_limit;

    this.hud = hud;
    this.hud.set_level(this);

    this.game_area = game_area;
    this.game_area.set_level(this);
  }

  start_game(){
    this.start_time = Date.now();
  }

  check_game_end(){
    // TODO: start from here, why is player not intersecting with target?
    if(this.player.game_object.is_intersect_with === this.game_area.exits[0]){
      console.log('win!');
    }
  }
}

module.exports = Level;
