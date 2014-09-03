/**
 * Module dependencies
 */

var ware = require('ware');

/**
 * Export `Hook`
 */

module.exports = Hook;

/**
 * Events
 */

var events = [
  'any'
  'save',
  'fetch',
  'create',
  'update',
  'saving',
  'remove',
  'creating',
  'fetching',
  'updating',
  'removing'
];

/**
 * Hooks
 */

var hooks = [
  'before',
  'after'
];

/**
 * Initialize `Hook`
 *
 * @param {Model|Object} model
 * @return {Hook}
 * @api public
 */

function Hook(model) {
  if (!(this instanceof Hook)) return new Hook(model);
  this.model = model;
  this.events = {};
}

/**
 * Create methods for each
 * of the events.
 *
 * @param {Function} fn
 * @return {Hook}
 * @api public
 */

events.forEach(function(method) {
  Hook.prototype[method] = function(fn) {
    this.events[method] = this.events[method] || ware();
    this.events[method].use(fn);
    return this;
  }
});

/**
 * Support .before() & .after()
 * chaining with model redirection.
 *
 * @return {Hook}
 * @api public
 */

hooks.forEach(function(method) {
  Hook.prototype[method] = function() {
    return this.model[method]();
  };
})
