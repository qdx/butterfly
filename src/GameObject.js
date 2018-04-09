class GameObject{
  constructor(collision_group, collision_body){
    console.log('[GameObject] constructing');
    this.collision_group = collision_group;
    this.collision_body = collision_body;
  }



}
module.exports = GameObject;
