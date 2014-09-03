
/**
 * Module dependencies.
 */

var yieldable = require('yieldly');
var Emitter = require('./emitter');
var clone = require('./clone');
var noop = function(){};
var slice = [].slice;

/**
 * Mixin `Emitter`
 */

Emitter(exports);

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
 * Set multiple attributes at once
 *
 * @param {Object} attrs
 * @return {Model} self
 */

exports.set = function(attrs) {
  attrs = attrs || {};

  // Only add attrs that are in the model schema
  for (var attr in attrs) {
    if (this.attrs[attr]) {
      this.attrs[attr] = attrs[attr];
    }
  }

  return this;
}

/**
 * Return the JSON representation of the model.
 *
 * @return {Object}
 * @api public
 */

exports.json =
exports.toJSON = function() {
  return clone(this.attrs);
};
