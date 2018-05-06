var Circle = require('./Circle.js');
var AABB = require('./AABB.js');
var Line = require('./Line.js');
var GameObject = require('./GameObject.js');
var ImpluseResolver = require('./ImpluseResolver.js');
var HUD = require('./HUD.js');
var Player = require('./Player.js');
var GameArea= require('./GameArea.js');
var Level = require('./Level.js');
var CollisionDetector = require('./CollisionDetector.js');
var UserInteractionHandler = require('./UserInteractionHandler.js');

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

function mainLoopNew(){
  for(var i = 0 ; i < 10 ; i ++){
    physics_engine_step_new(level.game_area.objects);
  }
  level.check_game_end();
  //console.log('v' + (player.v_x * player.v_x + player.v_y * player.v_y));


  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  level.game_area.objects.forEach(function(obj){
    obj.display_body.render(ctx, obj.id);
  });
  hud.render();
  ctx.restore();
}


// ===================== test level =======================
var game_area = new GameArea(
  undefined, 
  {"min_x":0,
  "min_y":0,
  "max_x":600,
  "max_y":600},
  [{"x": 30, "y": 30}],
  [],
  CollisionDetector.C_GROUP1
);
//game_area.add_object(block);
//game_area.add_object(block2);
//game_area.add_object(block4);
var exit_circle = new Circle(50, 200, 50);
var exit_obj = new GameObject(CollisionDetector.C_GROUP1, exit_circle, undefined, false);
exit_obj.set_pass_through();
game_area.add_exit(exit_obj);

var width = canvas.width;
var height = canvas.height;

for(var i = 1 ; i < 4 ; i ++){
  for(var j = 1 ; j < 4 ; j ++){
    var min_x = i * width / 4;
    var min_y = j * width / 4;
    var block_new = new AABB(min_x, min_y, min_x + 20 , min_y + 20);
    var block_new_aabb = new GameObject(CollisionDetector.C_GROUP1, block_new, block_new, false);
    game_area.add_object(block_new_aabb);
  }
}

var player_body = new Circle(30, 30, 10);
var player_obj = new GameObject(CollisionDetector.C_GROUP1, player_body, player_body, true);
player_obj.set_velocity(1, 1);
player_obj.set_acceleration(0, 0);
var player = new Player(undefined, player_obj, 100);
player.set_acceleration(0.1);

var target_body = new Circle(400, 80, player_body.r * 2);
var target = new GameObject(CollisionDetector.C_GROUP1, target_body, target_body, false);
target.set_pass_through();

var hud = new HUD(undefined, ctx, 0, 600, 600, 680);

var level = new Level(ctx, player, hud, game_area, 30);
level.game_area.objects.push(player.game_object);
level.start_game();

// [level_switch]: Will need to remove the ui handler and re-bind a new one that's created for the new level
var ui_handler = new UserInteractionHandler(level);
document.addEventListener("keydown", ui_handler.key_down_handler_wrapper(), false);
document.addEventListener("keyup", ui_handler.key_up_handler_wrapper(), false);
// ===================== test level =======================

console.log('start!');
setInterval(mainLoopNew, 10);
