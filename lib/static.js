
/**
 * Module dependencies.
 */

var clone = require('./utils/clone'),
    type = require('./utils/type'),
    isBrowser = require('is-browser'),
    noop = function(){};

/**
 * Add validation `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.validate = function(fn){
  this.validators.push(fn);
  return this;
};

/**
 * Use the given plugin `fn()`. If `env` is specified, only use the plugin on the appropriate client.
 *
 * @param {String} [env]
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.use = function(env, fn){
  if(!fn) {
    fn = env;
    env = undefined;
  }

  if(!env) {
    fn(this);
  } else {
    var rbrowser = /browser|client/,
        rserver = /server|node|node.js/;

    if(isBrowser && rbrowser.test(env)) fn(this);
    else if(!isBrowser && rserver.test(env)) fn(this);
  }
  return this;
};

/**
 * Define attr with the given `name` and `options`.
 *
 * @param {String} name
 * @param {Object} options
 * @return {Function} self
 * @api public
 */

exports.attr = function(name, options){
  if(!this.attrs[name]) {
    this.attrs[name] = options || {};

    // implied vs. explicit pk
    if ('_id' === name || 'id' === name) {
      this.attrs[name].primaryKey = true;
      this.primaryKey = name;
    } else if (this.attrs[name].primaryKey) {
      var pk = this.primaryKey;

      // remove old one
      if (pk && this.attrs[pk]) delete this.attrs[pk].primaryKey;

      // set new one
      this.attrs[name].primaryKey = true;
      this.primaryKey = name;
    }

    // getter / setter method
    this.prototype[name] = function(val){
      if (0 === arguments.length) { return clone(this.attrs[name]); }
      var prev = this.attrs[name];
      if (val === undefined) {
        this.unsetAttrs[name] = true;
      } else {
        val = clone(val);
      }

      // Check if it actually changed
      var changed = false,
          newType = type(val);
      if(newType == 'object' || newType == 'array') {
        changed = true;
      } else
        changed = this.attrs[name] != val;

      if(changed) {
        this.dirty[name] = val;
        this.attrs[name] = val;
        this.model.emit('change', this, name, val, prev);
        this.model.emit('change ' + name, this, val, prev);
        this.emit('change', name, val, prev);
        this.emit('change ' + name, val, prev);
      }
      return this;
    };
  } else {
    // Copy in the options if it already exists
    for(var key in options) {
      this.attrs[name][key] = options[key];
    }
  }
  // Check for defaultValue
  if (options && options.defaultValue !== undefined) {
    this._defaults[name] = options.defaultValue;
  }

  this.emit('attr', name, options);

  return this;
};
