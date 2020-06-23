/*!
 * require-once - http://github.com/robloach/require-once
 * @license MIT
 *   http://opensource.org/licenses/MIT
 */

/**
 * Universal Module Definition: http://github.com/umdjs/umd
 *
 * Find out how we should load the packages.
 */
(function (root, factory) {
  /* global define */
  if (typeof define === 'function' && define.amd) {
    /**
     * AMD
     */
    define(function (require) {
      // Use AMD's require() wrapper.
      root.requireOne = factory(require);
      return root.requireOne;
    });
  } else if (typeof exports === 'object') {
    /**
     * CommonJS
     */
    module.exports = factory(require);
  } else {
    /**
     * Global scope
     */
    root.requireOne = factory(function (packageName) {
      if (packageName in root) {
        return root[packageName];
      }
      throw new Error('Package ' + packageName + 'not found');
    });
  }
})(this, function (requireFunction) {
  /**
   * Iterate through each package, returning the first loadable one.
   *
   * @param {(...string|string[])} packages - An array or argument list of
   *   strings representing which packages to load.
   *
   * @returns The first available package. Throws an error otherwise.
   *
   * @throws Throws an Error when none of the packages could be loaded.
   *
   * @global
   */
  return function (packages) {
    // Retrieve the list of package names.
    var packagesNames = Array.isArray(packages) ? packages : arguments;
    for (var i in packagesNames) {
      if (packagesNames[i]) {
        try {
          return requireFunction(packagesNames[i]);
        } catch (err) {
          // Do nothing, but continue on to the next package.
          continue;
        }
      }
    }
    throw new Error('Could not found one of the expected packages: ' + JSON.stringify(packages));
  };
});
