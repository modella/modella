/**
 * Module dependencies
 */

var batch = require('better-batch');

/**
 * Export `Sync`
 */

module.exports = Sync;

/**
 * Sync methods
 */

var syncs = [
  'fetch',
  'create',
  'update',
  'remove'
];

/**
 * Initialize `Sync`
 *
 * @param {Model|Object} model
 * @return {Sync}
 * @api public
 */

function Sync(model) {
  if (!(this instanceof Sync)) return new Sync(model);
  this.model = model;
  this.sync = {};
}

/**
 * Create methods for each
 * of the syncs.
 *
 * @param {Function} fn
 * @return {Sync}
 * @api public
 */

syncs.forEach(function(method) {
  Sync.prototype[method] = function(fn) {
    this.sync[method] = this.sync[method] || batch();
    this.sync[method].push(fn);
    return this;
  }
});

/**
 * Run the sync on a given `event`
 */

Sync.prototype.run = function(event, fn) {
  var sync = this.sync[event];
  if (!sync) return fn(new Error('no sync method'));
  // sync.end(this.model, )
}
