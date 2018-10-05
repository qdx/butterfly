var AABB = require('./geometry/AABB.js');
var AABBView = require('./view/AABBView.js');
var Circle = require('./geometry/Circle.js');
var CircleView = require('./view/CircleView.js');
var AALine = require('./geometry/AALine.js');
var AALineView = require('./view/AALineView.js');
var Line = require('./geometry/Line.js');
var LineView = require('./view/LineView.js');

var GeometryRenderer = require('./render/Canvas2dContextRenderers/GeometryRenderer.js');
var MyDebug = require('./MyDebug.js');


var canvas = document.getElementById("game_field");
canvas.width = 600;
canvas.height = 700;
var ctx = canvas.getContext('2d');


var geoRenderer = new GeometryRenderer(ctx);

var aabb1 = new AABB(10, 10, 30, 50);
var aabbView1 = new AABBView(
  aabb1, {
  'strokeStyle' : 'blue',
  'fillStyle' : 'red'
  },
  true);
geoRenderer.render(aabbView1);


var aabb2 = new AABB(100, 100, 130, 140);
var aabbView2 = new AABBView(
  aabb2, {
  'strokeStyle' : 'blue',
  'fillStyle' : 'red'
  },
  false);
geoRenderer.render(aabbView2);

console.log('after aabb');

var circle = new Circle(200, 300, 10);
var circleView = new CircleView(circle, {
  'strokeStyle' : 'blue',
  'fillStyle' : 'red'
}, true);
geoRenderer.render(circleView);


var aaLineX = new AALine('x', {'x': 100, 'y': 400}, 30);
var aaLineViewX = new AALineView(aaLineX, {
  'strokeStyle': 'green'
});
geoRenderer.render(aaLineViewX);

var aaLineY = new AALine('y', {'x': 200, 'y': 400}, 100);
var aaLineViewY = new AALineView(aaLineY, {
  'strokeStyle': 'red'
});
geoRenderer.render(aaLineViewY);

var line = new Line({'x': 300, 'y': 70}, {'x': 300, 'y': 30});
var lineView = new LineView(line, {
  'strokeStyle': 'pink'
});
geoRenderer.render(lineView);
