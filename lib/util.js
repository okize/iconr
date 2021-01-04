const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const path = require('path');
const mime = require('mime');

module.exports = {
  // trims file extension from filename
  trimExt: (filename) => filename.replace(/\.[^/.]+$/, ''),

  // returns a rounded string from a float or string
  roundNum: (num) => Math.round(num).toString(),

  // checks if there are spaces in the filename
  hasSpace: (filename) => filename.indexOf(' ') >= 0,

  // replaces spaces in filenames with dashes
  replaceSpaceInFilename: (oldFilename, newFilename, inDir) =>
    fs.renameSync(`${inDir}/${oldFilename}`, `${inDir}/${newFilename}`),

  // removes files from a list that aren't SVG images
  filterNonSvgFiles: (files, dir) =>
    files.filter((file) => {
      const isFile = fs.statSync(path.join(`${dir}/${file}`)).isFile() === true;
      const isSvg = mime.getType(file) === 'image/svg+xml';
      return isFile && isSvg;
    }),
};
