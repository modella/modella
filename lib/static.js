
/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var extend = require('extend.js');
var assert = require('assert');
var clone = require('./clone');
var on = Emitter.prototype.on;

/**
 * Regexps
 */

var rbrowser = /browser|client/;
var rserver = /server|node|node.js/;
var asyncs = /^(sav|remov)ing$/;

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
 * Use the given plugin `fn()`. If `env` is specified, 
 * only use the plugin on the appropriate client.
 *
 * @param {String} [env]
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.use = function(env, fn){
  if (1 == arguments.length) {
    fn = env;
    env = null;
  }

  if (env) {
    if(isBrowser && rbrowser.test(env)) fn(this);
    else if(!isBrowser && rserver.test(env)) fn(this);
  } else {
    fn(this);
  }

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
