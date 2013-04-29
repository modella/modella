# modella [![Build Status](https://secure.travis-ci.org/modella/modella.png?branch=master)](http://travis-ci.org/modella/modella)

  simplified models

## Philosophy

`modella` is a bare bones model. It exposes a few APIs on which plugins can be
built to enhance functionality. Usage of these plugins enables high-powered but
bloat free models.

# Defining Models

All `modella` definition methods are chainable.

### modella( modelName )

Creates a new model with the name `modelName`.

    var modella = require('modella'),
           User = modella('User');


### Model.use ( modellaPlugin )

As mentioned in the philosophy, `modella`'s goal is to make it easy to extend
models with plugins. This lets you create models that do exactly what you need,
and nothing more.

    var modella = require('modella'),
     validators = require('modella-validators'),
           User = modella('User');

    User.use(validators);

### Model.attr( attrName, [options] )

Adds attribute `attrName` to a model. Additional `options` can be passed in as
an object. Modella does not use these options, but plugins may.

    var modella = require('modella'),
     validators = require('modella-validators'),
           User = modella('User');

    User.use(validators);

    User
      .attr('_id')
      .attr('username', { required: true })
      .attr('email', { required: true, format: 'email' });

### Model.Validate( fn )

Adds a validator to the model. A validator should add error messages for
attributes that fail validation. Note that plugins such as
[modella/validators](http://github.com/modella/validators) make extensive use of
this.

    var User = modella('User');

    User.validate(function(user) {
      if(!user.username()) {
        user.error('username', "is required");
      }
    });

# Working with Instances

### new Model([initialValues])

You can create instances of models with the `new` operator. You can also specify
initial values by passing in an object for `initialValues`

    var user = new User();

    var bob = new User({username: 'Bob' });

### Model#<attribute>(value)

Sets the given attribute to a value.

    var user = new User();

    user.username("Bob");

### Model#attribute()

Returns the value of the attribute
    
    var user = new User({username: 'Bob'});

    user.username()
      => 'Bob'

### Model#get( attribute )

Returns the value of the attribute

    var user = new User({username: 'Bob'});

    user.get('username')
      => 'Bob'

### Model#has( attribute )

Returns whether an instance has an attribute set.

    var user = new User({username: 'Bob'});

    user.has('email')
      => false

### Model#set( properties )

Quickly sets multiple attributes.

    var user = new User();

    user.set({username: 'Bob', email: 'bob@bobbington.com'});

### Model#primary()

Returns the value of the primary key attribute. By default, this auto-maps to an
attribute with the name of `_id` or `id` if it specified.

    var User = modella('User').attr('_id');

    var user = new User({_id: 123 });

    user.primary();
      => 123

### Model#primary( value )

Sets the value of the primary key to `value`. By default primary key will map to
an attribute with the name of `_id` or `id`

    var User = modella('User').attr('_id');

    var user = new User({_id: 123 });

    user.primary(456);

    user.primary();
      => 456

### Model#isNew()

Returns whether the value of `Model#primary()` is blank.

    var user = new User();
    user.isNew()
      => true

    var oldUser = new User({_id: 555});
    oldUser.isNew()
      => false

### Model.isValid()

Runs all validators on the model and returns whether any validations failed.

    var validators = require('modella-validators');

    var User = modella('User')
    User.use(validators);

    User.attr('username', { required: true });

    var user = new User();

    user.isValid()
      => false

### Model#save( [cb(err)] )

Saves the model using the `syncLayer`. Will not attempt to save if
`model#isValid()` returns false.

Calls `cb(err)` after save.

### Model#remove( [cb(err)] )

Deletes the model using the sync layer and marks it as `removed`.

Calls `cb(err)` after remove.

### Model#removed

Marked as true if the model has been deleted.

    user.remove()

    user.removed
      => true

### Model#model

Points to the base model from which the instance was created.

    var user = new User();

    user.model === User
      => true


# Sync

TODO: Write some documentation

# Events

All modella models have built in emitters on both instances and the model
itself.

TODO: Write some documentation

## License

MIT
