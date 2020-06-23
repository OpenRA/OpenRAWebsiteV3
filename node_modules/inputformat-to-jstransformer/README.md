# inputformat-to-jstransformer

Load the first available [JSTransformer](https://github.com/jstransformers/jstransformer) from the provided `inputFormat`.

[![Build Status](https://img.shields.io/travis/jstransformers/inputformat-to-jstransformer/master.svg)](https://travis-ci.org/jstransformers/inputformat-to-jstransformer)
[![Dependency Status](https://img.shields.io/david/jstransformers/inputformat-to-jstransformer/master.svg)](http://david-dm.org/jstransformers/inputformat-to-jstransformer)
[![Greenkeeper badge](https://badges.greenkeeper.io/jstransformers/inputformat-to-jstransformer.svg)](https://greenkeeper.io/)
[![NPM version](https://img.shields.io/npm/v/inputformat-to-jstransformer.svg)](https://www.npmjs.org/package/inputformat-to-jstransformer)

## Installation

    npm install inputformat-to-jstransformer

## API

### `(inputFormat)`

Returns the first package available to process the given `inputFormat`; `false` if no package is available.

```js
var jstransformer = require('jstransformer')
var inputFormatToTransformer = require('inputformat-to-jstransformer')

var md = inputFormatToTransformer('md')
// => remarkable, markdown, markdown-it, marko, or supermarked

jstransformer(md).render('# Hello World!').body
// => '<h1>Hello World!</h1>'
```

### `.dictionary`

The [`dictionary.json`](dictionary.json) array is also available:

``` js
var inputFormats = require('inputformat-to-jstransformer').dictionary
if (inputFormats['tiff']) {
  console.log('Input formats of Tiff are supported!')
}
```

## Update

To update `dictionary.json`, run:

```
npm run build
```

## License

MIT
