class UserInteractionHandler{

  constructor(level){
    this.level = level;
    this.moves = {
      "ArrowDown": false,
      "ArrowUp": false,
      "ArrowLeft": false,
      "ArrowRight": false
    };
    this.key_up_handler = this.key_up_handler_wrapper();
    this.key_down_handler = this.key_down_handler_wrapper();
  }

  key_up_handler_wrapper(){
    var level = this.level;
    var moves = this.moves;
    var func = function(e){
      this.level = level;
      this.moves = moves;
      if(e.code in moves){
        var player_obj = this.level.player.game_object;
        player_obj.a_x = 0;
        player_obj.a_y = 0;
      }
    }
    return func;
  }

  key_down_handler_wrapper(){
    var level = this.level;
    var moves = this.moves;
    var func = function(e){
      this.level = level;
      this.moves = moves;
      if(e.code in this.moves){
        var player = this.level.player;
        var player_obj = player.game_object;
        if(player.burn_fuel()){
          switch(e.code){
            case "ArrowUp":
              player_obj.a_y -= player.acceleration;
              break;
            case "ArrowDown":
              player_obj.a_y += player.acceleration;
              break;
            case "ArrowLeft":
              player_obj.a_x -= player.acceleration;
              break;
            case "ArrowRight":
              player_obj.a_x += player.acceleration;
              break;
          }
        }
      }else{
        switch(e.code){
          case "KeyR":
            console.log("pressed r, should reload game!");
            this.level.game_status = 'restart';
            break;
          case "Enter":
            console.log("pressed enter, will continue game!");
            if(this.level.game_status == 'win'){
              this.level.game_status = 'continue';
            }
            break;
        }
      }
    }
    return func;
  }

}
module.exports = UserInteractionHandler;
