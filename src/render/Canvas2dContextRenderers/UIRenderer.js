class UIRenderer{

  constructor(canvas2dContext){
    if(!UIRenderer.instance){
      this.ctx = canvas2dContext;
      UIRenderer.instance = this;
    }
    return UIRenderer.instance;
  }

  render(){
    if(!this.ctx){return;}

    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.rect(
      this.min_x,
      this.min_y,
      this.max_x - this.min_x,
      this.max_y - this.min_y);
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.fillStyle = 'red';
    this.ctx.rect(
      this.min_x + 1, 
      this.min_y + 1, 
      (this.max_x - this.min_x - 2) * this.fill_percent,
      this.max_y - this.min_y - 2,
    )
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }

}
module.exports = UIRenderer;
