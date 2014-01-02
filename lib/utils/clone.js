/**
 * TODO: cleanup. This is a pretty big hack. inlined `clone` because
 * it cannot handle objectid instances
 */

/**
 * Module dependencies
 */

var type = require('./type');

/**
 * Expose `clone`
 */

module.exports = clone;

/**
 * Clone values.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

function clone(obj) {
  switch (type(obj)) {
    case 'object':
      // Hack for BSON IDs
      if(obj.toHexString)
        return obj;
      var copy = {};
      for (var key in obj) {
        copy[key] = clone(obj[key]);
      }
      return copy;

    case 'array':
      var copy = new Array(obj.length);
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;

    case 'regexp':
      // from millermedeiros/amd-utils - MIT
      var flags = '';
      flags += obj.multiline ? 'm' : '';
      flags += obj.global ? 'g' : '';
      flags += obj.ignoreCase ? 'i' : '';
      return new RegExp(obj.source, flags);

    case 'date':
      return new Date(obj.getTime());

    default: // string, number, boolean, …
      return obj;
  }
}
