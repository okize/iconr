const Bluebird = require('bluebird');
const proc = Bluebird.promisifyAll(require('child_process'));
const path = require('path');
const _ = require('lodash');
const SvgOptimize = require('svgo');

module.exports = {

  // returns binary data as encoded string
  encode: (data, type, format) => {
    let encoded = '';
    let str = ',';
    const formatMap = {
      'svg': '\'data:image/svg+xml',
      'png': '\'data:image/png'
    };
    if (type === 'base64') {
      str = ';base64,';
      encoded = new Buffer(data).toString('base64');
    } else {
      encoded = encodeURIComponent(new Buffer(data).toString());
    }
    return formatMap[format] + str + encoded + '\'';
  },

  // returns an optimized SVG data string as a promise
  // also appends the original SVG data to the SVGO output
  optimizeSvg: (data) => {
    const svgo = Bluebird.promisifyAll(new SvgOptimize());
    return svgo
            .optimizeAsync(data)
            .catch((result) => {
              // I have no idea why this needs to be done in a catch block
              _.assign(result, {original: data});
              return result;
            });
  },

  // spins up phantomjs and saves SVGs as PNGs
  // phantomjs will output WARNINGS to stderr so ignore for now
  saveSvgAsPng: (sourceFileName, destinationFileName, height, width) => {
    const phantomjs = path.resolve(__dirname, '../node_modules/phantomjs/bin/', 'phantomjs');
    const svgToPngFile = path.resolve(__dirname, './', 'svgToPng.js');
    let args = [phantomjs, svgToPngFile, sourceFileName, destinationFileName, height, width];
    return proc
            .execFileAsync(process.execPath, args)
            .then((stdout) => {
              if (stdout[0].length > 0) {
                throw new Error(stdout[0].toString().trim());
              } else {
                return destinationFileName;
              }
            })
            .catch((err) => {
              console.error(err);
            });
  }

};
