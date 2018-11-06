var assert = require('assert');
var CollisionDetector = require('../../src/physics/CollisionDetector.js');
var Geometry = require('../../src/geometry/Geometry.js');
var AABB = require('../../src/geometry/AABB.js');
var Circle = require('../../src/geometry/Circle.js');
var AALine = require('../../src/geometry/AALine.js');
var Body = require('../../src/physics/Body.js');

describe('CollisionDetector', function() {
  var cd = new CollisionDetector();

  describe('#aabb_2_aabb_can_collide()', function() {
    var aabb1 = new AABB(0, 0, 100, 100);

    var aaline1 = new AALine(Geometry.AXIS_X, {x: -10, y: 1}, 2);
    it('false: AABB(0, 0, 100, 100) - AALine(Geometry.AXIS_X, {x: -10, y: 1}, 2)', function() {
      assert.equal(cd.aabb_2_aabb_can_collide(aabb1, aaline1), false);
    });
    var aaline2 = new AALine(Geometry.AXIS_X, {x: -10, y: 1}, 11);
    it('true: AABB(0, 0, 100, 100) - AALine(Geometry.AXIS_X, {x: -10, y: 1}, 11)', function() {
      assert.equal(cd.aabb_2_aabb_can_collide(aabb1, aaline2), true);
    });
    var aabb2 = new AABB(99, 0, 101, 1);
    it('true: AABB(0, 0, 100, 100) - AABB(99, 0, 101, 1)', function() {
      assert.equal(cd.aabb_2_aabb_can_collide(aabb1, aabb2), true);
    });
    var aabb3 = new AABB(50, 50, 60, 60);
    it('true: AABB(0, 0, 100, 100) - AABB(50, 50, 60, 60)', function() {
      assert.equal(cd.aabb_2_aabb_can_collide(aabb1, aabb3), true);
    });
    it('true: AABB(50, 50, 60, 60) - AABB(0, 0, 100, 100)', function() {
      assert.equal(cd.aabb_2_aabb_can_collide(aabb3, aabb1), true);
    });
    var aabb4 = new AABB(101, 101, 102, 102);
    it('false: AABB(0, 0, 100, 100) - AABB(101, 101, 102, 102)', function() {
      assert.equal(cd.aabb_2_aabb_can_collide(aabb1, aabb5), false);
    });
    var aabb5 = new AABB(-10, -10, -11, -11);
    it('false: AABB(0, 0, 100, 100) - AABB(-10, -10, -11, -11)', function() {
      assert.equal(cd.aabb_2_aabb_can_collide(aabb1, aabb5), false);
    });
    var aabb6 = new AABB(100, 100, 120, 101);
    it('true: AABB(0, 0, 100, 100) - AABB(100, 100, 120, 101)', function() {
      assert.equal(cd.aabb_2_aabb_can_collide(aabb1, aabb6), true);
    });
    var aabb7 = new AABB(100, 101, 120, 101);
    it('false: AABB(0, 0, 100, 100) - AABB(100, 101, 120, 101)', function() {
      assert.equal(cd.aabb_2_aabb_can_collide(aabb1, aabb7), false);
    });
    var aabb8 = new AABB(100, 50, 120, 101);
    it('true: AABB(0, 0, 100, 100) - AABB(100, 101, 120, 101)', function() {
      assert.equal(cd.aabb_2_aabb_can_collide(aabb1, aabb8), true);
    });
    var aabb9 = new AABB(101, 50, 120, 101);
    it('false: AABB(0, 0, 100, 100) - AABB(101, 101, 120, 101)', function() {
      assert.equal(cd.aabb_2_aabb_can_collide(aabb1, aabb9), false);
    });

  });

  describe('#aabb_2_circle_can_collide()', function() {
    var aabb1 = new AABB(0, 0, 100, 100);
    
    var c1 = new Circle(30, 40, 3);
    it('true: AABB(0, 0, 100, 100) - Circle(30, 40, 3)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(aabb1, c1), true);
    });
    var aaline1 = new AALine(Geometry.AXIS_X, {x: 0, y: 36}, 100);
    it('false: Circle(30, 40, 3) - AALine(Geometry.AXIS_X, {x: 0, y: 36}, 100)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(c1, aaline1), false);
    });
    var aaline2 = new AALine(Geometry.AXIS_X, {x: 0, y: 37}, 100);
    it('true: Circle(30, 40, 3) - AALine(Geometry.AXIS_X, {x: 0, y: 37}, 100)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(c1, aaline2), true);
    });

    var c2 = new Circle(120, -20, 5);
    it('false: AABB(0, 0, 100, 100) - Circle(120, -20, 5)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(aabb1, c2), false);
    });
    var c3 = new Circle(110, 50, 20);
    it('true: AABB(0, 0, 100, 100) - Circle(110, 50, 20)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(aabb1, c3), true);
    });
    var c4 = new Circle(-20, -19, 28);
    it('true: AABB(0, 0, 100, 100) - Circle(-20, -19, 22)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(aabb1, c4), true);
    });
    var c5 = new Circle(-50, 70, 5);
    it('false: AABB(0, 0, 100, 100) - Circle(-50, 70, 5)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(aabb1, c5), false);
    });
    var c6 = new Circle(30, 40, 200);
    it('true: AABB(0, 0, 100, 100) - Circle(30, 40, 200)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(aabb1, c6), true);
    });
    var c7 = new Circle(69, 200, 500);
    it('true: AABB(0, 0, 100, 100) - Circle(69, 200, 500)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(aabb1, c7), true);
    });
    var c8 = new Circle(120, 120, 28);
    it('false: AABB(0, 0, 100, 100) - Circle(120, 120, 28)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(aabb1, c8), false);
    });
    var c9 = new Circle(120, 120, 29);
    it('true: AABB(0, 0, 100, 100) - Circle(120, 120, 29)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(aabb1, c9), true);
    });
    var c10 = new Circle(120, 50, 19);
    it('false: AABB(0, 0, 100, 100) - Circle(120, 50, 19)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(aabb1, c10), false);
    });
    var c11 = new Circle(120, 50, 20);
    it('true: AABB(0, 0, 100, 100) - Circle(120, 50, 20)', function() {
      assert.equal(cd.aabb_2_circle_can_collide(aabb1, c11), true);
    });
  });

  describe('#circle_2_circle_can_collide()', function() {
    var c1 = new Circle(50, 50, 20);
    var c2 = new Circle(100, 100, 2);
    var c3 = new Circle(52, 52, 2);
    var c4 = new Circle(52, 52, 28);
    var c5 = new Circle(90, 50, 21);
    var c6 = new Circle(90, 50, 20);
    var c7 = new Circle(90, 50, 19);
    it('false: Circle(50, 50, 20) - Circle(100, 100, 2)', function() {
      assert.equal(cd.circle_2_circle_can_collide(c1, c2), false);
    });
    it('true: Circle(50, 50, 20) - Circle(52, 52, 2)', function() {
      assert.equal(cd.circle_2_circle_can_collide(c1, c3), true);
    });
    it('true: Circle(50, 50, 20) - Circle(52, 52, 28)', function() {
      assert.equal(cd.circle_2_circle_can_collide(c1, c4), true);
    });
    it('true: Circle(50, 50, 20) - Circle(70, 50, 21)', function() {
      assert.equal(cd.circle_2_circle_can_collide(c1, c5), true);
    });
    it('true: Circle(50, 50, 20) - Circle(70, 50, 20)', function() {
      assert.equal(cd.circle_2_circle_can_collide(c1, c6), true);
    });
    it('false: Circle(50, 50, 20) - Circle(70, 50, 19)', function() {
      assert.equal(cd.circle_2_circle_can_collide(c1, c7), false);
    });
  });

});
