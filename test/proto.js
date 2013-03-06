var model = require("../");

var User = model('User')
  .attr('id', { type: 'number' })
  .attr('name', { type: 'string' })
  .attr('age', { type: 'number' });

describe('Model#<attr>(value)', function() {
  var user;

  beforeEach(function() {
    user = new User({name: 'Tobi', age: 22});
  });

  it('returns itself', function() {
    user.name('Bob').should.eq(user);
  });

  it('sets a value', function() {
    user.name('Bob');
    user.name().should.eq('Bob');
  });

  it('emits "change <attr>" events', function(done){
    user.on('change name', function(newVal, old) {
      newVal.should.eq('Bob');
      old.should.eq('Tobi');
      done();
    });

    user.name('Bob');
  });

  it('emits "change" events', function(done) {
    user.on('change', function(prop, newVal, old) {
      prop.should.eq('name');
      newVal.should.eq('Bob');
      old.should.eq('Tobi');
      done();
    });

    user.name('Bob');
  });
});

describe('Model#isNew()', function() {
  it('defaults to true', function() {
    var user = new User();
    user.isNew().should.eq(true)
  });

  it('is false when primary key is present', function() {
    var user = new User({id: 1});
    user.isNew().should.eq(false)
  });
});

describe('Model#model', function() {
  it('references the constructor', function() {
    var user = new User();
    user.model.should.eq(User)
  });
});

describe('Model#get(attr)', function() {
  it('returns an attr value', function() {
    var user = new User({name: 'Tobi'});
    user.get('name').should.eq('Tobi');
  });
});

describe('Model#has(attr)', function() {
  var user;

  beforeEach(function() {
    user = new User({name: 'Tobi'});
  });

  it('returns true if the object has the attr', function() {
    user.has('name').should.eq(true)
  });

  it('returns false if the object doesn\'t have the attr', function() {
    var user = new User();
    user.has('age').should.eq(false)
  });
});

describe('Model#remove()', function() {
  var syncMock = {
    remove: function(callback) {
      callback();
    }
  };

  var syncRemove = sinon.spy(syncMock, 'remove');

  it('throws an error if it\'s new', function(done) {
    var user = new User;
    user.remove(function(err) {
      err.message.should.eq('not saved');
      done();
    });
  });

  it('calls Model.sync#remove', function(done) {
    User.sync = syncMock
    var user = new User({id: 123});
    user.remove(function() {
      syncRemove.should.have.been.calledOnce;
      done()
    });
  });

  describe('with error from sync', function() {
    var user,
        error = new Error("Some error");

    beforeEach(function() {
      User.sync = {
        remove: function(cb) {
          cb(error);
        }
      };
      user = new User({id: 123});
    });

    it('emits "error"', function(done) {
      user.on('error', function(err) {
        err.should.eq(error);
        done();
      });
      user.remove()
    });
  });

  describe('with success from sync', function() {
    var user;

    beforeEach(function() {
      User.sync = syncMock
      user = new User({id: 123});
    });

    it('sets removed to true', function(done) {
      user.on('remove', function() {
        user.removed.should.eq(true)
        done()
      });
      user.remove();
    });

    it('emits "remove"', function(done) {
      user.on('remove', done);
      user.remove();
    });

    it('emits "removing"', function(done) {
      user.on('removing', function(obj) {
        obj.should.eq(user);
        done()
      });
      user.remove();
    });

    it('emits "remove" on the constructor', function(done) {
      User.on('remove', function(obj) {
        obj.should.eq(user);
        done()
      });
      user.remove();
    });
  });
});

describe("Model#save()", function() {
  var user,
      pet                , 
      Pet = model('Pet') , 
      syncSave                     , 
      syncUpdate                   , 
      syncMock = {
        save: function(callback) {
          callback(null, { id : '100', name : 'someguy' });
        },
        update: function(callback) {
          callback();
        }
      };

  beforeEach(function() {
    User.sync = syncMock;
    user = new User();
    pet = new Pet();
    syncSave   = sinon.spy(syncMock, 'save'),
    syncUpdate = sinon.spy(syncMock, 'update');
  });

  afterEach(function() {
    syncSave.restore();
    syncUpdate.restore();
  });

  it("runs validations", function (done) {
    User.sync = syncMock;
    var user     = new User,
        validate = sinon.spy(user, 'validate');

    user.save(function() {
      validate.should.have.been.called;
      done();
    });
  });

  describe("when valid", function() {
    it('emits "save"', function(done) {
      user.once('save', done);
      user.save();
    });

    it('emits "saving"', function(done) {
      user.once('saving', function(obj) {
        obj.should.eq(user);
        done()
      });
      user.save();
    });

    it('emits "save" on the constructor', function(done) {
      User.sync = syncMock;
      User.once('save', function(obj) {
        obj.should.eq(user);
        done()
      });
      user.save();
    });

    it('emits "saving" on the constructor', function(done) {
      Pet.once('saving', function(obj) {
        obj.should.eq(pet);
        done()
      });
      pet.save();
    });

    it('updates attributes based on syncs response', function(done) {
      user.save(function() {
        user.name().should.eq('someguy')
        user.id().should.eq('100')
        done()
      });
    });

    it('doesn\'t update attributes if sync fails', function(done) {
      user.name('dave');

      User.sync = {
        save: function(cb) {
          cb(new Error("Some Error"), {name: "Robert"});
        }
      }

      user.save(function() {
        user.name().should.eq('dave');
        done();
      });
    });

    describe('and new', function() {
      it('calls Model.sync#save', function(done) {
        user.save(function() {
          syncSave.should.have.been.calledOnce;
          done()
        });
      });
    });
    describe("when old", function() {
      it('calls Model.sync#update', function(done) {
        User.sync = syncMock;
        var user = new User({id: 123});
        user.name('Bob');
        user.save(function() {
          syncUpdate.should.have.been.calledOnce;
          done()
        });
      });
    });
  });
  describe("when invalid", function() {
    beforeEach(function() {
      Pet = model('Pet').attr('id').attr('name')
      pet = new Pet();
      pet.isValid = function() { return false; }
    });

    it("should not call Model.sync#save", function(done) {
      pet.save(function() {
        syncSave.should.not.have.been.called
        done()
      });
    });

    it("should pass the error to the callback", function(done) {
      pet.save(function(err) {
        err.message.should.eq('validation failed');
        done()
      });
    });
  });

  describe("Model#url(path)", function() {
    var user;
    beforeEach(function() {
      user = new User;
      user.id(5);
    });

    it("uses the model id", function() {
      user.url().should.eq('/user/5');
    });

    it("passes along the path", function() {
      user.url('edit').should.eq('/user/5/edit');
    });
  });

  describe("Model#toJSON()", function() {
    it('returns a JSON object', function() {
      var user = new User({name: 'Tobi', age: 2});
      var obj = user.toJSON();
      obj.name.should.eq('Tobi');
      obj.age.should.eq(2);
    });
  });

  describe('Model#isValid()', function() {
    var User = model('User')
      .attr('name')
      .attr('email');

    User.validate(function(user){
      if (!user.has('name')) user.error('name', 'name is required');
    });

    User.validate(function(user){
      if (!user.has('email')) user.error('email', 'email is required');
    });

    it('populates #errors', function() {
      user = new User;
      user.isValid();

      user.errors.length.should.eq(2);

      user.errors[0].attr.should.eq('name');
      user.errors[1].attr.should.eq('email');
      
      user.errors[0].message.should.eq('name is required');
      user.errors[1].message.should.eq('email is required');
    });

    it('returns false when invalid', function() {
      user = new User;
      user.isValid().should.eq(false);
    });

    it('returns true when valid', function() {
      user = new User({name: 'Tobi', email: 'tobi@hello.com'});
      user.isValid().should.eq(true);
    });
  });
});








