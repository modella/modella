/**
 * Module dependendencies
 */

var assert = require('assert');
var clone = require('./clone');
var proto = require('./proto');
var statics = require('./static');
var aemitter = require('aemitter');
var Emitter = require('component-emitter');

/**
 * Expose `model`.
 */

module.exports = model;


/**
 * Create a new model constructor with the given `name`.
 *
 * @param {String} name
 * @return {Function}
 * @api public
 */

function model(name) {
  assert(name, 'model name required');

  /**
   * Initialize a new model with the given `attrs`.
   *
   * @param {Object} attrs
   * @api public
   */

  function Model(attrs) {
    if (!(this instanceof Model)) return new Model(attrs);
    attrs = attrs ? clone(attrs) : {};
    this.attrs = {};
    this.dirty = {};
    this.errors = [];

    // Only add attrs that are in the model schema
    for (var attr in attrs) {
      if (Model.attrs[attr]) {
        this.attrs[attr] = attrs[attr];
      }
    }
  }

  // mixin `Emitter`
  Emitter(Model);

  // static attrs
  Model.name = name.toLowerCase();
  Model.attrs = {};
  Model.validators = [];
  Model.aemitter = new aemitter;

  // mixin statics
  for (var key in statics) { Model[key] = statics[key]; }

  // proto
  Model.prototype = {};
  Model.prototype.model = Model;
  Model.prototype.aemitter = new aemitter;
  for (var key in proto) { Model.prototype[key] = proto[key]; }

  return Model;
}
