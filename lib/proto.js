
/**
 * Module dependencies.
 */

var Emitter = require('./emitter');
var Hooks = require('hook-ware');
var yieldly = require('yieldly');
var access = require('./access');
var wrapfn = require('wrap-fn');
var Sync = require('./sync.js');
var clone = require('./clone');
var sliced = require('sliced');
var Batch = require('batch');
var Use = require('./use');
var Ware = require('ware');
var noop = function(){};

/**
 * Better name
 */

model = exports;

/**
 * Instance syncs
 */

var syncs = [
  'create',
  'update',
  'remove'
];

/**
 * Mixins
 */

Emitter(model);
Hooks(model);
Use(model);

/**
 * Check if this model is new.
 *
 * @return {Boolean}
 * @api public
 */

model.isNew = function() {
  var key = this.model.primaryKey;
  return !this.attrs[key];
};

/**
 * Return `false` or an object
 * containing the "dirty" attributes.
 *
 * Optionally check for a specific `attr`.
 *
 * @param {String} [attr]
 * @return {Object|Boolean}
 * @api public
 */

model.changed = function(attr) {
  return 1 == arguments.length
    ? !! this.dirty[attr]
    : clone(this.dirty);
};

/**
 * Save and invoke `fn(err)`.
 *
 * Events:
 *
 *  - `save` on updates and saves
 *  - `saving` pre-update or save, after validation
 *
 * @param {Function} [fn]
 * @api public
 */

model.save = yieldly(function() {
  var model = this.model;
  var isNew = this.isNew();
  var args = slice.call(arguments);
  var last = args[args.length - 1];
  var fn = 'function' == typeof last;
  var before = isNew ? 'creating' : 'updating';
  var after = isNew ? 'created' : 'updated';
  var action = isNew ? 'create' : 'update';
  var save = Ware();

  // if the last arg is a function, remove from args
  fn = fn ? args.pop() : noop;

  // before hooks
  save
    .use(model.hooks('saving'))
    .use(this.hooks('saving'))
    .use(model.hooks(before))
    .use(this.hooks(before))

  // syncs
  save
    .use(model.syncs(action))
    .use(this.syncs(action))

  // response
  save.use(response);

  // after hooks
  save
    .use(model.hooks('saved'))
    .use(this.hooks('saved'))
    .use(model.hooks(after))
    .use(this.hooks(after))

  // run the save operations
  save.run(this, fn);

  function response(json) {
    console.log(json);


  }

  // save
  //   .use()

  // save.run()

  // befores: called sequentially
  // save
  //   .use(this.hooks['any']() || [])
  //   .use(this.hooks['saving']() || [])
  //   .use(this.hooks[isNew ? 'creating' : 'updating']() || [])

  // // syncs: add in the model and instance syncs
  // var syncs = Batch()
  //   .push(model.syncs[action]())
  //   .push(this.syncs[action]());

  // // call all the syncs in parallel
  // save.use(function(obj, done) {
  //   syncs.end.apply(syncs, [obj].concat(args).concat(next));

  //   /**
  //    * ISSUE: multiple syncs mean multiple
  //    * responses. I don't think we should
  //    * be the ones deciding how to handle
  //    * the responses.
  //    */

  //   function next(err, res) {
  //     if (err) return fn(err);
  //     console.log(res);
  //   }
  // });

  // afters: called sequentially
  // save
  //   .use(this.hooks['any']() || [])
  //   .use(this.hooks['save']() || [])
  //   .use(this.hooks[action]() || [])

  // run the pipeline
  // save.run(this, function(err) {

  // })

  // console.log(action, model.syncs[action]());
  // console.log(syncs.fns);
  // console.log(syncs.length);
  // if (fn) args.pop(), fn = noop;
  // if (!op) return fn(new Error('no save operation found'));

  // // save
  // ware()
  //   .use(this.model.wares.saving || [])
  //   .use(this.wares.saving || [])
  //   .use(save)
  //   .run(this, response.bind(this));

  // return this;

  // // call the "save" or "update" operation
  // function save(model, next) {
  //   return op.apply(model, args.concat(next));
  // }

  // // handle the response
  // function response(err, json) {
  //   if (err) {
  //     this.emit('error', err);
  //     return fn(err);
  //   }

  //   if (body) {
  //     this.primary(body.id || body._id);
  //     this.attrs[name] = extend(this.attrs[name], body);
  //   }

  //   this.dirty = {};

  //   if (isNew) {
  //     model.emit('create', self);
  //     this.emit('create');
  //   }

  //   model.emit('save', self);
  //   this.emit('save');

  //   fn(null, this);
  // }
});

/**
 * Destroy the model and mark it as `.removed`
 * and invoke `fn(err)`.
 *
 * Events:
 *
 *  - `removing` before deletion
 *  - `remove` on deletion
 *
 * @param {Function} [fn]
 * @api public
 */

model.remove = function() {
  var self = this;
  var model = this.model;
  var isNew = this.isNew();
  var args = slice.call(arguments);
  var last = args[args.length - 1];
  var fn = 'function' == typeof last ? last : noop;
  var op = model.remove;
  var pending = 2;

  if (isNew) return fn(new Error('not saved'));
  else if (!op) return fn(new Error('no remove operation found'));

  // remove
  this.model.aemitter.emit('removing', this, remove);
  this.aemitter.emit('removing', remove);

  return this;

  // run the "remove" plugin
  function remove(err) {
    if (err) return error(err);
    else if (--pending) return;
    ops.apply(self, args.concat(res));
  }

  // handle the response
  function res(err, json) {
    if (err) return error(err);
    this.removed = true;
    model.emit('remove', this);
    this.emit('remove');
    fn(null, this);
  }

  // error handling
  function error(err) {
    model.emit('error', self, err);
    self.emit('error', err);
    return fn(err);
  }
};

/**
 * Set multiple attributes at once
 *
 * @param {Object} attrs
 * @return {Model} self
 */

model.set = function(attrs) {
  attrs = attrs || {};

  // Only add attrs that are in the model schema
  for (var attr in attrs) {
    if (this.attrs[attr]) {
      this[attr] = attrs[attr];
    }
  }

  return this;
}

/**
 * Save
 */

model.save = function() {
  var action = this.isNew() ? 'create' : 'update';
  return this[action].apply(this, arguments);
}

/**
 * Create
 */

model.create = function(opts, fn) {
  var syncs = this.model.sync.create;
  var args = sliced(arguments);
  var model = this.model;
  var ware = Ware();
  var self = this;

  // defaults
  if (!arguments.length) {
    opts = {};
    fn = noop;
  } else if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  ware.use(trigger(this, 'creating'));
  ware.use(trigger(model, 'creating', this));
  ware.use(trigger(this, 'saving'));
  ware.use(trigger(model, 'saving', this));
  ware.use(syncs.map(sync));
  ware.use(trigger(this, 'created'));
  ware.use(trigger(model, 'created', this));
  ware.use(trigger(this, 'saved'));
  ware.use(trigger(model, 'saved', this));

  function sync(sync) {
    return function (done) {
      sync.apply(self, [opts, response(done)]);
    }
  }

  function response(done) {
    return function (err, res) {
      if (err) return done(err);
      if (res) self.set(res);
      var primary = res[model.primaryKey];
      if (primary) self.primary = primary;
      self.dirty = {};
      return done();
    }
  }

  function trigger(ctx, event, obj) {
    return function (done) {
      obj
        ? ctx.trigger(event, obj, done)
        : ctx.trigger(event, done);
    };
  }

  ware.run(function(err) {
    if (err) return fn(err);
    return fn(null, self);
  });

  // this._hooks(['creating', 'saving'], function(err) {
  //   if (err) return fn(err);
  //   var pending = sync.create.length;

  //   var creates = sync.create.map(function(create) {
  //     wrapfn(create, next).apply(self, [self].concat(args));
  //   });

  //   function next(err, res) {
  //     if (err) return fn(err);
  //     if (res) self.set(res);
  //     var primary = res[model.primaryKey];
  //     if (primary) self.primary = primary;
  //     self.dirty = {};
  //     if (!--pending) post();
  //   }
  // });

  // function post() {
  //   self._hooks(['created', 'saved'], function(err) {
  //     if (err) return fn(err);
  //     fn(null, self);
  //   });
  // }

  // yield support
  return function(done) {
    fn = done;
  }
}

// model._hooks = function(names, fn) {
//   var model = this.model;
//   var ware = Ware();

//   for (var i = 0, name; name = names[i++];) {
//     ware.use(model.hooks(name));
//     ware.use(this.hooks(name));
//   }

//   // run
//   ware.run(this, fn);
// };

/**
 * Update
 */

model.update = function() {
  var args = sliced(arguments);
  console.log(args);
}
