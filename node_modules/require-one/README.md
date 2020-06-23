# Require One [![NPM version](https://img.shields.io/npm/v/require-one.svg)](https://npmjs.org/package/require-one "View this project on NPM")

[![Build Status](https://img.shields.io/travis/RobLoach/require-one/master.svg)](http://travis-ci.org/RobLoach/require-one "Check this project's build status on TravisCI")
[![NPM downloads](https://img.shields.io/npm/dm/require-one.svg)](https://npmjs.org/package/require-one "View this project on NPM")
[![Dependency Status](https://img.shields.io/david/RobLoach/require-one.svg)](https://david-dm.org/RobLoach/require-one)

> Load the first package found from the given array.

## Install

Method | Installation
------ | ------------
[npm](http://npmjs.com/package/jquery-once) | `npm install require-one --save`
[component](https://github.com/componentjs/component) | `component install robloach/require-one`
[Composer](https://packagist.org/packages/robloach/require-one) | `composer require require-one`
[Bower](http://bower.io/search/?q=require-one) | `bower install require-one`

## Usage

This works across [CommonJS](https://webpack.github.io/docs/commonjs.html)/[node](http://nodejs.org), [AMD](http://requirejs.org/docs/whyamd.html#amd) and with global variables for the browser.

### CommonJS

This is an example of loading either [jQuery](http://jquery.com), [Zepto](http://zeptojs.com), or [Cheerio](http://cheeriojs.github.io/cheerio) with a CommonJS module loader, like [Node.js](http://nodejs.org).

``` javascript
var $ = requireOne('jquery', 'zepto', 'cheerio');
// => jQuery, Zepto or Cheerio, depending on which one is available.
```

### AMD

This is an example of loading either [jQuery](http://jquery.com), [Zepto](http://zeptojs.com), or [Cheerio](http://cheeriojs.github.io/cheerio) with an AMD module loader, like [Require.js](http://requirejs.org).

``` javascript
require(['require-one'], function(requireOne) {

  // Retrieve the first package that is available.
  var $ = requireOne('jquery', 'zepto', 'cheerio');
  // => jQuery, Zepto or Cheerio, depending on which one is available.

  // ...
});
```

### Globals

This is an example of loading either [jQuery](http://jquery.com), [Zepto](http://zeptojs.com), or [Cheerio](http://cheeriojs.github.io/cheerio) without a module loader, i.e. with the browser's global variables.

``` html
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript" src="path/to/require-one.js"></script>
    <script>
      var $ = requireOne('jquery', 'jQuery', 'zepto', 'Zepto', 'cheerio');
      // => jQuery, Zepto or Cheerio, depending on which one is available.
    </script>
  </head>
  <body>
    <h1>My Sample Project</h1>
  </body>
</html>
```

## License

[MIT](LICENSE.md)
