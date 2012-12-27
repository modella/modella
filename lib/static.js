
/**
 * Module dependencies.
 */

var noop = function(){};

/**
 * Construct a url to the given `path`.
 *
 * Example:
 *
 *    User.url('add')
 *    // => "/users/add"
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.url = function(path){
  var url = this.base;
  if (0 == arguments.length) return url;
  return url + '/' + path;
};

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
 * Use the given plugin `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.use = function(fn){
  fn(this);
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
  this.attrs[name] = options || {};

  // implied pk
  if ('_id' == name || 'id' == name) {
    this.attrs[name].primaryKey = true;
    this.primaryKey = name;
  }

  // getter / setter method
  this.prototype[name] = function(val){
    if (0 == arguments.length) return this.attrs[name];
    var prev = this.attrs[name];
    this.dirty[name] = val;
    this.attrs[name] = val;
    this.model.emit('change', this, name, val, prev);
    this.model.emit('change ' + name, this, val, prev);
    this.emit('change', name, val, prev);
    this.emit('change ' + name, val, prev);
    return this;
  };

  return this;
};

/**
 * Remove all and invoke `fn(err)`.
 *
 * @param {Function} [fn]
 * @api public
 */

exports.removeAll = function() {
  var args = [].slice.call(arguments),
      fn = args.pop() || noop,
      self = this,
      removeAll = this.sync.removeAll;

  removeAll.apply(this, args.concat(res));

  function res(err, body) {
    if(err) return fn(err);
    fn();
  }
};

/**
 * Get all and invoke `fn(err, array)`.
 *
 * @param {Function} fn
 * @api public
 */

exports.all = function() {
  var out = [];
      args = [].slice.call(arguments),
      fn = args.pop(),
      self = this,
      all = this.sync.all;

  all.apply(this, args.concat(res));

  function res(err, body) {
    if (err) return fn(err);
    else if(!body.length) return fn(null, out);

    for (var i = 0, len = body.length; i < len; ++i) {
      out.push(new self(body[i]));
    }

    fn(null, out);
  }
};

/**
 * Get `id` and invoke `fn(err, model)`.
 *
 * @param {Mixed} id
 * @param {Function} fn
 * @api public
 */

exports.get =
exports.find = function() {
  var args = [].slice.call(arguments),
      fn = args.pop(),
      self = this,
      get = this.sync.get || this.sync.find;

  get.apply(this, args.concat(res));

  function res(err, body) {
    if(err) return fn(err);
    var model = new self(body);
    fn(null, model);
  }
};
