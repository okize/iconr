const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const _ = require('lodash');
const pretty = require('cssbeautify');

module.exports = {

  // returns a string that can be saved as a CSS file
  createRules: (results, opts) => {
    const cssClassnamePrefix = opts.classname !== null ? opts.classname : '';
    let css = [];
    let cssSvg = '';
    let cssNoInlineSvg = '';
    let cssNoDataUri = '';
    if (!opts.killcomment) {
      cssSvg += '/* generated by iconr */\n\n';
    }

    _.each(results, (result) => {
      let height = !isNaN(result.height) ? 'height:' + result.height + 'px;' : '';
      let width = !isNaN(result.width) ? 'width:' + result.width + 'px;' : '';
      cssSvg += '.#' + (cssClassnamePrefix + result.name) + '{' + height + width + 'background-image:url("' + result.svgdatauri + '");}';
      if (!opts.nopngdata) {
        cssNoInlineSvg += '.no-inlinesvg .' + (cssClassnamePrefix + result.name) + '{background-image:url("' + result.pngdatauri + '");}';
      }
      if (!opts.nopng && !opts.stdout) {
        cssNoDataUri += '.no-datauri .' + (cssClassnamePrefix + result.name) + '{background-image:url("' + result.pngpath + '");}';
      }
    });

    css.push(cssSvg, cssNoInlineSvg, cssNoDataUri);

    return css;
  },

  // returns a "beautified" version of a css string
  prettyCss: (css) => {
    return pretty(css);
  },

  // merge the css array into a string
  munge: (cssArray) => {
    return cssArray.join('');
  },

  // saves CSS file(s) to disk
  // can't use arrow syntax here because of "this" reference
  save: function saveCss(filename, cssArr, opts) {

    let css;

    // save separate css files
    if (opts.separatecss) {

      // prettify the CSS if necessary
      css = opts.pretty ? cssArr.map((cssStr) => pretty(cssStr)) : css;

      // save CSS with SVG data URIs
      fs.writeFileAsync(filename + '.css', css[0]);

      // save CSS with fallback PNG data URIs
      if (!opts.nopngdata && (css[1].length !== 0)) {
        fs.writeFileAsync(filename + '-noinlinesvg.css', css[1]);
      }

      // save CSS with fallback PNG image paths
      if (!opts.nopng && (css[2].length !== 0)) {
        fs.writeFileAsync(filename + '-nodatauri.css', css[2]);
      }

    } else {

      // combine CSS into string
      css = this.munge(cssArr);

      // prettify the CSS if necessary
      if (opts.pretty) {
        css = this.prettyCss(css);
      }

      // write CSS into a single file
      fs.writeFileAsync(filename + '.css', css);

    }

    return;
  }

};