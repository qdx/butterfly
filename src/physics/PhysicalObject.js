//var Geometry = require('./Geometry.js');
//var CollisionDetector = require('../physics/CollisionDetector.js');
//var MyDebug = require('../MyDebug.js');

//    all physical properties:
//      * position
//      * speed
//      * acceleration
//      * collision body/shape
//      * collision group
//      * an id
//      * can be cloned, with new id
//      * mass
//      * collision_resolve_strategy
class PhysicalObject{
  constructor(pos, shape, collision_group){
    this.position = pos;
    this.shape = shape;
    this.collision_group = collision_group;

    // properties with default value
    this.acceleration = {"x": 0, "y": 0};
    this.energy_absorption = 0;
    this.mass = Infinity;
    this.rotation = 0;
    this.speed = 0;
  }

  serialize(){}
  clone(){}

  set_collision_group(){}
  get_collision_group(){}

  set_shape(){}
  get_shape(){}

  set_pos(){}
  get_pos(){}

  set_acceleration(){}
  get_acceleration(){}

  set_energy_absorption(){}
  get_energy_absorption(){}

  set_mass(){}
  get_mass(){}

  set_rotation(){}
  get_rotation(){}

  set_speed(){}
  get_speed(){}



}
module.exports = PhysicalObject;
