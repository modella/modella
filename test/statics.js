/**
 * Module Dependencies
 */

var model = require('../'),
    expect = require('expect.js');

/**
 * Initialize `User`
 */


var User = model('User').attr('name');

/**
 * Test statics
 */

describe('Model.sync', function() {
  it('sets the private _sync variable', function() {
    var syncMock = { name: 'syncMock' };
    User.useSync(syncMock);
    expect(User._sync).to.be(syncMock);
  });

  it('emits the syncSet event', function(done) {
    var syncMock = { name: 'syncMock' };
    User.once('syncSet', function(sync) {
      expect(sync.name).to.be('syncMock');
      done();
    });
    User.useSync(syncMock);
  });
});

describe('Model.attrs', function() {
  it('holds the defined attrs', function() {
    expect(User.attrs).to.have.property('name');
  });
});

describe('Model.attr', function() {
  it("adds a default value if specified", function() {
    var Pet = model('Pet').attr('name', {defaultValue: 'Samson'});
    expect(Pet._defaults).to.have.property('name', 'Samson');
  });

  it("causes the model to trigger the attrAdded event", function(done) {
    User.once('attrAdded', function(attr, options) {
      expect(attr).to.be('age');
      expect(options).to.have.property('defaultValue');
      done();
    });

    User.attr('age', {defaultValue: 22});
  });
});

describe("Model.validate", function() {
  var User;

  beforeEach(function() {
    User = model('User').attr('name');
  });

  it('adds the function to the validators', function() {
    User.validate(function() {});
    expect(User.validators).to.have.length(1);
  });

  it('uses the validator in Model#isValid()', function() {
    var user = new User();
    User.validate(function(obj) {
      expect(obj).to.equal(user);
    });
    user.isValid();
  });
});

describe("Model.use", function() {
  it("passes Model into a plugin function", function() {
    var plugin = function(model) {
      expect(model).to.equal(User);
    };
    User.use(plugin);
  });
});

describe("Model.all", function() {
  function all(fn) {
    return fn(null, [{ name : 'Bob' }, { name : 'Tom' }]);
  }

  beforeEach(function() {
    User = model('User').attr('name');
    User.useSync({});
    User._sync.all = all;
  });

  it("calls the sync object", function(done) {
    User._sync.all = function(fn) { fn(); };
    User.all(done);
  });

  it("returns objects from the sync layer", function(done) {
    User.all(function(err, users) {
      expect(users).to.have.length(2);
      expect(users[0].name()).to.equal('Bob');
      done();
    });
  });

  it("passes along errors", function(done) {
    User._sync.all = function(fn) {
      return fn(new Error('some err'));
    };

    User.all(function(err, users) {
      expect(err).to.be.an(Error);
      expect(err.message).to.equal('some err');
      done();
    });
  });
});

