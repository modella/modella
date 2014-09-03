/**
 * Module dependendencies
 */

var statics = require('./static');
var access = require('./access');
var assert = require('assert');
var clone = require('./clone');
var proto = require('./proto');
var Sync = require('./sync');

/**
 * Expose `Modella`.
 */

module.exports = Modella;

/**
 * Schema syncs
 */

var syncs = [
  'create',
  'update',
  'remove',
  'find',
  'all',
];

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
    this.sync = {};

    // Only add attrs that are in the model schema
    for (var attr in attrs) {
      if (Model.attrs[attr]) {
        this.attrs[attr] = attrs[attr];
      }
    }

    // emit "initialize" event
    Model.emit('initialize', this);
  }

  // Statics
  for (var key in statics) { Model[key] = statics[key]; }
  Model.modelName = name.toLowerCase();
  Model.attrs = {};

  // Add the schema values
  for (var key in schema) { Model.attr(key, schema[key]);  }

  // Protos
  for (var key in proto) { Model.prototype[key] = proto[key]; }

  // Additional Accessors
  Sync(Model, syncs);

  // Model#json getter
  access(Model.prototype, 'json', false, function() {
    return clone(this.attrs || {});
  });

  // Model#primary getter/setter
  access(Model.prototype, 'primary', function(val) {
    return this[Model.primaryKey] = val;
  }, function() {
    return this[Model.primaryKey];
  });

  return Model;
}
