/**
 * Module dependencies
 */

var model = require("../");
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

describe('model(name)', function() {
  it('returns a new model constructor', function(){
    var Something = model('Something');
    assert('function' == typeof Something);
  });
});

describe('new Model(attrs)', function() {
  it('populate your attrs', function() {
    var user = new User({ name: 'Tobi', age: 22 });
    assert('Tobi' == user.name);
    assert(22 === user.age);
  });

  // it('emits the initializing event on the Model', function(done) {
  //   var attributes = { name: 'Bob' },
  //       called = false;
  //   User.once('initializing', function(instance, attrs) {
  //     called = true;
  //     expect(attrs).to.eql(attributes);
  //     attrs.name = attrs.name + 'by';
  //   });
  //   var user = new User(attributes);
  //   expect(user.name()).to.be('Bobby');
  //   expect(called).to.be(true);
  //   done();
  // });

  // it('emits the initialize event on the Model', function(done) {
  //   User.once('initialize', function(passedUser) {
  //     expect(passedUser).to.be.a(User);
  //     done();
  //   });
  //   var user = new User();
  // });
});

// describe('Model(attrs)', function() {
//   it('populates the attrs', function() {
//     var user = User({ name: 'Tobi', age: 22 });
//     assert('Tobi' == user.name);
//     assert(22 == user.age);
//   });

//   it('emits the initialize event', function(done) {
//     User.once('initialize', function(passedUser) {
//       expect(passedUser).to.be.a(User);
//       done();
//     });
//     var user = User();
//   });
// });

// describe('new Model([attrs])', function() {
//   it("returns an array of Models", function() {
//     var users = new User([{name: 'Bobby'}, {name: 'Tobi'}]);
//     expect(users[0].name()).to.be('Bobby');
//     expect(users[1].name()).to.be('Tobi');
//   });
// });

// describe('Model([attrs])', function() {
//   it("returns an array of Models", function() {
//     var users = User([{name: 'Bobby'}, {name: 'Tobi'}]);
//     expect(users[0].name()).to.be('Bobby');
//     expect(users[1].name()).to.be('Tobi');
//   });
// });
