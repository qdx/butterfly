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

//document.addEventListener("keypress", keyPressHandler, false);

game_length = 1000;
current_game_tick = 0;
state_history = {};
ending_tick = 0;

game_started = false;
paused = false;
pause_start_at = 0;
total_paused = 0;
game_ended = false;
game_end_with_status = '';

GAME_WON_STATUS = 'win';
GAME_LOST_STATUS = 'lost';
IN_GAME_STATUS = 'in_game';

var friction = 0.001;
var acceleration = 0.03;
var fuel_efficiency = 5;

function render_game_end(ctx, status){
  var ending_text = 'You Win!';
  if(status == GAME_LOST_STATUS){
    ending_text = 'You lost!';
  }
  ctx.font = "30px Arial";
  ctx.fillText(ending_text, canvas.width / 2, canvas.height / 2);
}



var moves = {
  "ArrowDown": false,
  "ArrowUp": false,
  "ArrowLeft": false,
  "ArrowRight": false
}



var min_velocity = 0.003;
function check_stopped(state){
  return Math.abs(state['v_x']) <= min_velocity && Math.abs(state['v_y']) <= min_velocity;
}

function state_prediction(){
  var state_copy = root_clone(state);
  state_history[current_game_tick] = state;
  var i = current_game_tick;
  while((Math.abs(state_copy['v_x']) > 0.003 || Math.abs(state_copy['v_y']) > 0.003) && i < game_length){
    state_copy = physics_engine_step(state_copy, undefined);
    state_history[i] = state_copy;
    i++;
  }
  ending_tick = i - 1;
}



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
  //if(collision_pairs.length > 0){
    //console.log(collision_pairs);
  //}

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
canvas.width = 600;
canvas.height = 700;

var level = new Level(ctx, player, hud, game_area, 30);
level.game_area.objects.push(player.game_object);
level.start_game();

var ui_handler = new UserInteractionHandler(level);
document.addEventListener("keydown", ui_handler.key_down_handler_wrapper(), false);
document.addEventListener("keyup", ui_handler.key_up_handler_wrapper(), false);

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


function root_clone(obj){
  var clone = {};
  for(var key in obj){
    clone[key] = obj[key];
  }
  return clone;
}

console.log('start!');

setInterval(mainLoopNew, 10);
//setInterval(mainLoop, 10);
