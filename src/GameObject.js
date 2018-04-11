class GameObject{
  constructor(collision_group, collision_body, display_body, moveable){
    console.log('[GameObject] constructing');
    this.collision_group = collision_group;
    this.collision_body = collision_body;
    this.display_body = display_body;
    this.moveable = moveable;
  }

  set_velocity(v_x, v_y){
    this.v_x = v_x;
    this.v_y = v_y;
  }

  set_acceleration(a_x, a_y){
    this.a_x = a_x;
    this.a_y = a_y;
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
