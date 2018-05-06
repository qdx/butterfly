var Line = require('./Line.js');
var GameObject = require('./GameObject.js');

class GameArea{
  constructor(level, play_area, entries, exits, collision_group){
    this.level = level;
    this.play_area = play_area;
    this.entries = entries;
    this.exits = exits;
    this.collision_group = collision_group;
    this.objects = [];

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
    console.log(play_area_border_objs);
    for(var i = 0 ; i < play_area_border_objs.length ; i ++){
      this.objects.push(play_area_border_objs[i]);
    }
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
    this.exits.push(exit);
    this.objects.push(exit);
  }

  add_object(game_object){
    if(this.objects === undefined){
      this.objects= [];
    }
    this.objects.push(game_object);
  }
}
module.exports = GameArea;
