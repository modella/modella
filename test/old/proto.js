/**
 * Module dependencies
 */

var assert = require('better-assert'),
    model = require('../');

/**
 * User schema
 */

var User = model('user')
  .attr('id')
  .attr('name')
  .attr('email')
  .attr('password')
  .attr('interests');

/**
 * User attributes
 */

var attrs = {
  name : 'Matt',
  email : 'mattmuelle@gmail.com',
  password : 'test',
  interests : ['reading', 'javascript', 'travel']
};

describe('model.prototype.', function () {
  var user;

  beforeEach(function() {
    user = new User(attrs);
  });

  afterEach(function() {
    user = null;
  });


  describe('save', function() {

    it('should update attributes when saved successfully', function(done){
      // stubbed out save
      user.model.sync.save = function(fn) {
        fn(null, { id : 'abc', password : 'test123' });
      };

      user.save(function(err) {
        assert(!err);
        assert(user.primary() == 'abc');
        assert(user.password() == 'test123');
        assert(Object.keys(user.dirty).length === 0);
        done();
      });

    });

    it('should not update attributes when save is unsuccessful', function(done){
      // stubbed out save
      user.model.sync.save = function(fn) {
        fn(new Error('some err'), { id : 'abc', password : 'test123' });
      };

      user.save(function(err) {
        assert(err);
        assert(!user.primary());
        assert('test' === user.password());
        assert(user.isNew());
        done();
      });

    });

  });

});
