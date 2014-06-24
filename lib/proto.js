
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var clone = require('./clone');
var on = Emitter.prototype.on;
var noop = function(){};
var slice = [].slice;

/**
 * Regexps
 */

var asyncs = /^(sav|remov)ing$/

/**
 * Mixin emitter.
 */

Emitter(exports);

/**
 * Monkey-patch Emitter#on(event, fn)
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Model} self
 * @api public
 */

exports.on = function(event, fn) {
  if (!asyncs.test(event)) return on.apply(this, arguments);
  this.aemitter.on(event, fn);
  return this;
}

/**
 * Register an error `msg` on `attr`.
 *
 * @param {String} attr
 * @param {String} msg
 * @return {Object} self
 * @api public
 */

exports.error = function(attr, msg) {
  this.errors.push({
    attr: attr,
    message: msg
  });
  return this;
};

/**
 * Check if this model is new.
 *
 * @return {Boolean}
 * @api public
 */

exports.isNew = function() {
  var key = this.model.primaryKey;
  return !this.attrs[key];
};

/**
 * Get / set the primary key.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

exports.primary = function(val) {
  var key = this.model.primaryKey;
  if (0 == arguments.length) return this[key]();
  return this[key](val);
};

/**
 * Validate the model and return a boolean.
 *
 * Example:
 *
 *    user.isValid()
 *    // => false
 *
 *    user.errors
 *    // => [{ attr: ..., message: ... }]
 *
 * @return {Boolean}
 * @api public
 */

exports.isValid = function() {
  this.validate();
  return 0 == this.errors.length;
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

exports.changed = function(attr) {
  return 1 == arguments.length
    ? !! this.dirty[attr]
    : clone(this.dirty);
};

/**
 * Perform validations.
 *
 * @api private
 */

// exports.validate = function() {
//   var fns = this.model.validators || [];
//   this.errors = [];
//   for (var i = 0, len = fns.length; i < len; i++) fns[i](this);
//   if(this.errors.length) {
//     this.model.emit('invalid', this, this.errors);
//     this.emit('invalid', this.errors);
//   } else {
//     this.model.emit('valid', this, null);
//     this.emit('valid', null);
//   }
// };

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

exports.remove = function() {
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

exports.save = function() {
  var model = this.model;
  var isNew = this.isNew();
  var args = slice.call(arguments);
  var last = args[args.length - 1];
  var fn = 'function' == typeof last ? last : noop;
  var action = isNew ? 'save' : 'update';
  var op = model[action];

  if (fn) args.pop(), fn = noop;
  if (!op) return fn(new Error('no save operation found'));

  // save
  ware()
    .use(this.model.wares.saving || [])
    .use(this.wares.saving || [])
    .use(save)
    .run(this, response.bind(this));

  return this;

  // call the "save" or "update" operation
  function save(model, next) {
    return op.apply(model, args.concat(next));
  }

  // handle the response
  function response(err, json) {
    if (err) {
      this.emit('error', err);
      return fn(err);
    }

    if (body) {
      this.primary(body.id || body._id);
      this.attrs[name] = extend(this.attrs[name], body);
    }

    this.dirty = {};

    if (isNew) {
      model.emit('create', self);
      this.emit('create');
    }

    model.emit('save', self);
    this.emit('save');

    fn(null, this);
  }
};

/**
 * Set multiple `attrs`.
 *
 * @param {Object} attrs
 * @return {Object} self
 * @api public
 */

// exports.set = function(attrs) {
//   for (var key in attrs) {
//     if(this.model.attrs[key]) {
//       this[key](attrs[key]);
//     }
//   }
//   return this;
// };

// /**
//  * Get `attr` value.
//  *
//  * @param {String} attr
//  * @return {Mixed}
//  * @api public
//  */

// exports.get = function(attr) {
//   return this.attrs[attr];
// };

/**
 * Check if `attr` is present (not `null` or `undefined`).
 *
 * @param {String} attr
 * @return {Boolean}
 * @api public
 */

// exports.has = function(attr) {
//   return undefined !== this.attrs[attr];
// };

/**
 * Return the JSON representation of the model.
 *
 * @return {Object}
 * @api public
 */

exports.toJSON = function() {
  return clone(this.attrs);
};

/**
 * Run functions beforehand
 *
 * @param {String} event
 * @param {Function} fn
 * @api private
 */

// exports.run = function(ev, done) {
//   var modelFns = this.model.listeners(ev),
//       fns = this.listeners(ev);

//   var self = this;

//   self.errors = [];

//   function next(err) {
//     if(err) return done(err);

//     if (ev === 'saving' && (self.errors.length || !self.isValid())) {
//       return done(new Error('validation failed'));
//     }

//     if(modelFns.length) {
//       modelFns.shift().call(self, self, next);
//     } else if(fns.length) {
//       fns.shift().call(self, next);
//     } else {
//       done(err);
//     }
//   }

//   next();
// };
