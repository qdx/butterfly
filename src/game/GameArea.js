var Line = require('../geometry/Line.js');
var GameObject = require('./GameObject.js');

class GameArea{
  constructor(play_area, entries, exits, collision_group, have_border = true){
    this.play_area = play_area;
    this.entries = entries;
    this.exits = exits;
    this.collision_group = collision_group;
    this._objects = [];

    if(have_border){
      var line_top = new Line("x", {"x": play_area.min_x, "y": play_area.min_y}, play_area.max_x - play_area.min_x);
      var line_bottom = new Line("x", {"x": play_area.min_x, "y": play_area.max_y}, play_area.max_x - play_area.min_x);
      var line_left = new Line("y", {"x": play_area.min_x, "y": play_area.min_y}, play_area.max_y - play_area.min_y);
      var line_right = new Line("y", {"x": play_area.max_x, "y": play_area.min_y}, play_area.max_y - play_area.min_y);
      var play_area_borders = [line_top, line_bottom, line_left, line_right];
      var play_area_border_objs = play_area_borders.map(function(line){
        return new GameObject(
          collision_group,
          line,
          {"type": "geometry"},
          false
        )
      });
      for(var i = 0 ; i < play_area_border_objs.length ; i ++){
        this._objects.push(play_area_border_objs[i]);
      }
    }
  }

  to_json(){
    return JSON.stringify(this.serialize());
  }

  serialize(){
    return {
      "play_area": this.play_area,
      "entries": this.entries,
      "exits": this.exits.map(exit => exit.serialize()),
      "collision_group": this.collision_group,
      "have_border": this.have_border
    }
  }

  clone(){
    var cloned_entries = [];
    this.entries.forEach(function(entry){
      cloned_entries.push(entry);
    });
    var cloned_exits = [];
    this.exits.forEach(function(exit){
      cloned_exits.push(exit.clone());
    });
    var cloned_objects = [];
    this._objects.forEach(function(obj){
      cloned_objects.push(obj);
    });
    var cloned_game_area = new GameArea(this.play_area, cloned_entries, cloned_exits, this.collision_group, this.have_border);
    cloned_game_area.set_game_objects(cloned_objects);
    return cloned_game_area;
  }

  set_level(level){
    this.level = level;
  }

  set_play_area(min_x, min_y, max_x, max_y){
    this.play_area = {
      "min_x": min_x,
      "min_y": min_y,
      "max_x": max_x,
      "max_y": max_y
    }
  }

  add_entry(entry){
    if(this.entries === undefined){
      this.entries = [];
    }
    this.entries.push(entry);
  }

  // exit is a GameObject
  add_exit(exit){
    if(this.exits === undefined){
      this.exits = [];
    }
    // properties all exits would have:
    exit.display_body.set_strokeStyle('green');
    exit.display_body.set_lineWidth(3);
    exit.set_pass_through();

    this.exits.push(exit);
  }

  set_game_objects(game_objects){
    this._objects = game_objects;
  }

  get_game_objects(){
    return this._objects.concat(this.exits);
  }

  add_object(game_object){
    if(this._objects === undefined){
      this._objects= [];
    }
    this._objects.push(game_object);
  }


  in_game_area(x, y){
    return x < this.play_area.max_x
      && x > this.play_area.min_x
      && y < this.play_area.max_y
      && y > this.play_area.min_y;
  }
}
module.exports = GameArea;
