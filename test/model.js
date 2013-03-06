var model = require("../");

var User = model('User')
    .attr('id', { type: 'number' })
    .attr('name', { type: 'string' })
    .attr('age', { type: 'number' });


describe('model(name)', function() {
  it('returns a new model constructor', function(){
    var Something = model('Something');
    Something.should.be.a('function');
  });
});

describe('new Model(attrs)', function() {
  it('populates the attrs', function() {
    var user = new User({name: 'Tobi', age: 22});
    user.name().should.eq('Tobi');
    user.age().should.eq(22);
  });
});

describe('Model(attrs)', function() {
  it('populates the attrs', function() {
    var user = User({name: 'Tobi', age: 22});
    user.name().should.eq('Tobi');
    user.age().should.eq(22);
  });
});

