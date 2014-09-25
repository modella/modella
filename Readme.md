# modella [![Build Status](https://secure.travis-ci.org/modella/modella.png?branch=master)](http://travis-ci.org/modella/modella)

  Highly extendable bloat-free models.

## Installation

With node.js:

    npm install modella

In the browser (using [component](https://github.com/component/component)):

    component install modella/modella

## Philosophy

`modella` is a bare bones model. It exposes a few APIs on which plugins can be
built to enhance functionality. Usage of these plugins enables high-powered but
bloat free models.

Check out the [list of available
plugins](https://github.com/modella/modella/wiki/List-of-Modella-Plugins)

# Defining Models

All `modella` definition methods are chainable.

### modella( name )

Creates a new model with the name `name`.

```js
var modella = require('modella');
var User = modella('User');
```

### Model.use ( [env], fn )

As mentioned in the philosophy, `modella`'s goal is to make it easy to extend
models with plugins. This lets you create models that do exactly what you need,
and nothing more. You can use `env` to target the client and the server separately.

```js
var modella = require('modella');
var validators = require('modella-validators');
var User = modella('User');

User.use(validators);
```

Browser plugin:

```js
User.use('client', plugin);
// or
User.use('browser', plugin);
```

Server plugin:

```js
User.use('server', plugin);
// or
User.use('node', plugin);
```

### Model.attr( name, [options] )

Adds attribute `attrName` to a model. Additional `options` can be passed in as
an object. Modella itself accepts the option `defaultValue` to specify the default value for the attribute. Plugins may extend the available options.

```js
var modella = require('modella'),
var validators = require('modella-validators'),
var User = modella('User');

User.use(validators);

User
  .attr('_id')
  .attr('username', { required: true })
  .attr('email', { required: true, format: 'email' })
  .attr('admin', { defaultValue: false };

var user = new User({
    username: 'bob',
    email: 'bob@bobbington.com'
});
// user.admin() === false
var adminUser = new User({
    username: 'bobs_boss',
    email: 'boss@bobbington.com',
    admin: true
})
// adminUser.admin() === true
```

### Model.validate( fn )

Adds a validator to the model. A validator should add error messages for
attributes that fail validation. Note that plugins such as
[modella/validators](http://github.com/modella/validators) make extensive use of
this.

```js
var User = modella('User');

User.validate(function(user) {
  if(!user.username()) {
    user.error('username', "is required");
  }
});
```

# Working with Instances

### new Model( [attrs] )

You can create instances of models with the `new` operator. You can also specify
initial values by passing in an object for `attrs`.

```js
var user = new User();

var bob = new User({username: 'Bob' });
```

### Model#attribute(value)

Sets the given attribute to a value.

```js
var user = new User();

user.username("Bob");
```

### Model#attribute()

Returns the value of the attribute

```js
var user = new User({username: 'Bob'});

user.username() // => 'Bob'
```

### Model#get( attr )

Returns the value of the attribute

```js
var user = new User({username: 'Bob'});

user.get('username') // => 'Bob'
```

### Model#has( attr )

Returns whether an instance has an attribute set.

```js
var user = new User({username: 'Bob'});

user.has('email') // => false
```

### Model#set( attrs )

Quickly sets multiple attributes.

```js
var user = new User();

user.set({username: 'Bob', email: 'bob@bobbington.com'});
```

### Model#primary( [key] )

Gets or sets the value of the primary `key` attribute. By default, this auto-maps to an
attribute with the name of `_id` or `id` if it is specified.

Getting the primary key:

```js
var User = modella('User').attr('_id');
var user = new User({_id: 123 });

user.primary(); // => 123
```

Setting the primary key:

```js
var User = modella('User').attr('_id');
var user = new User({_id: 123 });
user.primary(456);

user.primary(); // => 456
```

### Model#isNew()

Returns a boolean based on if the value of `Model#primary()` is set or not.

```js
var user = new User();
user.isNew() // => true

var oldUser = new User({_id: 555});
oldUser.isNew() // => false
```

### Model.isValid()

Runs all validators on the model and returns whether any validations failed.

```js
var User = modella('User')
var validators = require('modella-validators');

User
  .attr('username', { required: true })
  .use(validators);

var user = new User();

user.isValid() // => false
```

### Model#save( [fn(err)] )

Saves the model using the `syncLayer`. Will not attempt to save if
`model#isValid()` returns false.

Calls `fn(err)` after save.

```js
var User = modella('User')
  .attr('_id')
  .attr('name');

var user = new User({ name: 'Charley' });

user.save(function(err) {
  // ...
});
```

Using events:

```js
user.on('save', function() {
  // all good!
});

user.on('error', function(err) {
  // oh no!
});

user.save();
```

### Model#remove( [fn(err)] )

Deletes the model using the sync layer and marks it as `removed`.

Calls `fn(err)` after remove.

### Model#removed

Marked as true if the model has been deleted.

```js
user.remove(function(err) {
  // ...
});

user.removed // => true
```

### Model#model

Points to the base model from which the instance was created.

```js
var user = new User();

user.model === User // => true
```

# Writing Plugins

Modella is made to be extended! Use events to hook into modella and manipulate
the data as necessary. See below for the list of events.

For types of plugins, and more comprehensive documentation, see the [plugin writing
guide](https://github.com/modella/modella/wiki/Plugin-Writing-Guide).

Here's some existing plugins to help you get started: [list of available
plugins](https://github.com/modella/modella/wiki/List-of-Modella-Plugins).

# Events

All modella models have built in emitters on both instances and the model
itself.

You can listen for an event on either the `instance` of a model or the `Model` itself. Here's how to listen on the instance:

```js
var user = new User()

user.on('save', function() {
  user.remove();
});
```

Listening on the `Model` is useful for performing aggregate operations on all instances. Here's how to listen on the `Model`:

```js
User.on('save', function(user) {
  // user is the instance that performed save
});
```

## List of All Events

### Save Events

- `save` triggers after a successful save.
- `create` triggers after a record is saved for the first time.
- `saving` triggers before saving has occurred. `saving` requires asynchronous callbacks so that validation can occur.

Asynchronous callback:

```js
user.on('saving', function(done) {
  // ...
  done();
});

User.on('saving', function(user, done) {
  // ...
  done();
});
```

### Remove Events

- `remove`: triggers after a successful removal.
- `removing`: triggers before a remove has occurred. `removing` must call an
  asynchronous callback so that execution can continue

Asynchronous callback:

```js
user.on('removing', function(done) {
  // ...
  done();
});

User.on('removing', function(user, done) {
  // ...
  done();
});
```

### Validation Events

- `invalid` triggers when `isValid()` or `validate()` fails.
- `valid` triggers when `isValid()` or `validate()` passes.

### Manipulation Events

- `change <attr>` triggers when `attr` changes (via `set` or
  `model.attr(val)`.

```js
user.on('change name', function(val, prev) {
  // ...
})

user.name('charley');
```

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

### Miscellaneous Events

- `attr` triggers when a new attribute is added/changed (`Model.attr(name, options)`)
- `initialize` triggers when a model has been completely initialized.
- `error` triggers whenever there's an error syncing the model.

# License

(The MIT License)

Copyright (c) 2013 Ryan Schmukler <ryan@slingingcode.com>

Copyright (c) 2013 Matthew Mueller <mattmuelle@gmail.com>

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
