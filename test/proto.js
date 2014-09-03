/**
 * Module Dependencies
 */

var assert = require('assert');
var model = require('../');

/**
 * Tests
 */

describe('Proto', function() {
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

  describe('Model#changed([attr])', function() {
    it('should record changed attributes', function(){
      var user = new User({ name: 'matt' });
      assert(0 == Object.keys(user.changed()).length);
      user.name = 'ryan';
      assert('ryan' == user.changed().name);
      // cloned
      assert(user.dirty != user.changed());
    });

    it('should return a boolean if attr was changed', function(){
      var user = new User({ name: 'matt' });
      assert(!user.changed('name'));
      user.name = 'ryan';
      assert(user.changed('name'));
    });

    it('should not mark dirty if changed is same', function() {
      var user = new User({ name: 'matt' });
      assert(!user.changed('name'));
      user.name = 'matt';
      assert(!user.changed('name'));
    })
  });

  describe('Model#<attr>', function() {
    var user;

    beforeEach(function() {
      user = new User({ name: 'Tobi', age: 22 });
    });

    it('should set a value', function() {
      user.name = 'Bob';
      assert('Bob' == user.name);
    });

    it('should emits "change <attr>" events', function(){
      var called = 0;

      user.on('change name', function(val, prev) {
        assert('Bob' == val);
        assert('Tobi' == prev);
        called++;
      });

      user.name = 'Bob';
      assert(called);
    });

    it('should emits "change" events', function() {
      var called = 0;

      user.on('change', function(prop, val, prev) {
        assert('name' == prop);
        assert('Tobi' == prev);
        assert('Bob' == val);
        called++;
      });

      user.name = 'Bob';
      assert(called);
    });

    it('should not emit "change" events if the value didnt change', function() {
      var called = 0;

      user.on('change', function(prop, val, prev) {
        called++;
      });

      user.on('change name', function(val, prev) {
        called++;
      });

      user.name = 'Tobi';
      assert(!called);
    })
  });

  describe('Model#set(attrs)', function() {
    var user;

    beforeEach(function() {
      user = new User({ name: 'Tobi', age: 22 });
    });

    it('should set multiple attributes', function() {
      user.set({
        name : 'matt',
        age : 25
      });

      assert(25 == user.age);
      assert('matt' == user.name);
      assert(user.changed('name'))
      assert(user.changed('age'))
    });

    it('should ignore attributes not in schema', function(){
      var user = new User();
      user.set({ omg : 'lol' });
      assert(undefined == user.omg);
    });

    it('should not call methods with the same name', function(){
      var user = new User();
      user.set({ isNew: 'lol' });
      assert('function' == typeof user.isNew);
    });
  });

  describe('Model#isNew()', function() {
    var user;

    it('should default to true', function() {
      var user = new User();
      assert(user.isNew());
    });

    it('should be false when primary key is present', function() {
      var user = new User({ id: 1 });
      assert(!user.isNew());
    });

    it('should be false when primary key is present and mongo-like', function() {
      User = model('user').attr('_id');
      var user = new User({ _id: 1 });
      assert(!user.isNew());
    });
  });

  describe('Model#json', function() {

    it('should return an empty object', function() {
      var User = model('user');
      var user = new User();
      assert('{}' == JSON.stringify(user.json))
    });

    it('should return a cloned copy of the attributes', function() {
      var User = model('user').attr('settings');
      var user = new User();
      user.settings = { theme: 'red' };
      // console.log(user);
      var settings = user.json.settings;
      settings.theme = 'blue';
      assert('red' == user.json.settings.theme);
    })
  })

  describe('Model#primary', function() {
    it('should get the primary key', function() {
      var User = model('user').attr('_id');
      var user = User({ _id: 5 })
      assert(5 == user.primary);
    })

    it('should set the primary key', function() {
      var User = model('user').attr('_id');
      var user = User({ _id: 5 })
      user.primary = 6;
      assert(user.changed('_id'));
      assert(6 == user.attrs._id);
    })
  })

  describe('Model#save', function() {
    it('should pass values through', function(done) {
      var User = model('user').attr('id').attr('name');
      var user = new User()
      user.name = 'matt';

      User.sync.create = function (opts, fn) {
        assert('matt' == this.name);
        assert(true == opts.overwrite);
        return fn(null, { id: 10 });
      };

      user.save({ overwrite: true }, function(err, obj) {
        assert(!err);
        assert(obj == user);
        assert(10 == user.primary);
        done();
      });
    });

    it('should support generators', function(done) {
      var User = model('user').attr('id').attr('name');

      User.sync.create = function *(opts) {
        assert('red' == opts.theme);
        assert('matt' == this.name);
        return { id: 10 };
      };

      var user = new User()
      user.name = 'matt';

      user.save({ theme: 'red' }, function(err, obj) {
        assert(!err);
        assert(obj == user);
        assert(10 == user.primary);
        done();
      });
    });

    it('should support hooks', function(done) {
      var User = model('user')
        .attr('id')
        .attr('name')
        .attr('age');

      User.sync.create = function *(opts) {
        assert('matt' == this.name);
        return { id: 10 };
      };

      var user = new User()
      user.name = 'matt';

      user.hook('creating', function(obj) {
        console.log(this);
        assert(this == user);
      })

      user.save({ theme: 'red' }, function(err, obj) {
        assert(!err);
        assert(obj == user);
        assert(10 == user.primary);
        done();
      });
    })
  })
});



//  */
// /**
//  * Module dependencies

// var assert = require('assert');
// var model = require("../");

// /**
//  * Initialize `User`
//  */

// var User;

// beforeEach(function() {
//   User = model('User')
//     .attr('id', { type: 'number' })
//     .attr('name', { type: 'string' })
//     .attr('age', { type: 'number' });

//   User.prototype.throwError = function() {
//     throw new Error("I shouldn't get called");
//   };
// });

// /**
//  * Test proto
//  */

// describe('Model#changed()', function(){
//   it('should return a cloned object of changed attrs', function(){
//     var user = new User({ name: 'baz' });
//     assert(0 == Object.keys(user.changed()).length);
//     user.name = 'foo';
//     assert('foo' == user.changed().name);
//     assert(user.dirty != user.changed());
//   });
// });

// describe('Model#changed(attr)', function(){
//   it('should return a boolean if attr was changed', function(){
//     var user = new User({ name: 'baz' });
//     assert(false == user.changed('name'));
//     user.name = 'foo';
//     assert(true == user.changed('name'));
//   });
// });

// describe('Model#<attr>(value)', function() {
//   var user;

//   beforeEach(function() {
//     user = new User({ name: 'Tobi', age: 22 });
//   });

//   it('sets a value', function() {
//     user.name = 'Bob';
//     assert('Bob' == user.name);
//   });

//   it('emits "change:<attr>" events', function(done){
//     user.on('change name', function(val, prev) {
//       assert('Bob' == val);
//       assert('Tobi' == prev);
//       done();
//     });

//     user.name = 'Bob';
//   });

//   it('emits "change" events', function(done) {
//     user.on('change', function(prop, val, prev) {
//       assert('name' == prop);
//       assert('Tobi' == prev);
//       assert('Bob' == val);
//       done();
//     });

//     user.name = 'Bob';
//   });

//   it('marks the attr as dirty', function() {
//     user.name = 'Bob';
//     assert(true == user.changed('name'));
//   });

//   describe('with the same value', function() {
//     it("doesn't mark it as dirty", function() {
//       user.name = 'Tobi';
//       assert(false == user.changed('name'));
//     });
//   });
// });

// describe('Model#isNew()', function() {
//   var user;

//   it('defaults to true', function() {
//     var user = new User();
//     assert(true == user.isNew());
//   });

//   it('is false when primary key is present', function() {
//     var user = new User({ id: 1 });
//     assert(false == user.isNew());
//   });
// });

// describe('Model#model', function() {
//   it('references the constructor', function() {
//     var user = new User();
//     assert(User == user.model);
//   });
// });

// // describe('Model#get(attr)', function() {
// //   it('returns an attr value', function() {
// //     var user = new User({ name: 'Tobi' });
// //     assert('Tobi')
// //     expect(user.get('name')).to.equal('Tobi');
// //   });
// // });

// // describe('Model#has(attr)', function() {
// //   var user;

// //   beforeEach(function() {
// //     user = new User({ name: 'Tobi' });
// //   });

// //   it('returns true if the object has the attr', function() {
// //     expect(user.has('name')).to.equal(true);
// //   });

// //   it('returns false if the object doesn\'t have the attr', function() {
// //     var user = new User();
// //     expect(user.has('age')).to.equal(false);
// //   });
// // });

// describe('Model#remove()', function() {
//   function remove(fn) {
//     return fn();
//   }

//   it('throws an error if it\'s new', function(done) {
//     var user = new User();
//     user.remove(function(err) {
//       assert('not saved' == err.message);
//       done();
//     });
//   });

//   it('calls Model.remove', function(done) {
//     var user = new User({ id: 123 });
//     user.model.remove = remove;
//     user.remove(done);
//   });

//   describe('with error', function() {
//     var error = new Error('some error');

//     function remove(fn) {
//       return fn(error);
//     }

//     it('passes the error back', function(done) {
//       var user = new User({ id : 123 });
//       user.model.remove = remove;
//       user.remove(function(err) {
//         assert(err == error);
//         done();
//       })
//     })

//     it('emits "error"', function(done) {
//       var user = new User({ id : 123 });
//       user.model.remove = remove;

//       user.on('error', function(err) {
//         assert(err == error);
//         done();
//       });

//       user.remove();
//     });
//   });

//   describe('with success', function() {
//     var user;

//     function remove(fn) {
//       fn();
//     }

//     beforeEach(function() {
//       user = new User({ id: 123 });
//       user.model.remove = remove;
//     });

//     it('sets removed to true', function(done) {
//       user.on('remove', function() {
//         assert(true == user.removed);
//         done();
//       });

//       user.remove();
//     });

//     it('emits "remove"', function(done) {
//       user.on('remove', done);
//       user.remove();
//     });

//     it('emits "removing" on model', function(done) {
//       User.on('removing', function(obj, next) {
//         assert(obj == user);
//         assert(obj instanceof User);
//         next(null);
//       });

//       User.on('removing', function(obj) {
//         done()
//       });

//       user.remove();
//     });

//     it('emits "removing" on model (async)', function(done) {
//       var called = false;

//       User.on('removing', function(obj, next) {
//         assert(obj == user);
//         setTimeout(function() {
//           called = true;
//           next(null);
//         }, 50);
//       });

//       user.remove(function() {
//         done();
//       });
//     })

//     it('emits "removing" on instance', function(done) {
//       user.on('removing', function(next) {
//         next();
//       });
//       user.remove(function(err) {
//         assert(!err);
//         done();
//       });
//     });

//     it('doesn\'t validate on "removing"', function(done) {
//       User.validate(function(user) {
//         user.error('name', 'is required');
//       });

//       user.on('removing', function(fn) {
//         user.error('age', 'is required');
//         fn();
//       });

//       user.remove(function(err) {
//         expect(!err);
//         done();
//       });
//     });

//     it('emits "remove" on the constructor', function(done) {
//       User.once('remove', function(obj) {
//         expect(obj).to.equal(user);
//         done();
//       });
//       user.remove();
//     });

//     it('emits "removing" on the constructor', function(done) {
//       User.once('removing', function(obj) {
//         expect(obj).to.equal(user);
//         done();
//       });
//       user.remove();
//     });
//   });

// });

// describe("Model#save()", function() {
//   var user;

//   function save(fn) {
//     fn(null, { id : '100', name : 'someguy' });
//   }

//   beforeEach(function() {
//     user = new User();
//     user.model.save = save;
//   });

//   it("runs validations", function (done) {
//     var called = false;
//     user.validate = function() {
//       called = true;
//     };
//     user.save(function() {
//       expect(called).to.be(true);
//       done();
//     });
//   });

//   describe("when valid", function() {
//     it('emits "save"', function(done) {
//       user.once('save', done);
//       user.save();
//     });

//     it('emits "saving" on model', function(done) {
//       User.once('saving', function(obj, next) {
//         expect(obj).to.equal(user);
//         expect(next).to.be.a('function');
//         done();
//       });
//       user.save();
//     });

//     it('emits "saving" on instance', function(done) {
//       user.once('saving', function(next) {
//         expect(next).to.be.a('function');
//         done();
//       });
//       user.save();
//     });

//     it('validates on saving events', function(done) {
//       user.once('saving', function(next) {
//         setTimeout(function() {
//           user.errors.push(new Error('not valid'));
//           next();
//         }, 10);
//       });

//       user.once('saving', function(obj, fn) {
//         setTimeout(function() {
//           obj.errors.push(new Error('other not valid'));
//           fn();
//         }, 15);
//       });

//       user.save(function(err) {
//         expect(err.message).to.equal('validation failed');
//         expect(user.errors.length).to.equal(1); // run('saving') callsback on the first error
//         expect(user.errors[0].message).to.equal('not valid');
//         done();
//       });
//     });

//     it('validates .validate on saving event', function(done) {
//       User.validate(function(user) {
//         if(!user.name()) {
//           user.error('name', "is required");
//         }
//       });

//       User.validate(function(user) {
//         if(!user.age()) {
//           user.error('age', "is required");
//         }
//       });

//       User.once('saving', function(obj, fn) {
//         obj.name(null);
//         fn();
//       });

//       var user = new User({name: 'marie', age: 30});
//       user.model.save = save;

//       user.save(function(err) {
//         expect(err.message).to.equal('validation failed');
//         expect(user.errors.length).to.equal(1); // run('saving') callsback on the first error
//         expect(user.errors[0].message).to.equal('is required');
//         expect(user.errors[0].attr).to.equal('name');
//         done();
//       });
//     });

//     it('emits "save" on the constructor', function(done) {
//       User.once('save', function(obj) {
//         expect(obj).to.equal(user);
//         done();
//       });
//       user.save();
//     });

//     it('emits "saving" on the constructor', function(done) {
//       User.once('saving', function(obj) {
//         expect(obj).to.equal(user);
//         done();
//       });
//       user.save();
//     });

//     it('updates attributes based on save response', function(done) {
//       user.save(function() {
//         expect(user.name()).to.equal('someguy');
//         expect(user.id()).to.equal('100');
//         done();
//       });
//     });

//     it('doesn\'t update attributes if save fails', function(done) {
//       user.name('dave');

//       user.model.save = function(fn) {
//         fn(new Error('some error'), { name : 'robbay'});
//       };

//       user.save(function() {
//         expect(user.name()).to.equal('dave');
//         done();
//       });
//     });

//     describe('when new', function() {
//       it('calls Model.save', function(done) {
//         user.model.save = function(fn) { fn(); };
//         user.save(done);
//       });
//     });

//     describe("when old", function() {
//       it('calls Model.update', function(done) {
//         var user = new User({ id: 123, name: 'Bob' });
//         user.model.update = function(fn) { fn(); };
//         user.save(done);
//       });
//     });
//   });

//   describe("when invalid", function() {
//     beforeEach(function() {
//       user.isValid = function() { return false; };
//     });

//     it("should not call Model.save", function(done) {
//       var called = false;
//       user.model.save = function() {
//         called = true;
//       };

//       user.save(function() {
//         expect(called).to.be(false);
//         done();
//       });
//     });

//     it("should pass the error to the callback", function(done) {
//       user.save(function(err) {
//         expect(err.message).to.equal('validation failed');
//         done();
//       });
//     });
//   });

//   describe("Model#toJSON()", function() {
//     it('returns a JSON object', function() {
//       var user = new User({ name: 'Tobi', age: 2 });
//       var obj = user.toJSON();
//       expect(obj.name).to.equal('Tobi');
//       expect(obj.age).to.equal(2);
//     });

//     it('should clone, not reference the object', function() {
//       var json = { name : 'matt' };
//       var user = new User(json);
//       json.name = 'ryan';
//       var obj = user.toJSON();
//       expect(obj.name).to.equal('matt');
//     });
//   });

//   describe('Model#isValid()', function() {
//     var User = model('User')
//       .attr('name')
//       .attr('email');

//     User.validate(function(user){
//       if (!user.has('name')) { user.error('name', 'name is required'); }
//     });

//     User.validate(function(user){
//       if (!user.has('email')) { user.error('email', 'email is required'); }
//     });

//     it('populates #errors', function() {
//       user = new User();
//       user.isValid();

//       expect(user.errors).to.have.length(2);

//       expect(user.errors[0].attr).to.equal('name');
//       expect(user.errors[1].attr).to.equal('email');

//       expect(user.errors[0].message).to.equal('name is required');
//       expect(user.errors[1].message).to.equal('email is required');
//     });

//     describe('when invalid', function() {
//       beforeEach(function() {
//         user = new User();
//       });

//       it('returns false', function() {
//         expect(user.isValid()).to.equal(false);
//       });

//       it('emits invalid on the model', function(done) {
//         User.once('invalid', function(instance, errors) {
//           expect(user).to.be(instance);
//           expect(errors).to.be.a(Array);
//           done();
//         });
//         user.isValid();
//       });

//       it('emits invalid on the instance', function(done) {
//         user.once('invalid', function(errors) {
//           expect(this).to.be(user);
//           expect(errors).to.be.a(Array);
//           done();
//         });
//         user.isValid();
//       });

//     });

//     describe('when valid', function() {
//       beforeEach(function() {
//         user = new User({name: 'Tobi', email: 'tobi@hello.com'});
//       });

//       it('returns true', function() {
//         expect(user.isValid()).to.equal(true);
//       });

//       it('emits valid on the model', function(done) {
//         User.once('valid', function(instance, errors) {
//           expect(user).to.be(instance);
//           expect(errors).to.be(null);
//           done();
//         });
//         user.isValid();
//       });

//       it('emits valid on the instance', function(done) {
//         user.once('valid', function(errors) {
//           expect(this).to.be(user);
//           expect(errors).to.be(null);
//           done();
//         });
//         user.isValid();
//       });
//     });
//   });
// });
