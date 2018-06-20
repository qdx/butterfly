const ANCHOR_CENTER = 1;
const ANCHOR_TOP_LEFT = 2;
const ANCHOR_TOP_RIGHT = 3;
const ANCHOR_BOTTOM_RIGHT = 4;
const ANCHOR_BOTTOM_LEFT  = 5;

class Appearance{
  constructor(physical_obj){
    this.physical_obj = this.physical_obj;
    this.anchor_type = ANCHOR_CENTER;

    // this order shows the priority for rendering,
    // we use animation whenever it presents,
    // image follows, we only use shape when it presents
    // and no other method presents.
    this.animation = undefined;
    this.image = undefined;
    this.shape = undefined;
  }

  render(ctx){}
  serialize(){}
  clone(){}

  set_anchor_type(){}
  get_anchor_type(){}
}
module.exports = Appearance;
