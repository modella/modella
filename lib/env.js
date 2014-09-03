/**
 * Export `Env`
 */

module.exports = Env;

/**
 * Initialize `Env`
 *
 * @param {String} env
 * @param {Model|Object} model
 * @return {Env}
 * @api private
 */

function Env(env, model) {
  if (!(this instanceof Env)) return new Env(env, model);
  this.model = model;
  this.env = env;
}

/**
 * Use a plugin. Proxy to model.
 *
 * @param {Function} fn
 * @return {Env} self
 * @api public
 */

Env.prototype.use = function(fn) {
  this.model.use(fn, this.env);
  return this;
}
