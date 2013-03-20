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
  .attr('name', { type: 'string' })
  .attr('age', { type: 'number' });

User.useSync({});

/**
 * Test proto
 */

describe('Model#<attr>(value)', function() {
  var user;

  beforeEach(function() {
    user = new User({name: 'Tobi', age: 22});
  });

  it('returns itself', function() {
    expect(user.name('Bob')).to.equal(user);
  });

  it('sets a value', function() {
    user.name('Bob');
    expect(user.name()).to.equal('Bob');
  });

  it('emits "change <attr>" events', function(done){
    user.on('change name', function(newVal, old) {
      expect(newVal).to.equal('Bob');
      expect(old).to.equal('Tobi');
      done();
    });

    user.name('Bob');
  });

  it('emits "change" events', function(done) {
    user.on('change', function(prop, newVal, old) {
      expect(prop).to.equal('name');
      expect(newVal).to.equal('Bob');
      expect(old).to.equal('Tobi');
      done();
    });

    user.name('Bob');
  });
});

describe('Model#set(attrs)', function() {
  it('should set multiple attributes', function() {
    var user = new User();
    user.set({
      name : 'matt',
      age : 23
    });
    expect(user.name()).to.equal('matt');
    expect(user.age()).to.equal(23);
  });

  it('should ignore attributes not in schema', function(){
    var user = new User();
    user.set({ omg : 'lol' });
    expect(user.omg).to.be(undefined);
  });
});

describe('Model#isNew()', function() {
  it('defaults to true', function() {
    var user = new User();
    debugger;
    expect(user.isNew()).to.equal(true);
  });

  it('is false when primary key is present', function() {
    var user = new User({ id: 1 });
    expect(user.isNew()).to.equal(false);
  });
});

describe('Model#model', function() {
  it('references the constructor', function() {
    var user = new User();
    expect(user.model).to.equal(User);
  });
});

describe('Model#get(attr)', function() {
  it('returns an attr value', function() {
    var user = new User({ name: 'Tobi' });
    expect(user.get('name')).to.equal('Tobi');
  });
});

describe('Model#has(attr)', function() {
  var user;

  beforeEach(function() {
    user = new User({ name: 'Tobi' });
  });

  it('returns true if the object has the attr', function() {
    expect(user.has('name')).to.equal(true);
  });

  it('returns false if the object doesn\'t have the attr', function() {
    var user = new User();
    expect(user.has('age')).to.equal(false);
  });
});

describe('Model#remove()', function() {
  function remove(fn) {
    return fn();
  }

  it('throws an error if it\'s new', function(done) {
    var user = new User();
    user.remove(function(err) {
      expect(err.message).to.equal('not saved');
      done();
    });
  });

  it('calls Model._sync#remove', function(done) {
    var user = new User({id: 123});
    user.model._sync.remove = remove;
    user.remove(done);
  });


  describe('with error from sync', function() {
    var error = new Error('some error');

    function remove(fn) {
      return fn(error);
    }

    it('emits "error"', function(done) {
      var user = new User({ id : 123 });
      user.model._sync.remove = remove;
      user.on('error', function(err) {
        expect(err).to.equal(error);
        done();
      });
      user.remove();
    });
  });

  describe('with success from sync', function() {
    var user;

    function remove(fn) {
      fn();
    }

    beforeEach(function() {
      user = new User({id: 123});
      user.model._sync.remove = remove;
    });

    it('sets removed to true', function(done) {
      user.on('remove', function() {
        expect(user.removed).to.equal(true);
        done();
      });
      user.remove();
    });

    it('emits "remove"', function(done) {
      user.on('remove', done);
      user.remove();
    });

    it('emits "removing"', function(done) {
      user.on('removing', function(obj) {
        expect(obj).to.equal(user);
        done();
      });
      user.remove();
    });

    it('emits "remove" on the constructor', function(done) {
      User.once('remove', function(obj) {
        expect(obj).to.equal(user);
        done();
      });
      user.remove();
    });

    it('emits "removing" on the constructor', function(done) {
      User.once('removing', function(obj) {
        expect(obj).to.equal(user);
        done();
      });
      user.remove();
    });
  });

});

describe("Model#save()", function() {
  var user;

  function save(fn) {
    fn(null, { id : '100', name : 'someguy' });
  }

  beforeEach(function() {
    user = new User();
    user.model._sync.save = save;
  });

  it("runs validations", function (done) {
    user.validate = function() {
      done();
    };
    user.save();
  });

  describe("when valid", function() {
    it('emits "save"', function(done) {
      user.once('save', done);
      user.save();
    });

    it('emits "saving"', function(done) {
      user.once('saving', function(obj) {
        expect(obj).to.equal(user);
        done();
      });
      user.save();
    });

    it('emits "save" on the constructor', function(done) {
      User.once('save', function(obj) {
        expect(obj).to.equal(user);
        done();
      });
      user.save();
    });

    it('emits "saving" on the constructor', function(done) {
      User.once('saving', function(obj) {
        expect(obj).to.equal(user);
        done();
      });
      user.save();
    });

    it('updates attributes based on syncs response', function(done) {
      user.save(function() {
        expect(user.name()).to.equal('someguy');
        expect(user.id()).to.equal('100');
        done();
      });
    });

    it('doesn\'t update attributes if sync fails', function(done) {
      user.name('dave');

      user.model._sync.save = function(fn) {
        fn(new Error('some error'), { name : 'robbay'});
      };

      user.save(function() {
        expect(user.name()).to.equal('dave');
        done();
      });
    });

    describe('when new', function() {
      it('calls Model._sync#save', function(done) {
        user.model._sync.save = function(fn) { fn(); };
        user.save(done);
      });
    });

    describe("when old", function() {
      it('calls Model._sync#update', function(done) {
        var user = new User({ id: 123, name: 'Bob' });
        user.model._sync.update = function(fn) { fn(); };
        user.save(done);
      });
    });
  });

  describe("when invalid", function() {
    beforeEach(function() {
      user.isValid = function() { return false; };
    });

    it("should not call Model._sync#save", function(done) {
      var called = false;
      user.model._sync.save = function() {
        called = true;
      };

      user.save(function() {
        expect(called).to.be(false);
        done();
      });
    });

    it("should pass the error to the callback", function(done) {
      user.save(function(err) {
        expect(err.message).to.equal('validation failed');
        done();
      });
    });
  });

  describe("Model#url(path)", function() {
    var user;

    beforeEach(function() {
      user = new User();
      user.id(5);
    });

    it("uses the model id", function() {
      expect(user.url()).to.equal('/user/5');
    });

    it("passes along the path", function() {
      expect(user.url('edit')).to.equal('/user/5/edit');
    });
  });

  describe("Model#toJSON()", function() {
    it('returns a JSON object', function() {
      var user = new User({ name: 'Tobi', age: 2 });
      var obj = user.toJSON();
      expect(obj.name).to.equal('Tobi');
      expect(obj.age).to.equal(2);
    });

    it('should clone, not reference the object', function() {
      var json = { name : 'matt' };
      var user = new User(json);
      json.name = 'ryan';
      var obj = user.toJSON();
      expect(obj.name).to.equal('matt');
    });
  });

  describe('Model#isValid()', function() {
    var User = model('User')
      .attr('name')
      .attr('email');

    User.validate(function(user){
      if (!user.has('name')) { user.error('name', 'name is required'); }
    });

    User.validate(function(user){
      if (!user.has('email')) { user.error('email', 'email is required'); }
    });

    it('populates #errors', function() {
      user = new User();
      user.isValid();

      expect(user.errors).to.have.length(2);

      expect(user.errors[0].attr).to.equal('name');
      expect(user.errors[1].attr).to.equal('email');

      expect(user.errors[0].message).to.equal('name is required');
      expect(user.errors[1].message).to.equal('email is required');
    });

    it('returns false when invalid', function() {
      user = new User();
      expect(user.isValid()).to.equal(false);
    });

    it('returns true when valid', function() {
      user = new User({name: 'Tobi', email: 'tobi@hello.com'});
      expect(user.isValid()).to.equal(true);
    });
  });
});








