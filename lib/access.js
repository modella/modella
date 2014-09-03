/**
 * Export `access`
 */

module.exports = access;

/**
 * Access
 *
 * @param {Object} obj
 * @param {String} prop
 * @param {Function} setter
 * @param {Function} getter (optional)
 */

function access(obj, prop, setter, getter) {
  var config = { enumerable: true };
  if (setter) config.set = setter;
  if (getter) config.get = 'function' == typeof getter ? getter : get;
  Object.defineProperty(obj, prop, config);
  return obj;
}

/**
 * Default getter
 *
 * @return {Self}
 */

function get() {
  return this;
}
