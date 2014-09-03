/**
 * Module Dependencies
 */

try {
  var type = require('component-type');
  var clone = require('component-clone');
} catch (e) {
  var type = require('type');
  var clone = require('clone');
}

/**
 * Export `Clone`
 */

module.exports = Clone;

/**
 * Initialize `Clone`
 *
 * @param {Mixed} obj
 * @return {Mixed}
 * @api public
 */

function Clone(obj) {
  return 'object' == type(obj) && !literal(obj)
    ? obj
    : clone(obj);
}

/**
 * Is object utility
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function literal(obj) {
  return obj.constructor == Object;
}
