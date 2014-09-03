/**
 * Module Dependencies
 */

var model = require('..');
var assert = require('assert');
var browser = require('is-browser');

/**
 * Initialize `User`
 */


var User = model('User').attr('name');

/**
 * Test statics
 */

describe('Static', function() {


  describe('Model.attr', function() {
    it('emits an "attribute" event', function() {
      var Pet = model('Pet');

      Pet.on('attribute', function(attr, options) {
        assert('name' == attr);
        assert(options.default == 'sam');
      });

      Pet.attr('name', { default: 'sam' });
    });
  });

  describe('Model.use', function() {
    it('should pass the model into the plugin', function() {
      var Pet = model('Pet');
      var called = 0;

      Pet
        .use(function(model) {
          called++;
          assert(model == Pet);
        })
        .use(function(model) {
          called++;
          assert(model == Pet);
          assert(2 == called);
        })
    })
  })

  describe('Model.env', function() {
    it('should run on the server', function() {
      var Pet = model('Pet');
      var called = 0;

      Pet.env('server')
        .use(function() {
          called++;
          assert(!browser);
        })
        .use(function() {
          called++;
          assert(!browser);
          assert(2 == called);
        })
    });

    it('should run in the browser', function() {
      var Pet = model('pet');
      var called = 0;

      Pet.env('browser')
        .use(function() {
          called++;
          assert(browser);
        })
        .use(function() {
          called++;
          assert(browser);
          assert(2 == called);
        })
    })

    it('should run in any environment', function() {
      var Pet = model('pet');
      var called = 0;

      Pet.env()
        .use(function() {
          called++;
        })
        .use(function() {
          called++;
          assert(2 == called);
        })
    })
  })

  describe('Model.on("change")', function() {
    var User;

    beforeEach(function() {
      User = model('user').attr('name');
    });

    it('should react to change events on instances', function() {
      var a = User({ name: 'matt' });
      var b = User({ name: 'matt' });
      var called = 0;

      User.on('change', function(model, attr, val, prev) {
        assert(model == a || model == b);
        assert('name' == attr);
        assert('ryan' == val);
        assert('matt' == prev);
        called++;
      })

      a.name = 'ryan';
      b.name = 'ryan';
      assert(2 == called);
    })

    it('should trigger attribute change events on instances', function() {
      var a = User({ name: 'matt' });
      var b = User({ name: 'matt' });
      var called = 0;

      User.on('change name', function(model, val, prev) {
        assert(model == a || model == b);
        assert('ryan' == val);
        assert('matt' == prev);
        called++;
      })

      a.name = 'ryan';
      b.name = 'ryan';
      assert(2 == called);
    })

    it('should not trigger if the value is the same', function() {
      var a = User({ name: 'matt' });
      var b = User({ name: 'matt' });
      var called = 0;

      User.on('change name', function(model, val, prev) {
        assert(model == a || model == b);
        assert('name' == attr);
        assert('ryan' == val);
        assert('matt' == prev);
        called++;
      })

      User.on('change', function(model, attr, val, prev) {
        assert(model == a || model == b);
        assert('name' == attr);
        assert('ryan' == val);
        assert('matt' == prev);
        called++;
      })

      a.name = 'matt';
      b.name = 'matt';
      assert(!called);
    })
  })

  describe('Model.sync()', function() {
    it('should create with .create([fn])', function(done) {
      User.sync()
        .create(function(user, fn) {
          console.log(user, fn);
        })

      var user = User();
      user.save(function(err) {
        console.log(err);
        done()
      });
    })

    describe('.fetch([fn])', function() {

    })

    describe('.update([fn])', function() {

    })

    describe('.remove([fn])', function() {

    })
  })

})
