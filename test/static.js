/**
 * Module Dependencies
 */

var model = require('..');
var assert = require('assert');
var isBrowser = require('is-browser');

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
        .use(function(schema) {
          called++;
          assert(schema == Pet);
        })
        .use(function(schema) {
          called++;
          assert(schema == Pet);
          assert(2 == called);
        })
    })

    if (!isBrowser) {
      it('should support environments', function() {
        var Pet = model('Pet');
        var called = 0;

        Pet.use('server', function(schema) {
          called++;
          assert(!isBrowser);
          assert(schema == Pet);
        })

        Pet.use('browser', function(schema) {
          called++;
        })

        Pet.use('server', function(schema) {
          called++;
          assert(!isBrowser);
          assert(2 == called);
          assert(schema == Pet);
        })
      })
    }

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

  // describe('Model.sync()', function() {
  //   it('should create with .create([fn])', function(done) {
  //     var sync = {};

  //     sync.create = function(user, fn) {
  //       console.log(user.toJSON());
  //       return fn(null, { id: 10 })
  //     };

  //     User.sync('localstorage', sync);

  //     var user = User({ name: 'matt' });
  //     user.save(function(err) {
  //       console.log(err);
  //       done();
  //     });
  //   })

  //   describe('.fetch([fn])', function() {

  //   })

  //   describe('.update([fn])', function() {

  //   })

  //   describe('.remove([fn])', function() {

  //   })
  // })

})
