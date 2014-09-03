/**
 * Module Dependencies
 */

var access = require('./access');
var co = require('co');

/**
 * Export `mixin`
 */

module.exports = sync;

/**
 * Environment mixin
 *
 * @param {String} env
 * @param {Model|Object} model
 * @return {Plugin}
 * @api private
 */

function sync(obj, syncs) {
  // setup the setter for obj.sync
  obj.sync = obj.sync || {};
  obj.syncs = [];

  // set up the syncs
  syncs.forEach(function(sync) {
    obj.syncs[sync] = [];
    access(obj.sync, sync, set(obj.syncs[sync]), get(obj, sync));
  });

  return obj;
}

/**
 * Set
 *
 * @param {Array} sync
 * @return {Function}
 */

function set(sync) {
  return function(fn) {
    fn = generator(fn) ? co(fn) : fn;
    sync.push(fn);
    return this;
  }
}

/**
 * Getter
 *
 * @param {String} sync
 * @return {Array}
 */

function get(obj, sync) {
  return function () {
    return obj.syncs[sync] || [];
  }
}

/**
 * Is `value` a generator?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function generator(value) {
  return value
    && value.constructor
    && 'GeneratorFunction' == value.constructor.name;
}

/**
 * Setup for obj.sync
 *
 * @param {Object} obj
 */

// function each(obj) {
//   return function (v) {
//     for (var k in v) obj.syncs[k] = v[k];
//   }
// }

// var obj = {};
// sync(obj, ['create', 'update', 'find', 'all', 'remove']);
// obj.sync.create = function a() {};
// obj.sync.create = function b() {};
// obj.sync.create = function c() {};
// obj.sync.update = function c() {};

// obj.sync = {
//   update: function d() {},
//   all: function e() {}
// };

// console.log(obj.sync);

// console.log(obj.sync.create);
// console.log(obj.create);

