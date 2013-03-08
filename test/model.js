/**
 * Module dependencies
 */

var model = require("../"),
    expect = require('expect.js');

/**
 * Tests
 */

var User = model('User')
    .attr('id', { type: 'number' })
    .attr('name', { type: 'string' })
    .attr('age', { type: 'number' });


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
});

describe('Model(attrs)', function() {
  it('populates the attrs', function() {
    var user = User({name: 'Tobi', age: 22});
    expect(user.name()).to.equal('Tobi');
    expect(user.age()).to.equal(22);
  });
});

