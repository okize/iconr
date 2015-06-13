'use strict';

var Bluebird = require('bluebird');
var fs = Bluebird.promisifyAll(require('fs'));
var path = require('path');
var mime = require('mime');
var _ = require('lodash');

module.exports = {

  // trims file extension from filename
  trimExt: function trimExt(filename) {
    return filename.replace(/\.[^\/.]+$/, '');
  },

  // returns a rounded string from a float or string
  roundNum: function roundNum(num) {
    return Math.round(num).toString();
  },

  // checks if there are spaces in the filename
  hasSpace: function hasSpace(filename) {
    return filename.indexOf(' ') >= 0;
  },

  // replaces spaces in filenames with dashes
  replaceSpaceInFilename: function replaceSpaceInFilename(oldFilename, newFilename, inDir) {
    return fs.renameSync(inDir + '/' + oldFilename, inDir + '/' + newFilename);
  },

  // removes files from a list that aren't SVG images
  filterNonSvgFiles: function filterNonSvgFiles(files, dir) {
    return _.filter(files, function (file) {
      var isFile = fs.statSync(path.join(dir + '/' + file)).isFile() === true;
      var isSvg = mime.lookup(file) === 'image/svg+xml';
      return isFile && isSvg;
    });
  }

};