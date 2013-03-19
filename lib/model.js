/**
 * Module dependendencies
 */

var emitter = require('emitter'),
    proto = require('./proto'),
    statics = require('./static'),
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
  if ('string' !== typeof name) { throw new TypeError('model name required'); }

  /**
   * Initialize a new model with the given `attrs`.
   *
   * @param {Object} attrs
   * @api public
   */

  function Model(attrs) {
    if (!(this instanceof Model)) { return new Model(attrs); }
    attrs = (attrs) ? clone(attrs) : {};
    this.attrs = {};
    this._callbacks = {};
    this.dirty = {};
    this.errors = [];

    // Only add attributes that are in the model schema
    for (var attr in attrs) {
      if (Model.attrs[attr]) {
        this.attrs[attr] = attrs[attr];
      }
    }
  }

  // mixin emitter

  emitter(Model);

  // statics

  Model.modelName = name;
  Model.base = '/' + name.toLowerCase();
  Model.attrs = {};
  Model.validators = [];

  var key;
  for (key in statics) { Model[key] = statics[key]; }

  // prototype

  Model.prototype = {};
  Model.prototype.model = Model;
  for (key in proto) { Model.prototype[key] = proto[key]; }

  return Model;
}
