;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("ForbesLindesay-is-browser/client.js", function(exports, require, module){
module.exports = true;
});
require.register("modella/index.js", function(exports, require, module){
/**
 * Module dependencies
 */

var modella = module.exports = require('./lib/model');

modella.utils = {};
modella.utils.clone = require('./lib/utils/clone');
modella.utils.type = require('./lib/utils/type');

});
require.register("modella/lib/model.js", function(exports, require, module){
/**
 * Module dependendencies
 */

var proto = require('./proto');
var statics = require('./static');
var clone = require('./utils/clone');

try {
  var Emitter = require('emitter');
} catch(e) {
  var Emitter = require('emitter-component');
}

/**
 * Expose `createModel`.
 */

module.exports = createModel;


/**
 * Create a new model constructor with the given `name`.
 *
 * @param {String} name
 * @return {Function}
 * @api public
 */

function createModel(name) {
  if ('string' !== typeof name) { throw new TypeError('model name required'); }

  /**
   * Initialize a new model with the given `attrs`.
   *
   * @param {Object} attrs
   * @api public
   */

  function Model(attrs) {
    if (!(this instanceof Model)) {
      return new Model(attrs);
    }
    if(Array.isArray(attrs)) {
      var result = [];
      for(var i = 0; i < attrs.length; ++i) {
        result.push(new Model(attrs[i]));
      }
      return result;
    }

    attrs = (attrs) ? clone(attrs) : {};
    this.attrs = {};
    this._callbacks = {};
    this.dirty = {};
    this.errors = [];

    Model.emit('initializing', this, attrs);

    // Set the default values
    for (var attr in Model._defaults) {
      if (Model.attrs[attr]) {
        this.attrs[attr] = clone(Model._defaults[attr]);
      }
    }

    // Only add attributes that are in the model schema
    for (var attr in attrs) {
      if (Model.attrs[attr]) {
        this.attrs[attr] = attrs[attr];
      }
    }
    Model.emit('initialize', this);
  }

  // mixin `Emitter`

  Emitter(Model);

  // Statics

  Model.modelName = name;
  Model.base = '/' + name.toLowerCase();
  Model.attrs = {};
  Model.validators = [];

  Model._defaults = {};

  for (var key in statics) { Model[key] = statics[key]; }

  // Prototype

  Model.prototype = {};
  Model.prototype.model = Model;
  for (var key in proto) { Model.prototype[key] = proto[key]; }

  return Model;
}

});
require.register("modella/lib/proto.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var clone = require('./utils/clone');
var noop = function(){};

try {
  var Emitter = require('emitter');
} catch(e) {
  var Emitter = require('emitter-component');
}

/**
 * Mixin emitter.
 */

Emitter(exports);

/**
 * Register an error `msg` on `attr`.
 *
 * @param {String} attr
 * @param {String} msg
 * @return {Object} self
 * @api public
 */

exports.error = function(attr, msg){
  this.errors.push({
    attr: attr,
    message: msg
  });
  return this;
};

/**
 * Check if this model is new.
 *
 * @return {Boolean}
 * @api public
 */

exports.isNew = function(){
  var key = this.model.primaryKey;
  return ! this.has(key);
};

/**
 * Get / set the primary key.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

exports.primary = function(val){
  var key = this.model.primaryKey;
  if (0 == arguments.length) return this[key]();
  return this[key](val);
};

/**
 * Validate the model and return a boolean.
 *
 * Example:
 *
 *    user.isValid()
 *    // => false
 *
 *    user.errors
 *    // => [{ attr: ..., message: ... }]
 *
 * @return {Boolean}
 * @api public
 */

exports.isValid = function(){
  this.validate();
  return 0 == this.errors.length;
};

/**
 * Return `false` or an object
 * containing the "dirty" attributes.
 *
 * Optionally check for a specific `attr`.
 *
 * @param {String} [attr]
 * @return {Object|Boolean}
 * @api public
 */

exports.changed = function(attr){
  if (1 == arguments.length) {
    return !! this.dirty[attr];
  }

  var ret = {};
  for (var attr in this.dirty) {
    ret[attr] = this.dirty[attr];
  }
  return ret;
};

/**
 * Perform validations.
 *
 * @api private
 */

exports.validate = function() {
  var fns = this.model.validators || [];
  this.errors = [];
  for (var i = 0, len = fns.length; i < len; i++) fns[i](this);
  if(this.errors.length) {
    this.model.emit('invalid', this, this.errors);
    this.emit('invalid', this.errors);
  } else {
    this.model.emit('valid', this, null);
    this.emit('valid', null);
  }
};

/**
 * Destroy the model and mark it as `.removed`
 * and invoke `fn(err)`.
 *
 * Events:
 *
 *  - `removing` before deletion
 *  - `remove` on deletion
 *
 * @param {Function} [fn]
 * @api public
 */

exports.remove = function(){
  var args = [].slice.call(arguments),
      fn = args.pop() || noop,
      self = this;

  var remove = this.model.remove;
  // Backwards-compatibiity with _sync
  if (!this.model.remove && this.model._sync) {
    remove = this.model._sync.remove;
  }

  if (this.isNew()) { return fn(new Error('not saved')); }

  this.run('removing', function() {
    remove.apply(self, args.concat(res));
  });

  function res(err, body) {
    if(err) {
      self.emit('error', err);
      return fn(err);
    }
    self.removed = true;
    self.model.emit('remove', self);
    self.emit('remove');
    fn(null, self);
  }
};

/**
 * Save and invoke `fn(err)`.
 *
 * Events:
 *
 *  - `save` on updates and saves
 *  - `saving` pre-update or save, after validation
 *
 * @param {Function} [fn]
 * @api public
 */

exports.save = function(){
  var args = [].slice.call(arguments),
      fn = args.pop() || noop,
      operation = 'save',
      self = this;

  var isNew = this.isNew();

  if (!isNew) {
    var changed = this.changed();
    operation = 'update';
    if(!changed) return fn(null, this);
  }

  var save = this.model[operation];
  // Backwards-compatibiity with _sync
  if (!this.model[operation] && this.model._sync) {
    save = this.model._sync[operation];
  }

  if (!this.isValid()) {
    this.primary(null);
    return fn(new Error('validation failed'));
  }

  this.run('saving', function(err) {
    if (err) return fn(err);
    if(isNew) {
      self.run('creating', function(err) {
        if (err) return fn(err);
        save.apply(self, args.concat(res));
      });
    } else {
      save.apply(self, args.concat(res));
    }
  });


  function res(err, body) {
    if (err) {
      self.emit('error', err);
      return fn(err);
    }

    if (body) {
      self.primary(body.id || body._id);
      for(var attr in self.model.attrs) {
        self.attrs[attr] = body[attr];
      }
    }
    self.dirty = {};
    if(isNew) {
      self.model.emit('create', self);
      self.emit('create');
    }
    self.model.emit('save', self);
    self.emit('save');
    fn(null, self);
  }
};

/**
 * Set multiple `attrs`.
 *
 * @param {Object} attrs
 * @return {Object} self
 * @api public
 */

exports.set = function(attrs){
  this.model.emit('setting', this, attrs);
  this.emit('setting', attrs);
  for (var key in attrs) {
    if(this.model.attrs[key]) {
      this[key](attrs[key]);
    }
  }
  return this;
};

/**
 * Get `attr` value.
 *
 * @param {String} attr
 * @return {Mixed}
 * @api public
 */

exports.get = function(attr){
  return this.attrs[attr];
};

/**
 * Check if `attr` is present (not `null` or `undefined`).
 *
 * @param {String} attr
 * @return {Boolean}
 * @api public
 */

exports.has = function(attr){
  return undefined !== this.attrs[attr];
};

/**
 * Return the JSON representation of the model.
 *
 * @return {Object}
 * @api public
 */

exports.toJSON = function(){
  return clone(this.attrs);
};

/**
 * Run functions beforehand
 *
 * @param {String} event
 * @param {Function} fn
 * @api private
 */

exports.run = function(ev, done) {
  var modelFns = this.model.listeners(ev),
      fns = this.listeners(ev);

  var self = this;

  self.errors = [];

  function next(err) {
    if(err) return done(err);

    if (ev === 'saving' && (self.errors.length || !self.isValid())) {
      return done(new Error('validation failed'));
    }

    if(modelFns.length) {
      modelFns.shift().call(self, self, next);
    } else if(fns.length) {
      fns.shift().call(self, next);
    } else {
      done(err);
    }
  }

  next();
};

});
require.register("modella/lib/static.js", function(exports, require, module){

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

    // implied pk
    if ('_id' === name || 'id' === name) {
      this.attrs[name].primaryKey = true;
      this.primaryKey = name;
    }


    // getter / setter method
    this.prototype[name] = function(val){
      if (0 === arguments.length) { return clone(this.attrs[name]); }
      var prev = this.attrs[name];
      val = clone(val);

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

});
require.register("modella/lib/utils/clone.js", function(exports, require, module){
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

});
require.register("modella/lib/utils/type.js", function(exports, require, module){
/**
 * https://github.com/component/type
 *
 * TODO: un-bundle, once we have a way to use component and node together
 */

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});




require.alias("component-emitter/index.js", "modella/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ForbesLindesay-is-browser/client.js", "modella/deps/is-browser/client.js");
require.alias("ForbesLindesay-is-browser/client.js", "modella/deps/is-browser/index.js");
require.alias("ForbesLindesay-is-browser/client.js", "is-browser/index.js");
require.alias("ForbesLindesay-is-browser/client.js", "ForbesLindesay-is-browser/index.js");if (typeof exports == "object") {
  module.exports = require("modella");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("modella"); });
} else {
  this["modella"] = require("modella");
}})();