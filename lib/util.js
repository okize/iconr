const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const path = require('path');
const mime = require('mime');

module.exports = {
  // trims file extension from filename
  trimExt: (filename) => {
    return filename.replace(/\.[^/.]+$/, '');
  },

  // returns a rounded string from a float or string
  roundNum: (num) => {
    return Math.round(num).toString();
  },

  // checks if there are spaces in the filename
  hasSpace: (filename) => {
    return filename.indexOf(' ') >= 0;
  },

  // replaces spaces in filenames with dashes
  replaceSpaceInFilename: (oldFilename, newFilename, inDir) => {
    return fs.renameSync(`${inDir}/${oldFilename}`, `${inDir}/${newFilename}`);
  },

  // removes files from a list that aren't SVG images
  filterNonSvgFiles: (files, dir) => {
    return files.filter((file) => {
      const isFile = fs.statSync(path.join(`${dir}/${file}`)).isFile() === true;
      const isSvg = mime.getType(file) === 'image/svg+xml';
      return isFile && isSvg;
    });
  },
};
