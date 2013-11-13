# modella [![Build Status](https://secure.travis-ci.org/modella/modella.png?branch=master)](http://travis-ci.org/modella/modella)

  Highly extendable bloat-free models.  

## Philosophy

`modella` is a bare bones model. It exposes a few APIs on which plugins can be
built to enhance functionality. Usage of these plugins enables high-powered but
bloat free models.

Check out the [list of available
plugins](https://github.com/modella/modella/wiki/List-of-Modella-Plugins#wiki-misc)

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

### Model.validate( fn )

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

### Model#attribute(value)

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

# Writing Plugins

Modella is made to be extended! Use events to hook into modella and manipulate
the data as necessary. See below for the list of events.

For types of plugins, and more comprehensive documentation, see the [plugin writing
guide](https://github.com/modella/modella/wiki/Plugin-Writing-Guide).


# Events

All modella models have built in emitters on both instances and the model
itself.

You can listen for an event on either the `Model` or an `instance` of the Model.

You can listen just once by running `once` instead of `on`.

```js
  var user = new User()
  User.on('save', function(u) {
    user == u // true
  });

  user.once('save', function() {
    user.remove(); // Why? Nobody knows...
  });
```
## List of All Events

### Validation Events

- `invalid` trigger when `isValid()` or `validate()` fails.
- `valid` trigger when `isValid()` or `validate()` passes.

### Save Events

- `saving` triggers before saving has occurred.
- `save` happens after a save has occurred.
- `create` happens after a record is saved for the first time.

### Manipulation Events

- `initializing` triggers when a new `instance` is created. Passes `attrs` which
  can be modified by the listener.

```js
User.on('initializing', function(instance, attrs) {
  attrs.name = attrs.name.toUpperCase();
});
var bob = new User({name: 'Bob'});
bob.name() // => BOB
```

- `setting` triggers when `instance.set` is called. Passes `attrs` which can
  be modified in the listener.

```js
User.on('setting', function(instance, attrs) {
  attrs.name = attrs.name.toUpperCase();
});
var bob = new User();
bob.set({name: 'Bob'});
bob.name() // => BOB
```

### Other Events

- `initialize` triggers when a model has been completely initialized.
- `change <attr>` triggers when `attr` changes (via `set` or
  `model.attr(newVal)`.

# License

(The MIT License)

Copyright (c) 2013 Ryan Schmukler <ryan@slingingcode.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
