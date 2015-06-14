[![NPM version](http://img.shields.io/npm/v/<%= name %>.svg?style=flat)](https://www.npmjs.org/package/<%= name %>)
[![Dependency Status](http://img.shields.io/david/okize/<%= name %>.svg?style=flat)](https://david-dm.org/okize/<%= name %>)
[![Build Status](http://img.shields.io/travis/okize/<%= name %>.svg?style=flat)](https://travis-ci.org/okize/<%= name %>)
[![Coverage Status](https://coveralls.io/repos/okize/<%= name %>/badge.svg)](https://coveralls.io/r/okize/<%= name %>)
[![bitHound Score](https://www.bithound.io/github/okize/<%= name %>/badges/score.svg)](https://www.bithound.io/github/okize/<%= name %>)
[![Downloads](http://img.shields.io/npm/dm/<%= name %>.svg?style=flat)](https://www.npmjs.org/package/<%= name %>)

# <%= name %>

## Description
<%= description %>

![iconr screenshot](https://raw.github.com/okize/iconr/gh-pages/iconr-screenshot.gif)

## Usage

```bash
iconr [inputDirectory] [outputDirectory] -options
```

## Options
<%= help %>

## Installing

```bash
  npm install -g <%= name %>
```

## Dependencies

Expects [Modernizr](http://modernizr.com/) classes on front-end.

## Contributing to <%= name %>

Contributions and pull requests are very welcome. Please follow these guidelines when submitting new code.

1. Make all changes in ./src, **not** in ./lib, which is a build target.
2. Use `npm install -d` to install the correct development dependencies.
3. Use `gulp watch` to generate <%= name %>'s compiled JavaScript files as you code.
4. Submit a Pull Request using GitHub.

## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
