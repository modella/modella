// server & browser
var user = User(attrs)

// STATIC:

// setting attributes
User.attr(name, opts)

// computing attributes
User.computed(name, str|fn)

// PROTOTYPE:

user.isNew()
user.changed()

// set an object
user.attr[name] = value

// get or set the primary
user.primary

// return json
user.json

// COMMON:

// use a plugin
// used to set up events, hooks and syncs
// optionally pass an environment variable
User.use([env], fn);

// events
// don't modify or halt execution flow
// may or may not modify state
// unordered, run asynchronously
User.on(event, fn);
User.emit(event, [args, ...])

// hooks
// may halt execution flow
// will probably modify state
// ordered, run sequentially
User.hook(event, fn|gen);
User.trigger(event, [args, ...], [done])

// predefined events
creating
created
updating
updated
removing
removed
finding
found
saving
saved

// setters & getters
User.create // batch
user.create // single
User.update // batch
user.update // single
User.remove // batch
user.remove // single
User.all    // find many
User.find   // find one

// signatures

  // static:
  User.find(query, [opts], [fn])
  User.sync.find = function(query, opts, fn) {}

  User.all(query, [opts], [fn])
  User.sync.all = function(query, opts, fn) {}

  User.create(users, [opts], [fn])
  User.update(users, [opts], [fn])
  User.remove(users, [opts], [fn])

  // proto:
  user.create([opts], [fn])
  User.sync.create = function(opts, fn) {}
  user.update([opts], [fn])
  User.sync.update = function(opts, fn) {}
  user.remove([opts], [fn])
  User.sync.remove = function(opts, fn) {}




