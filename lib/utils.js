/**
 * Clone values, made to work both in node.js and component
 */

exports.clone = (function() {
  try {
    return require('clone');
  } catch(e) {
    return require('clone-component');
  }
})();
