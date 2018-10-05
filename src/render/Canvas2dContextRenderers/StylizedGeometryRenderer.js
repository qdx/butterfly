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

  render(geometryObject){
    this.ctx.save();

    switch(geometryObject.shape){
      case Geometry.AALINE:
        this._renderAALine(geometryObject);
        break;
      case Geometry.AABB:
        this._renderAABB(geometryObject);
        break;
      case Geometry.Circle:
        this._renderCircle(geometryObject);
        break;
      case Geometry.POINT:
        this._renderPoint(geometryObject);
        break;
      case Geometry.LINE:
        this._renderLine(geometryObject);
        break;
      default:
        // TODO: throw non-supported geo shape error
        break;
    }

    this.ctx.restore();
  }

  // TODO: Understand the performance impact of the following code
  // ctx.save();
  // ctx.beginPath();
  // ctx.closePath();
  // ctx.restore();
  // If no big deal, I want to find ways to reduce the duplicated code 
  _renderDebugInfo(geometryObject){
    ctx.beginPath();

    if(MyDebug.engine_debug && geometryObject.id){
      ctx.font = "40px Arial";
      ctx.strokeText(
        geometryObject.id,
        geometryObject.center.x,
        geometryObject.center.y);
    }

    ctx.closePath();
  }

  _renderAALine(geometryObject){
    var ctx = this.ctx; // just to save typing
    ctx.save();
    ctx.beginPath();

    switch(geometryObject.parallel_to){
      case 'x':
        ctx.moveTo(geometryObject.pos.x, geometryObject.pos.y);
        ctx.lineTo(geometryObject.length, geometryObject.pos.y);
        break;
      case 'y':
        ctx.moveTo(geometryObject.pos.x, geometryObject.pos.y);
        ctx.lineTo(geometryObject.pos.x, geometryObject.length);
        break;
    }
    ctx.stroke();

    ctx.closePath();
    ctx.restore();
  }

  _renderAABB(geometryObject){
    var ctx = this.ctx; // just to save typing
    ctx.rect(
      geometryObject.min.x,
      geometryObject.min.y,
      geometryObject.max.x - geometryObject.min.x,
      geometryObject.max.y - geometryObject.min.y);
    ctx.stroke();
  }

  _renderCircle(geometryObject){
    var ctx = this.ctx; // just to save typing
    ctx.save();
    ctx.beginPath();

    if(geometryObject.fillStyle){
      ctx.fillStyle = geometryObject.fillStyle;
    }
    if(geometryObject.strokeStyle){
      ctx.strokeStyle = geometryObject.strokeStyle;
    }
    if(geometryObject.lineWidth){
      ctx.lineWidth = geometryObject.lineWidth;
    }
    ctx.arc(
      geometryObject.center.x,
      geometryObject.center.y,
      geometryObject.r, 
      0,
      2 * Math.PI);
    ctx.stroke();

    ctx.closePath();
    ctx.restore();
  }

  // This is less likely to be actually used to render anything since 
  // circle is the one that has more actual usage
  _renderPoint(geometryObject){}

  _renderLine(geometryObject){}

  
}
module.exports = GeometryRenderer;
