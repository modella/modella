/**
 * Module Dependencies
 */

var toString = Object.prototype.toString;

/**
 * Expose `clone`
 */

module.exports = clone;

/**
 * Clone values. Do not clone objectid's
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

function clone(obj) {
  // do not clone objectid instances
  if(obj.toHexString) return obj;

  switch (type(obj)) {
    case 'object':
      var copy = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = clone(obj[key]);
        }
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


/**
 * Return the type of `val`.
 *
 * Pulled from github.com/component/type
 *
 * @param {Mixed} val
 * @return {String}
 * @api private
 */

function type(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val === Object(val)) return 'object';

  return typeof val;
}
