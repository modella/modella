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

  it('will run server-specific plugins', function() {
    var one = false, two = false, three = false, four = false;

    User.use('server', function() {
      one = true;
    });

    User.use('node', function() {
      two = true;
    });

    User.use('node.js', function() {
      three = true;
    });

    User.use('zomg', function() {
      three = true;
    });

    expect(one).to.be(true);
    expect(two).to.be(true);
    expect(three).to.be(true);
    expect(four).to.be(false);
  });
});
