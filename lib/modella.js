/**
 * Module dependendencies
 */

var statics = require('./static');
var assert = require('assert');
var clone = require('./clone');
var proto = require('./proto');
var Sync = require('./sync');

/**
 * Expose `Modella`.
 */

module.exports = Modella;

/**
 * Create a new `Model` with the given `name`.
 *
 * @param {String} name
 * @param {Object} schema
 * @return {Function}
 * @api public
 */

function Modella(name, schema) {
  assert(name, 'model name required');
  schema = schema || {};

  /**
   * Initialize the new `Model` with the given `attrs`.
   *
   * @param {Object} attrs
   * @api public
   */

  function Model(attrs) {
    if (!(this instanceof Model)) return new Model(attrs);
    attrs = attrs ? clone(attrs) : {};
    this.model = Model;
    this.attrs = {};
    this.dirty = {};

    // Only add attrs that are in the model schema
    for (var attr in attrs) {
      if (Model.attrs[attr]) {
        this.attrs[attr] = attrs[attr];
      }
    }

    // emit "construct" event
    Model.emit('construct', this);
  }

  // Statics
  for (var key in statics) { Model[key] = statics[key]; }
  Model.modelName = name.toLowerCase();
  Model.syncs = new Sync(Model);
  Model.attrs = {};

  // Add the schema values
  for (var key in schema) {
    Model.attr(key, schema[key]);
  }

  // Protos
  for (var key in proto) { Model.prototype[key] = proto[key]; }

  return Model;
}
