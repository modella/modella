
/**
 * Module dependencies.
 */

var isBrowser = require('is-browser');
var yieldable = require('yieldly');
var Emitter = require('./emitter');
var extend = require('extend.js');
var assert = require('assert');
var clone = require('./clone');
var Sync = require('./sync');
var Env = require('./env');
var ware = require('ware');

/**
 * Regexps
 */

var rbrowser = /browser|client/;
var rserver = /server|node|node.js/;

/**
 * Mixin `Emitter`
 */

Emitter(exports);

/**
 * Use the given plugin `fn()`. If `env` is specified,
 * only use the plugin on the appropriate client.
 *
 * @param {Function} fn
 * @param {String} [env] private
 * @return {Modella} self
 * @api public
 */

exports.use = function(fn, env){
  env && isBrowser && rbrowser.test(env) && fn(this);
  env && !isBrowser && rserver.test(env) && fn(this);
  !env && fn(this);
  return this;
};

/**
 * Initialize an plugins for a specific environment
 *
 * @param {String} env
 * @return {Env}
 * @api public
 */

exports.env = function(env) {
  return Env(env, this);
}

/**
 * Define attr with the given `name` and `options`.
 *
 * @param {String} name
 * @param {Object} options
 * @return {Modella} self
 * @api public
 */

exports.attr = function(name, options){
  options = options || {};

  // don't overwrite existing prototype names
  assert(!this.prototype[name], name + ': name already in use.')

  // set up the objects attributes
  this.attrs[name] = extend(this.attrs[name] || {}, options);

  // implied pk
  if ('_id' === name || 'id' === name) {
    this.attrs[name].primaryKey = true;
    this.primaryKey = name;
  }

  // set up the getter & setters
  Object.defineProperty(this.prototype, name, {
    enumerable: true,
    get: getter,
    set: setter
  });

  // emit "attribute" events
  this.emit('attribute', name, options);

  // getter
  function getter() {
    return clone(this.attrs[name]);
  }

  // setter
  function setter(val) {
    val = clone(val);
    var prev = this.attrs[name];
    if (val == prev) return this;
    this.dirty[name] = val;
    this.attrs[name] = val;
    this.model.emit('change', this, name, val, prev);
    this.model.emit('change ' + name, this, val, prev);
    this.emit('change', name, val, prev);
    this.emit('change ' + name, val, prev);
    return this;
  }

  return this;
};

/**
 * Before
 *
 * @param {String|Function} event
 * @param {Function} fn (optional)
 * @return {Modella} self
 * @api public
 */

exports.before = function(event, fn) {
  if ('function' == typeof event) {
    fn = event;
    event = '*';
  }

  this.befores[event] = this.befores[event] || ware();
  this.befores[event].use(fn);

  return this;
}

/**
 * After
 *
 * @param {String|Function} event
 * @param {Function} fn (optional)
 * @return {Modella} self
 * @api public
 */

exports.after = function(event, fn) {
  if ('function' == typeof event) {
    fn = event;
    event = '*';
  }

  this.afters[event] = this.afters[event] || ware();
  this.afters[event].use(fn);

  return this;
}

/**
 * Add a computed property
 *
 * @param {String} name
 * @param {String|Object} options
 * @param {String|Function} computed
 */

exports.compute = function(name, options, computed) {
  if ('string' == typeof options) {
    computed = options;
    options = {};
  }
};

/**
 * Add a `sync` to persist for modella
 *
 * @param {Function}
 * @return {Modella} self
 */

exports.sync = function() {
  this._sync = this._sync || Sync(this);
  return this._sync;
}
