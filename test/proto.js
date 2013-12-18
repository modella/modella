/**
 * Module dependencies
 */

var model = require("../"),
    expect = require('expect.js');

/**
 * Initialize `User`
 */

var User;

beforeEach(function() {
  User = model('User')
  .attr('id', { type: 'number' })
  .attr('name', { type: 'string' })
  .attr('age', { type: 'number' });

  User.prototype.throwError = function() {
    throw new Error("I shouldn't get called");
  };
});

/**
 * Test proto
 */

describe('Model#changed()', function(){
  it('should return a cloned object of changed attrs', function(){
    var user = new User({ name: 'baz' });
    expect(user.changed()).to.eql({});
    user.name('foo');
    expect(user.changed()).to.eql({ name: 'foo' });
    expect(user.changed()).to.not.equal(user.dirty);
  });
});

describe('Model#changed(attr)', function(){
  it('should return a boolean if attr was changed', function(){
    var user = new User({ name: 'baz' });
    expect(user.changed('name')).to.eql(false);
    user.name('foo');
    expect(user.changed('name')).to.eql(true);
  });
});

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

  it('emits "change:<attr>" events', function(done){
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

  it('marks the attr as dirty', function() {
    user.name('Bob');
    expect(user.changed('name')).to.be(true);
  });

  describe('with the same value', function() {
    it("doesn't mark it as dirty", function() {
      user.name('Tobi');
      expect(user.changed('name')).to.be(false);
    });
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

  it('should not call methods with the same name', function(){
    var user = new User();
    user.set({ throwError : 'lol' });
  });

  it('emits setting on the Model', function(){
    var user = new User();
    User.once('setting', function(user, attrs) {
      attrs.name = 'ryan';
    });
    user.set({ name : 'matt' });
    expect(user.name()).to.be('ryan');
  });

  it('emits setting on the instance', function(){
    var user = new User();
    user.once('setting', function(attrs) {
      attrs.name = 'ryan';
    });
    user.set({ name : 'matt' });
    expect(user.name()).to.be('ryan');
  });
});

describe('Model#isNew()', function() {
  it('defaults to true', function() {
    var user = new User();
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

  it('calls Model.remove', function(done) {
    var user = new User({id: 123});
    user.model.remove = remove;
    user.remove(done);
  });

  describe('with error', function() {
    var error = new Error('some error');

    function remove(fn) {
      return fn(error);
    }

    it('emits "error"', function(done) {
      var user = new User({ id : 123 });
      user.model.remove = remove;
      user.on('error', function(err) {
        expect(err).to.equal(error);
        done();
      });
      user.remove();
    });
  });

  describe('with success', function() {
    var user;

    function remove(fn) {
      fn();
    }

    beforeEach(function() {
      user = new User({id: 123});
      user.model.remove = remove;
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

    it('doesn\'t validate on "removing"', function(done) {
      User.validate(function(user) {
        user.error('name', 'is required');
      })

      user.on('removing', function(obj, fn) {
        user.error('age', 'is required');
        fn();
      });

      user.remove(function(err) {
        expect(!err);
        done();
      });
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
    user.model.save = save;
  });

  it("runs validations", function (done) {
    var called = false;
    user.validate = function() {
      called = true;
    };
    user.save(function() {
      expect(called).to.be(true);
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
        expect(obj).to.equal(user);
        done();
      });
      user.save();
    });

    it('validates on saving events', function(done) {
      user.once('saving', function(obj, fn) {
        setTimeout(function() {
          obj.errors.push(new Error('not valid'));
          fn();
        }, 10);
      });

      user.once('saving', function(obj, fn) {
        setTimeout(function() {
          obj.errors.push(new Error('other not valid'));
          fn();
        }, 15);
      });

      user.save(function(err) {
        expect(err.message).to.equal('validation failed');
        expect(user.errors.length).to.equal(1); // run('saving') callsback on the first error
        expect(user.errors[0].message).to.equal('not valid');
        done();
      });
    });

    it('validates .validate on saving event', function(done) {
      User.validate(function(user) {
        if(!user.name()) {
          user.error('name', "is required");
        }
      });

      User.validate(function(user) {
        if(!user.age()) {
          user.error('age', "is required");
        }
      });

      User.once('saving', function(obj, fn) {
        obj.name(null);
        fn();
      });

      var user = new User({name: 'marie', age: 30});
      user.model.save = save;

      user.save(function(err) {
        expect(err.message).to.equal('validation failed');
        expect(user.errors.length).to.equal(1); // run('saving') callsback on the first error
        expect(user.errors[0].message).to.equal('is required');
        expect(user.errors[0].attr).to.equal('name');
        done();
      });
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

    it('updates attributes based on save response', function(done) {
      user.save(function() {
        expect(user.name()).to.equal('someguy');
        expect(user.id()).to.equal('100');
        done();
      });
    });

    it('doesn\'t update attributes if save fails', function(done) {
      user.name('dave');

      user.model.save = function(fn) {
        fn(new Error('some error'), { name : 'robbay'});
      };

      user.save(function() {
        expect(user.name()).to.equal('dave');
        done();
      });
    });

    describe('when new', function() {
      it('calls Model.save', function(done) {
        user.model.save = function(fn) { fn(); };
        user.save(done);
      });
    });

    describe("when old", function() {
      it('calls Model.update', function(done) {
        var user = new User({ id: 123, name: 'Bob' });
        user.model.update = function(fn) { fn(); };
        user.save(done);
      });
    });
  });

  describe("when invalid", function() {
    beforeEach(function() {
      user.isValid = function() { return false; };
    });

    it("should not call Model.save", function(done) {
      var called = false;
      user.model.save = function() {
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

    describe('when invalid', function() {
      beforeEach(function() {
        user = new User();
      });

      it('returns false', function() {
        expect(user.isValid()).to.equal(false);
      });

      it('emits invalid on the model', function(done) {
        User.once('invalid', function(instance, errors) {
          expect(user).to.be(instance);
          expect(errors).to.be.a(Array);
          done();
        });
        user.isValid();
      });

      it('emits invalid on the instance', function(done) {
        user.once('invalid', function(errors) {
          expect(this).to.be(user);
          expect(errors).to.be.a(Array);
          done();
        });
        user.isValid();
      });

    });

    describe('when valid', function() {
      beforeEach(function() {
        user = new User({name: 'Tobi', email: 'tobi@hello.com'});
      });

      it('returns true', function() {
        expect(user.isValid()).to.equal(true);
      });

      it('emits valid on the model', function(done) {
        User.once('valid', function(instance, errors) {
          expect(user).to.be(instance);
          expect(errors).to.be(null);
          done();
        });
        user.isValid();
      });

      it('emits valid on the instance', function(done) {
        user.once('valid', function(errors) {
          expect(this).to.be(user);
          expect(errors).to.be(null);
          done();
        });
        user.isValid();
      });
    });
  });
});
