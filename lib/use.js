/**
 * Module Dependencies
 */

var isBrowser = require('is-browser');

/**
 * Export `mixin`
 */

module.exports = mixin;

/**
 * Regexps
 */

var rbrowser = /browser|client/;
var rserver = /server|node|node.js/;

/**
 * Environment mixin
 *
 * @param {String} env
 * @param {Model|Object} model
 * @return {Plugin}
 * @api private
 */

function mixin(obj) {
  obj.use = use;
}

/**
 * Call a function based on the environment.
 *
 * @param {Function} fn
 * @return {Plugin} self
 * @api public
 */

function use(env, fn) {
  !env && fn(this);
  env && isBrowser && rbrowser.test(env) && fn(this);
  env && !isBrowser && rserver.test(env) && fn(this);
  return this;
}
