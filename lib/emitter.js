/**
 * TODO: Remove me when we resolve component/node interop
 *
 * https://github.com/component/component/issues/212
 * https://github.com/isaacs/npm/issues/3144
 */

/**
 * Emitter
 */

try {
  module.exports = require('emitter');
} catch(e) {
  module.exports = require('emitter-component');
}
