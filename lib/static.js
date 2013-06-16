
/**
 * Module dependencies.
 */

var clone = require('./utils/clone'),
    type = require('./utils/type'),
    noop = function(){};

/**
 * Add validation `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.validate = function(fn){
  this.validators.push(fn);
  return this;
};

/**
 * Use the given plugin `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.use = function(fn){
  fn(this);
  return this;
};

/**
 * Define attr with the given `name` and `options`.
 *
 * @param {String} name
 * @param {Object} options
 * @return {Function} self
 * @api public
 */

exports.attr = function(name, options){
  this.attrs[name] = options || {};

  // implied pk
  if ('_id' === name || 'id' === name) {
    this.attrs[name].primaryKey = true;
    this.primaryKey = name;
  }

  // Check for defaultValue
  if (options && options.defaultValue) {
    this._defaults[name] = options.defaultValue;
  }

  // getter / setter method
  this.prototype[name] = function(val){
    if (0 === arguments.length) { return clone(this.attrs[name]); }
    var prev = this.attrs[name];
    val = clone(val);

    // Check if it actually changed
    var changed = false,
        newType = type(val);
    if(newType == 'object' || newType == 'array') {
      changed = true;
    } else
      changed = this.attrs[name] != val;

    if(changed) {
      this.dirty[name] = val;
      this.attrs[name] = val;
      this.model.emit('change', this, name, val, prev);
      this.model.emit('change:' + name, this, val, prev);
      this.emit('change', name, val, prev);
      this.emit('change:' + name, val, prev);
    }
    return this;
  };

  return this;
};

/**
 * Remove all and invoke `fn(err)`.
 *
 * @param {Function} [fn]
 * @api public
 */

exports.removeAll = function() {
  var args = [].slice.call(arguments),
      fn = args.pop() || noop,
      self = this,
      removeAll = this._sync.removeAll;

  removeAll.apply(this, args.concat(res));

  function res(err, body) {
    if(err) {
      self.emit('error', err);
      return fn(err);
    }
    fn();
  }
};

/**
 * Get all and invoke `fn(err, array)`.
 *
 * @param {Function} fn
 * @api public
 */

exports.all = function() {
  var out = [],
      args = [].slice.call(arguments),
      fn = args.pop(),
      self = this,
      all = this._sync.all;

  all.apply(this, args.concat(res));

  function res(err, body) {
    if (err) {
      self.emit('error', err);
      return fn(err);
    } else if(!body || !body.length) {
      return fn(null, out);
    }

    for (var i = 0, len = body.length; i < len; ++i) {
      out.push(new self(body[i]));
    }

    fn(null, out);
  }
};

/**
 * Get `id` and invoke `fn(err, model)`.
 *
 * @param {Mixed} id
 * @param {Function} fn
 * @api public
 */

exports.get =
exports.find = function() {
  var args = [].slice.call(arguments),
      fn = args.pop(),
      self = this,
      get = this._sync.get || this.sync.find;

  get.apply(this, args.concat(res));

  function res(err, body) {
    if(err) {
      self.emit('error', err);
      return fn(err);
    }

    if (!body) fn(null, false);
    else fn(null, new self(body));
  }
};
