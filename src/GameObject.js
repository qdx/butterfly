class GameObject{
  constructor(collision_group, collision_body){
    console.log('[GameObject] constructing');
    this.collision_group = collision_group;
    this.collision_body = collision_body;
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
