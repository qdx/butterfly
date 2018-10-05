var Geometry = require('../../geometry/Geometry.js');
var MyDebug = require('../../MyDebug.js');
var _ = require('underscore');

/*
 * I need to define a renderable interface?
 * A renderable object needs:
 * 1. position
 *    - position in the canvas
 *    - position relatively to it's content
 * 2. content
 *    - geometry shapes
 *        * shape
 *        * border
 *        * fill
 *    - texture
 *    - animation
 * */

class GeometryRenderer{
  // DOC: This is a singleton, and it only gets binded to a context at
  // creation time, so it's impossible to change the context afterwards
  // That's an assumption I'm making for now.

  constructor(canvas2dContext){
    if(!GeometryRenderer.instance){
      this.ctx = canvas2dContext;
      GeometryRenderer.instance = this;
    }
    return GeometryRenderer.instance;
  }

  clearByBoundBox(geometryView){
    var ctx = this.ctx;
    var boundBox = geometryView.boundBox;
    ctx.save();
    ctx.clearRect(
      boundBox.min.x,
      boundBox.min.y,
      boundBox.max.y - boundBox.min.y,
      boundBox.max.x - boundBox.min.x
    );
    ctx.restore();
  }

  render(geometryView){
    var ctx = this.ctx;
    ctx.save();
    ctx.beginPath();

    if(!_.isEmpty(geometryView.style)){
      _.extend(ctx, geometryView.style);
    }

    switch(geometryView.shape){
      case Geometry.AALINE:
        this._renderAALine(geometryView);
        break;
      case Geometry.AABB:
        this._renderAABB(geometryView);
        break;
      case Geometry.CIRCLE:
        this._renderCircle(geometryView);
        break;
      case Geometry.LINE:
        this._renderLine(geometryView);
        break;
      default:
        console.warn("Trying to render an unknown shape!\n" + geometryView);
        break;
    }
    ctx.closePath();
    ctx.restore();
    if(MyDebug.render_bound_box == 1){
      this._renderBoundBox(geometryView);
    }
  }

  _renderAALine(geometryView){
    var ctx = this.ctx; // just to save typing
    switch(geometryView.axis){
      case 'x':
        ctx.moveTo(geometryView.min.x, geometryView.min.y);
        ctx.lineTo(geometryView.min.x + geometryView.length, geometryView.min.y);
        break;
      case 'y':
        ctx.moveTo(geometryView.min.x, geometryView.min.y);
        ctx.lineTo(geometryView.min.x, geometryView.min.y + geometryView.length);
        break;
    }
    ctx.stroke();
  }

  _renderAABB(geometryView){
    var ctx = this.ctx; // just to save typing
    ctx.rect(
      geometryView.min.x,
      geometryView.min.y,
      geometryView.max.x - geometryView.min.x,
      geometryView.max.y - geometryView.min.y);
    ctx.stroke();
    if(geometryView.fill){
      ctx.fill();
    }
  }

  _renderCircle(geometryView){
    var ctx = this.ctx; // just to save typing
    ctx.arc(
      geometryView.center.x,
      geometryView.center.y,
      geometryView.r, 
      0,
      2 * Math.PI);
    ctx.stroke();
    if(geometryView.fill){
      ctx.fill();
    }
  }

  _renderLine(geometryView){
    var ctx = this.ctx; // just to save typing
    ctx.moveTo(geometryView.p1.x, geometryView.p1.y);
    ctx.lineTo(geometryView.p2.x, geometryView.p2.y);
    ctx.stroke();
  }

  _renderBoundBox(geometryView){
    var ctx = this.ctx;
    var boundBox = geometryView.boundBox;
    ctx.save();
    ctx.strokeStyle = 'red';
    this._renderAABB(boundBox);
    ctx.restore();
  }
}
module.exports = GeometryRenderer;
