/**
 * Module dependencies
 */

var model = require('..');
var assert = require('assert');

/**
 * Initialize `User`
 */

var User = model('User')
    .attr('id', { type: 'number' })
    .attr('name', { type: 'string' })
    .attr('age', { type: 'number' });

/**
 * Test model
 */

describe('Modella', function() {
  describe('model(name)', function() {
    it('returns a new model constructor', function(){
      var Something = model('Something');
      assert('function' == typeof Something);
    });

    it('should set the name', function() {
      var Pet = model('pet');
      assert('pet' == Pet.modelName);
    })
  });

  describe('new Model(attrs)', function() {
    it('populate your attrs', function() {
      var user = new User({ name: 'Tobi', age: 22 });
      assert('Tobi' == user.name);
      assert(22 === user.age);
    });

    it('emits "construct" event when a model is instantiated', function() {
      var called = false;

      User.once('construct', function(user) {
        assert(user instanceof User);
        user.name += 'by';
        called = true;
      });

      var user = User({ name: 'bob'});
      assert('bobby' == user.name);
      assert(called);
    });
  });
})
