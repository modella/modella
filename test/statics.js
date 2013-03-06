var modella = require('../'),
    User = modella('User').attr('name');

describe('Model.attrs', function() {
  it('holds the defined attrs', function() {
    User.attrs.should.have.property('name')
  });
});

describe("Model.validate", function() {
  var validator = sinon.spy();
  User.validate(validator);

  it('adds the function to the validators', function() {
    User.validators.should.have.length(1);
  });

  it('uses the validator in Model#isValid()', function() {
    var user = new User();
    user.name('Bob');
    user.isValid();
    validator.should.have.been.calledWith(user);
  });
});

describe("Model.use", function() {
  var plugin = sinon.spy();

  it("passes Model into a plugin function", function() {
    User.use(plugin);
    plugin.should.have.been.calledWith(User);
  });
});

describe("Model.all", function() {
  var syncMock = {
    all: function(cb) {
      cb(null, [{name: 'Bob'}, {name: 'Tom'}]);
    }
  };

  var syncAll;

  beforeEach(function() {
    User.sync = syncMock;
    syncAll = sinon.spy(syncMock, 'all');
  });

  afterEach(function() {
    syncAll.restore();
  });

  it("calls the sync object", function(done) {
    User.all(function() {
      syncAll.should.have.been.calledOnce
      done();
    });
  });

  it("returns objects from the sync layer", function(done) {
    User.all(function(err, users) {
      users.should.have.length(2);
      users[0].name().should.eq('Bob');
      done();
    });
  });
  
  it("passes along errors", function(done) {
    var syncMock = { all: function(cb) { cb(new Error("Something bad happened"), null) } };
    User.sync = syncMock;

    User.all(function(err, users) {
      err.should.exist;
      err.message.should.eq("Something bad happened");
      done();
    });
  });
});

