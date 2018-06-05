var Circle = require('./geometry/Circle.js');
var GameObject = require('./game/GameObject.js');
var ImpluseResolver = require('./physics/ImpluseResolver.js');
var CollisionDetector = require('./physics/CollisionDetector.js');
var UserInteractionHandler = require('./game/UserInteractionHandler.js');
var LevelLoader = require('./game/LevelLoader.js');
var Player = require('./game/Player.js');

var MyDebug = require('./MyDebug.js');
MyDebug.engine_debug = 0;

var canvas = document.getElementById("game_field");
var ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 700;

var detector = new CollisionDetector();
var resolver = new ImpluseResolver();

function physics_engine_step_new(game_objects){
  var collision_pairs = [];
  game_objects.filter(obj => obj.moveable).forEach(function(obj){
    for(var j = 0 ; j < game_objects.length ; j ++){
      if(obj !== game_objects[j] ){
        var contact = detector.can_collide(obj, game_objects[j]);
        if(contact != 0 ){
          collision_pairs.push([obj, game_objects[j], contact]);
        }
      }
    }
  });

  collision_pairs.forEach(function(c_pair){
    resolver.resolve(c_pair[0], c_pair[1], c_pair[2]);
  });

  var time_slice = 0.1;
  game_objects.filter(obj => obj.moveable).forEach(function(obj){
    let pos = obj.get_position();
    obj.set_position(pos.x + time_slice*obj.v_x, pos.y + time_slice*obj.v_y);
    obj.v_x += time_slice*obj.a_x;
    obj.v_y += time_slice*obj.a_y;
  });
}

var player_body = new Circle(30, 30, 10);
var player_obj = new GameObject(CollisionDetector.C_GROUP1, player_body, player_body, true);
var player = new Player(player_obj);
player.init_default();

var current_level_number = 0;
var levels = LevelLoader.get_levels(ctx, canvas.width, canvas.height);
var level = levels[current_level_number].clone();
var ui_handler = new UserInteractionHandler(level);
var key_up_handler = ui_handler.key_up_handler_wrapper();
var key_down_handler = ui_handler.key_down_handler_wrapper();

function mainLoopNew(){
  if(!level.start_time){
    console.log('starting level:' + current_level_number);
    console.log('level id is:' + level.id);
    level.init_player(player.clone());
    document.addEventListener("keydown", key_down_handler, false);
    document.addEventListener("keyup", key_up_handler, false);
    level.start_game();
  }
  if(level.game_status == 'started'){
    for(var i = 0 ; i < 10 ; i ++){
      physics_engine_step_new(level.game_area.get_game_objects());
    }
    level.player.update();
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    level.game_area.get_game_objects().forEach(function(obj){
      obj.display_body.render(ctx, obj.id);
    });
    level.hud.render();
    ctx.restore();
  }

  let game_end_status = level.check_game_end();
  if(game_end_status == 1){
    if(levels.length > current_level_number + 1){
      console.log('game ends, have more level, load next level');
      document.removeEventListener("keydown", key_down_handler, false);
      document.removeEventListener("keyup", key_up_handler, false);
      current_level_number ++;
      player = level.end_game();

      level = levels[current_level_number].clone();
      ui_handler = new UserInteractionHandler(level);
      key_up_handler = ui_handler.key_up_handler_wrapper();
      key_down_handler = ui_handler.key_down_handler_wrapper();
    }else{
      console.log('game ends, no more level');
    }
  }else if(game_end_status == -1){
    console.log('game lost')
    ctx.save();
    ctx.font = "40px Arial";
    ctx.fillStyle = 'red';
    ctx.fillText("you lost", 100, 100);
    ctx.restore();
  }
}

console.log('start!');
setInterval(mainLoopNew, 10);
