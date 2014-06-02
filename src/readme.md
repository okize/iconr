# iconr [![NPM version](https://badge.fury.io/js/iconr.png)](http://badge.fury.io/js/iconr) [![NPM version](https://david-dm.org/okize/iconr.png)](https://david-dm.org/okize/iconr)

## Description
Parses a directory of SVG images and outputs a CSS file of inlined data URIs as well as a directory of PNG images for fallback.

![Iconr Screenshot](https://raw.github.com/okize/iconr/gh-pages/iconr-screenshot.gif)

## Usage

```
<%= helpfile %>
```

## Dependencies

Expects [Modernizr](http://modernizr.com/) classes on front-end.

## Contributing to Iconr

Contributions and pull requests are very welcome. Please follow these guidelines when submitting new code.

1. Make all changes in Coffeescript files, **not** JavaScript files.
2. For feature changes, update both jQuery *and* Prototype versions
3. Use `npm install -d` to install the correct development dependencies.
4. Use `cake build` or `cake watch` to generate Iconr's JavaScript file and minified version.
5. Don't touch the `VERSION` file
6. Submit a Pull Request using GitHub.

### Using CoffeeScript & Cake

First, make sure you have the proper CoffeeScript / Cake set-up in place. We have added a package.json that makes this easy:

```
npm install -d
```

This will install `coffee-script` and `uglifyjs`.

Once you're configured, building the JavasScript from the command line is easy:

    cake build                # build Iconr from source
    cake watch                # watch coffee/ for changes and build Iconr

If you're interested, you can find the recipes in Cakefile.

## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).

[![NPM](https://nodei.co/npm/iconr.png?downloads=true)](https://nodei.co/npm/iconr/)