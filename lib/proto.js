
/**
 * Module dependencies.
 */

var clone = require('./utils/clone');
var map = require('map-series');
var noop = function(){};

try {
  var Emitter = require('emitter');
} catch(e) {
  var Emitter = require('emitter-component');
}

/**
 * Mixin emitter.
 */

Emitter(exports);

/**
 * Register an error `msg` on `attr`.
 *
 * @param {String} attr
 * @param {String} msg
 * @return {Object} self
 * @api public
 */

exports.error = function(attr, msg){
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

exports.isNew = function(){
  var key = this.model.primaryKey;
  return ! this.has(key);
};

/**
 * Get / set the primary key.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

exports.primary = function(val){
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

exports.isValid = function(){
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

exports.changed = function(attr){
  if (1 == arguments.length) {
    return !! this.dirty[attr];
  }

  var ret = {};
  for (var attr in this.dirty) {
    ret[attr] = this.dirty[attr];
  }
  return ret;
};

/**
 * Perform validations.
 *
 * @api private
 */

exports.validate = function() {
  var fns = this.model.validators || [];
  this.errors = [];
  for (var i = 0, len = fns.length; i < len; i++) fns[i](this);
  if(this.errors.length) {
    this.model.emit('invalid', this, this.errors);
    this.emit('invalid', this.errors);
  } else {
    this.model.emit('valid', this, null);
    this.emit('valid', null);
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

exports.remove = function(){
  var args = [].slice.call(arguments),
      fn = args.pop() || noop,
      self = this;

  var remove = this.model.remove;
  // Backwards-compatibiity with _sync
  if (!this.model.remove && this.model._sync) {
    remove = this.model._sync.remove;
  }

  if (this.isNew()) { return fn(new Error('not saved')); }

  this.run('removing', function() {
    remove.apply(self, args.concat(res));
  });

  function res(err, body) {
    if(err) {
      self.emit('error', err);
      return fn(err);
    }
    self.removed = true;
    self.model.emit('remove', self);
    self.emit('remove');
    fn(null, self);
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

exports.save = function(){
  var args = [].slice.call(arguments),
      fn = args.pop() || noop,
      operation = 'save',
      self = this;

  var isNew = this.isNew();

  if (!isNew) {
    var changed = this.changed();
    operation = 'update';
    if(!changed) return fn(null, this);
  }

  var save = this.model[operation];
  // Backwards-compatibiity with _sync
  if (!this.model[operation] && this.model._sync) {
    save = this.model._sync[operation];
  }

  if (!this.isValid()) {
    this.primary(null);
    return fn(new Error('validation failed'));
  }

  this.run('saving', function(err) {
    if (err) return fn(err);
    save.apply(self, args.concat(res));
  });

  function res(err, body) {
    if (err) {
      self.emit('error', err);
      return fn(err);
    }

    if (body) {
      self.primary(body.id || body._id);
      for(var attr in self.model.attrs) {
        self.attrs[attr] = body[attr];
      }
    }
    self.dirty = {};
    if(isNew) {
      self.model.emit('create', self);
      self.emit('create');
    }
    self.model.emit('save', self);
    self.emit('save');
    fn(null, self);
  }
};

/**
 * Set multiple `attrs`.
 *
 * @param {Object} attrs
 * @return {Object} self
 * @api public
 */

exports.set = function(attrs){
  this.model.emit('setting', this, attrs);
  this.emit('setting', attrs);
  for (var key in attrs) {
    if(this[key]) { this[key](attrs[key]); }
  }
  return this;
};

/**
 * Get `attr` value.
 *
 * @param {String} attr
 * @return {Mixed}
 * @api public
 */

exports.get = function(attr){
  return this.attrs[attr];
};

/**
 * Check if `attr` is present (not `null` or `undefined`).
 *
 * @param {String} attr
 * @return {Boolean}
 * @api public
 */

exports.has = function(attr){
  return undefined !== this.attrs[attr];
};

/**
 * Return the JSON representation of the model.
 *
 * @return {Object}
 * @api public
 */

exports.toJSON = function(){
  return clone(this.attrs);
};

/**
 * Run functions beforehand
 *
 * @param {String} event
 * @param {Function} fn
 * @api private
 */

exports.run = function(event, done) {
  var fns = this.model.listeners(event).concat(this.listeners(event));
  var self = this;

  self.errors = [];

  map(fns, function(fn, callback){
    fn(self, function(){
      if (self.errors.length || !self.isValid()) {
        return callback(new Error('validation failed'));
      }

      callback();
    });
  }, done);
};