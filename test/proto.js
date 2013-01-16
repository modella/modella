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
  notes : ['reading', 'javascript', 'travel']
};

describe('model.prototype.', function () {
  var user;

  beforeEach(function() {
    user = new User(attrs);
  });

  describe('save', function() {

    it('should update attributes when saved successfully', function(done){
      // stubbed out save
      user.model.sync.save = function(fn) {
        console.log('here......');
        fn(null, {});
      };

      user.save(function(err, user) {
        console.log('cool');
        done();
      });

    });

    it('should update attributes when saved successfully', function(done){
      // stubbed out save

      user.save(function(err, user) {
        console.log('what');
        done();
      });

    });

  });

});
