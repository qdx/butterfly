var Geometry = require('../geometry/Geometry.js');

class GameObject{
  constructor(collision_group, collision_body, display_body, moveable){
    if(GameObject.id_counter === undefined){
      GameObject.id_counter = 1;
    }else{
      GameObject.id_counter += 1;
    }
    this.id = GameObject.id_counter;
    this.collision_group = collision_group;
    this.collision_body = collision_body;
    //if(display_body.type == "geometry"){
      //this.display_body = display_body;
    //}else{
    // TODO: should I keep display body separate from collision body?
    // FIXME: should not always do this:
      this.display_body = collision_body;
    //}
    this.moveable = moveable;
    this.pass_through = false;

    if(collision_body.shape == Geometry.AABB){
      this.x = collision_body.min.x;
      this.y = collision_body.min.y;
    }else if(collision_body.shape == Geometry.CIRCLE){
      this.x = collision_body.center.x;
      this.y = collision_body.center.y;
    }
    this.intersect_with = [];
    this.impulse_resolved_with = [];
    this.a_x = 0;
    this.a_y = 0;
  }

  clone(){
    return new GameObject(this.collision_group, this.collision_body.clone(), undefined, this.moveable);
  }

  set_pass_through(){
    this.pass_through = true;
  }

  get_position(){
    return {'x':this.x, 'y':this.y};
  }

  set_position(x, y){
    this.x = x;
    this.y = y;
    if(this.collision_body.shape == Geometry.AABB){
      this.collision_body.min_x = x;
      this.collision_body.min_y = y;
      this.collision_body.max_x = x + this.collision_body.width;
      this.collision_body.max_y = y + this.collision_body.height;
    }else if(this.collision_body.shape == Geometry.LINE){
      if(this.collision_body.parallel_to == 'x'){
        this.collision_body.pos = y;
      }else{
        this.collision_body.pos = x;
      }
    }else if(this.collision_body.shape == Geometry.CIRCLE){
      this.collision_body.center.x = this.x;
      this.collision_body.center.y = this.y;
    }
  }

  set_velocity(v_x, v_y){
    this.v_x = v_x;
    this.v_y = v_y;
  }

  set_acceleration(a_x, a_y){
    this.a_x = a_x;
    this.a_y = a_y;
  }

  set_impulse_resolve_target(obj){
    if(!this.impulse_resolved_with.includes(obj)){
      this.impulse_resolved_with.push(obj);
    }
  }

  remove_impulse_resolve_target(obj){
    let idx = this.impulse_resolved_with.indexOf((obj));
    if(idx > -1){
      this.impulse_resolved_with.splice(obj, 1);
    }
  }

  impulse_resolved_with_target(obj){
    return this.impulse_resolved_with.includes(obj);
  }

  set_intersection(obj){
    if(!this.intersect_with.includes(obj)){
      this.intersect_with.push(obj);
    }
  }

  remove_intersection(obj){
    let idx = this.intersect_with.indexOf((obj));
    if(idx > -1){
      this.intersect_with.splice(obj, 1);
    }
  }

  clear_intersection(){
    this.intersect_with = [];
  }

  is_intersect_with(obj){
    return this.intersect_with.includes(obj);
  }
  // aabb should have:
  // min: {x: <>, y:<>}
  // max: {x: <>, y:<>}

  // circle should have:
  // center: {x: <>, y:<>}
  // r: <>

  // lines are infinite line, and should have:
  // parallel_to: ['x'|'y']
  // pos: <>


}
module.exports = GameObject;
