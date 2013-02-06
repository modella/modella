/**
 * Module dependendencies
 */

var Emitter = require('emitter'),
    proto = require('./proto'),
    statics = require('./static'),
    sync = require('./sync'),
    clone = require('./clone');

/**
 * Expose `createModel`.
 */

module.exports = createModel;

/**
 * Create a new model constructor with the given `name`.
 *
 * @param {String} name
 * @return {Function}
 * @api public
 */

function createModel(name) {
  if ('string' != typeof name) throw new TypeError('model name required');

  /**
   * Initialize a new model with the given `attrs`.
   *
   * @param {Object} attrs
   * @api public
   */

  function model(attrs) {
    if (!(this instanceof model)) return new model(attrs);
    attrs = (attrs) ? clone(attrs) : {};
    this.attrs = {};
    this._callbacks = {};
    this.dirty = {};

    // Only add attributes that are in the model schema
    for (var attr in attrs) {
      if (model.attrs[attr]) {
        this.attrs[attr] = attrs[attr];
      }
    }
  }

  // mixin emitter

  Emitter(model);

  // statics

  model.modelName = name;
  model.base = '/' + name.toLowerCase();
  model.attrs = {};
  model.sync = clone(sync);
  model.validators = [];
  for (var key in statics) model[key] = statics[key];

  // prototype

  model.prototype = {};
  model.prototype.model = model;
  for (var key in proto) model.prototype[key] = proto[key];

  return model;
}
