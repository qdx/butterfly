var Circle = require('./Circle.js');
var AABB = require('./AABB.js');
var Line = require('./Line.js');
var GameObject = require('./GameObject.js');
var ImpluseResolver = require('./ImpluseResolver.js');
var HUD = require('./HUD.js');
var GameArea= require('./GameArea.js');
var Level = require('./Level.js');
var CollisionDetector = require('./CollisionDetector.js');

class LevelLoader{

  static get_levels(ctx, canvas_width, canvas_height){
    var levels = [];
    levels.push(LevelLoader._load_level_0(0, ctx, canvas_width, canvas_height));
    levels.push(LevelLoader._load_level_0(1, ctx, canvas_width, canvas_height));
    levels.push(LevelLoader._load_level_0(2, ctx, canvas_width, canvas_height));
    return levels;
  }

  static _load_level_0(id, ctx, width, height){
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
    var exit_circle = new Circle(50, 200, 50);
    var exit_obj = new GameObject(CollisionDetector.C_GROUP1, exit_circle, undefined, false);
    exit_obj.set_pass_through();
    game_area.add_exit(exit_obj);
    game_area.add_entry({'x': 10, 'y': 10});


    for(var i = 1 ; i < 4 ; i ++){
      for(var j = 1 ; j < 4 ; j ++){
        var min_x = i * width / 4;
        var min_y = j * height / 4;
        var block_new = new AABB(min_x, min_y, min_x + 20 , min_y + 20);
        var block_new_aabb = new GameObject(CollisionDetector.C_GROUP1, block_new, block_new, false);
        game_area.add_object(block_new_aabb);
      }
    }


    var target_body = new Circle(400, 80, 5 * 2);
    var target = new GameObject(CollisionDetector.C_GROUP1, target_body, target_body, false);
    target.set_pass_through();

    var hud = new HUD(undefined, ctx, 0, 600, 600, 680);

    var level = new Level(ctx, hud, game_area, 30, id);
    return level;
  }

}

module.exports = LevelLoader;
