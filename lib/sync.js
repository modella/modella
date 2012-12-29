/**
 * AJAX Transport
 */

/**
 * Module dependencies
 */

var request = require('superagent');

/**
 * All
 */

exports.all = function(fn) {
  var url = this.url('all');
  request.get(url, function(res) {
    fn(res.error, res.body);
  });
};

/**
 * Get
 */

exports.get = function(id, fn) {
  var url = this.url(id);
  request.get(url, function(res) {
    fn(res.error, res.body);
  });
};

/**
 * removeAll
 */

exports.removeAll = function(fn) {
  var url = this.url('all');
  request.del(url, function(res) {
    fn(res.error, res.body);
  });
};

/**
 * save
 */

exports.save = function(fn) {
  var url = this.model.url();
  request.post(url, this, function(res) {
    fn(res.error, res.body);
  });
};

/**
 * update
 */

exports.update = function(fn) {
  var url = this.url();
  request.put(url, this.changed(), function(res) {
    fn(res.error, res.body);
  });
};

/**
 * remove
 */

exports.remove = function(fn) {
  var url = this.url();
  request.del(url, function(res) {
    fn(res.error, res.body);
  });
};
