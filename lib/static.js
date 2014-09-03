
/**
 * Module dependencies.
 */

var isBrowser = require('is-browser');
var Emitter = require('./emitter');
var extend = require('extend.js');
var Hooks = require('hook-ware');
var assert = require('assert');
var clone = require('./clone');
var ware = require('ware');
var Use = require('./use');

/**
 * Better name
 */

var schema = exports;

/**
 * Mixins
 */

Emitter(schema);
Hooks(schema);
Use(schema);

/**
 * Define attr with the given `name` and `options`.
 *
 * @param {String} name
 * @param {Object} options
 * @return {Modella} self
 * @api public
 */

schema.attr = function(name, options){
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
 * Add a computed property
 *
 * @param {String} name
 * @param {String|Object} options
 * @param {String|Function} computed
 */

schema.compute = function(name, options, computed) {
  if ('string' == typeof options) {
    computed = options;
    options = {};
  }
};
