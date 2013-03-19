/**
 * Module dependencies
 */

var model = require("../"),
    expect = require('expect.js');

/**
 * Initialize `User`
 */

var User = model('User')
    .attr('id', { type: 'number' })
    .attr('name', { type: 'string', defaultValue: "Bobby" })
    .attr('age', { type: 'number' });

/**
 * Test model
 */

describe('model(name)', function() {
  it('returns a new model constructor', function(){
    var Something = model('Something');
    expect(Something).to.be.a('function');
  });
});

describe('new Model(attrs)', function() {
  it('populates the attrs', function() {
    var user = new User({name: 'Tobi', age: 22});
    expect(user.name()).to.equal('Tobi');
    expect(user.age()).to.equal(22);
  });

  it('sets the default values', function() {
    var user = new User();
    expect(user.name()).to.equal('Bobby');
  });
});

describe('Model(attrs)', function() {
  it('populates the attrs', function() {
    var user = new User({name: 'Tobi', age: 22});
    expect(user.name()).to.equal('Tobi');
    expect(user.age()).to.equal(22);
  });

  it('sets the default values', function() {
    var user = new User();
    expect(user.name()).to.equal('Bobby');
  });
});

