var GameObject = require('./GameObject.js');
var HUD = require('./HUD.js');
var GameArea= require('./GameArea.js');
var Level = require('./Level.js');

var Circle = require('../geometry/Circle.js');
var AABB = require('../geometry/AABB.js');
var Line = require('../geometry/Line.js');

var ImpluseResolver = require('../physics/ImpluseResolver.js');
var CollisionDetector = require('../physics/CollisionDetector.js');

class LevelLoader{

  static get_levels(ctx, canvas_width, canvas_height){
    var levels = [];
    levels.push(LevelLoader._load_level_0(0, ctx, canvas_width, canvas_height));
    levels.push(LevelLoader._load_level_1(1, ctx, canvas_width, canvas_height));
    levels.push(LevelLoader._load_level_2(2, ctx, canvas_width, canvas_height));
    return levels;
  }

  level_from_json(json){
  }

  static _load_level_0(id, ctx, width, height){
    var game_area = new GameArea(
      {"min_x":0,
        "min_y":0,
        "max_x":600,
        "max_y":600},
      [{"x": 30, "y": 300, "v_x": 0.1, "v_y": 0}],
      [],
      CollisionDetector.C_GROUP1
    );
    var exit_circle = new Circle(500, 300, 10);
    var exit_obj = new GameObject(
      CollisionDetector.C_GROUP1,
      exit_circle,
      undefined);
    game_area.add_exit(exit_obj);

    var hud = new HUD(ctx, 0, 600, 600, 680);

    var level = new Level(ctx, hud, game_area, 10000, id, 1);
    return level;
  }

  static _load_level_1(id, ctx, width, height){
    var game_area = new GameArea(
      {"min_x":0,
        "min_y":0,
        "max_x":600,
        "max_y":600},
      [{"x": 30, "y": 300, "v_x": 0, "v_y": 0}],
      [],
      CollisionDetector.C_GROUP1
    );
    var exit_circle = new Circle(500, 300, 10);
    var exit_obj = new GameObject(CollisionDetector.C_GROUP1, exit_circle, undefined, false);
    game_area.add_exit(exit_obj);


    let min_x = 290;
    let min_y = 100;
    var block_new = new AABB(min_x, min_y, min_x + 20 , min_y + 400);
    var block_new_aabb = new GameObject(CollisionDetector.C_GROUP1, block_new, block_new, false);
    game_area.add_object(block_new_aabb);

    var hud = new HUD(ctx, 0, 600, 600, 680);

    var level = new Level(ctx, hud, game_area, 15000, id, 1);
    return level;
  }

  static _load_level_2(id, ctx, width, height){
    var game_area = new GameArea(
      {"min_x":0,
        "min_y":0,
        "max_x":600,
        "max_y":600},
      [{"x": 30, "y": 300, "v_x": 0, "v_y": 0}],
      [],
      CollisionDetector.C_GROUP1,
      false
    );
    var exit_circle = new Circle(500, 300, 10);
    var exit_obj = new GameObject(CollisionDetector.C_GROUP1, exit_circle, undefined, false);
    game_area.add_exit(exit_obj);


    let min_x = 290;
    let min_y = 100;
    var block_new = new AABB(min_x, min_y, min_x + 20 , min_y + 400);
    var block_new_aabb = new GameObject(CollisionDetector.C_GROUP1, block_new, block_new, false);
    game_area.add_object(block_new_aabb);

    var hud = new HUD(ctx, 0, 600, 600, 680);

    var level = new Level(ctx, hud, game_area, 15000, id, 1);
    return level;
  }

}

module.exports = LevelLoader;
