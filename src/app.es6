const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const path = require('path');
const _ = require('lodash');
const microtime = require('microtime');
const gzipSize = require('gzip-size');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const Progger = require('progger');
const Logger = require(path.resolve(__dirname, './', 'logger'));
const util = require(path.resolve(__dirname, './', 'util'));
const css = require(path.resolve(__dirname, './', 'css'));
const image = require(path.resolve(__dirname, './', 'image'));
const analytics = require(path.resolve(__dirname, './', 'analytics'));
const p = new Progger({speed: 100, token: '.', color: 'blue'});

module.exports = (args, opts) => {

  // if sdout option set, supress output noise
  if (opts.stdout) {
    opts.verbose = false;
    opts.analytics = false;
  }

  const log = new Logger(opts);

  // input directory of SVG icons
  const inputDir = path.resolve(args[0]);

  // confirm input directory exists
  if (!fs.existsSync(inputDir)) {
    return log.msg('error', 'wrongDirectory');
  }

  // no output directory provided
  if (args.length < 2) {
    return log.msg('error', 'noOutputDir');
  }

  // output directory
  const outputDir = path.resolve(args[1]);

  // png directory
  const pngDir = outputDir + '/images';

  // if the output directory does not exist, create it
  if (!fs.existsSync(outputDir)) {
    mkdirp(pngDir);
  }

  // name of the CSS file output
  const cssFilename = (opts.filename !== null) ? util.trimExt(opts.filename) : 'iconr';

  // this is necessary to prevent the analytics from displaying
  // during an application error
  let showAnalytics = true;

  // stores results through the promise chain
  let results = [];

  // logs data about the application operations
  let appLog = {
    appStart: microtime.now(),
    appEnd: 0,
    svgCount: 0,
    svgSize: 0,
    cssSize: 0,
    cssGzipSize: 0
  };

  // starting app
  log.msg('info', 'appStart');

  // start of promise chain
  // read files in directory
  return fs.readdirAsync(inputDir).then((files) => {

    log.msg('info', 'filterNonSvg');

    // filter anything that isn't an SVG
    return util.filterNonSvgFiles(files, inputDir);

  }).then((svgFiles) => {

    // exit if no SVG images found
    if (svgFiles.length < 1) {
      showAnalytics = false;
      return log.msg('error', 'noSvg');
    }

    // store list of files after spaces (if any) have been removed
    let filteredFiles = [];

    // replace spaces in filenames
    svgFiles.forEach((filename) => {

      if (util.hasSpace(filename) === true) {
        log.msg('warn', 'spaceInFilename', filename);
        let newFilename = filename.split(' ').join('-');
        filteredFiles.push(newFilename);
        return util.replaceSpaceInFilename(filename, newFilename, inputDir);
      }

      return filteredFiles.push(filename);

    });

    return filteredFiles;

  }).then((filteredFiles) => {

    // read SVGs into memory
    log.msg('info', 'readingSvg');

    // log icon count
    appLog.svgCount = filteredFiles.length;

    let queue = [];

    filteredFiles.forEach((file) => {
      let svgPath = path.resolve(inputDir, file);
      queue.push(fs.readFileAsync(svgPath, 'utf8'));

      // log total file size of the SVG files we're optimizing
      appLog.svgSize += fs.statSync(svgPath).size;

      // add to results object
      return results.push({
        name: util.trimExt(file),
        svgpath: svgPath
      });
    });

    return Bluebird.all(queue);

  }).then((svgData) => {

    // optimize SVG data and get width & heights
    // note: optimization process is necessary even if it is not requested
    // in order to get SVG width & height
    log.msg('info', 'optimizingSvg');

    let queue = [];

    svgData.forEach((svg) => {
      return queue.push(image.optimizeSvg(svg));
    });

    return Bluebird.all(queue);

  }).then((data) => {

    // merge compressed & encoded SVG data into results
    log.msg('info', 'encodingSvg');

    return _.each(data, (obj, i) => {
      let encoding = opts.base64 ? 'base64' : '';
      let svgOut = opts.optimizesvg ? obj.data : obj.original;
      let svgData = {
        svgsrc: svgOut,
        svgdatauri: image.encode(svgOut, encoding, 'svg'),
        height: util.roundNum(obj.info.height),
        width: util.roundNum(obj.info.width)
      };
      return _.extend(results[i], svgData);
    });

  }).then(() => {

    if (!(opts.nopngdata && opts.nopng)) {

      // convert SVGs to PNGs
      log.msg('info', 'convertingSvg');

      let queue = [];

      _.each(results, (obj) => {
        let destFile = path.resolve(pngDir, obj.name + '.png');
        return queue.push(image.saveSvgAsPng(obj.svgpath, destFile, obj.height, obj.width));
      });

      // start progress dots
      p.start();

      return Bluebird.all(queue);

    }
  }).then((unfilteredPngPaths) => {

    // remove undefined items from path array
    let pngPaths = _.filter(unfilteredPngPaths, (pngPath) => {
      return pngPath !== undefined;
    });

    if (pngPaths !== null) {

      // stop progress dots
      p.stop();

      // read PNGs into memory
      log.msg('info', 'readingPng');

      let queue = [];

      pngPaths.forEach((pngPath, i) => {

        queue.push(fs.readFileAsync(pngPath, null));

        // PNG fallbacks enabled
        // make path relative to location of output css file then
        // add to results object
        if (!opts.nopng) {
          let pngpath = pngPath.replace(outputDir, '.');
          return _.extend(results[i], {pngpath: pngpath});
        }

      });

      return Bluebird.all(queue);
    }
  }).then((pngData) => {

    if (pngData !== null) {

      // convert PNGs to data strings
      log.msg('info', 'encodingPng');

      return pngData.forEach((data, i) => {

        // add to results object
        return _.extend(results[i], {
          pngdatauri: image.encode(data, 'base64', 'png')
        });

      });

    }
  }).then(() => {

    if (opts.nopng || opts.stdout) {

      // delete generated PNG directory
      log.msg('info', 'deletingPng');

      return rimraf(pngDir, (error) => {
        if (error) {
          throw error;
        }
      });

    }

  }).then(() => {

    // generate a string of CSS rules from the results
    log.msg('info', 'generatingCss');

    return css.createRules(results, opts);

  }).then((cssArray) => {

    let cssString = css.munge(cssArray);

    if (opts.stdout) {

      // send generated CSS to stdout
      log.msg('info', 'outputCss');

      // prettify the CSS if necessary
      if (opts.pretty) {
        cssString = util.prettyCss(cssString);
      }

      return process.stdout.write(cssString);
    }

    // save CSS & gzipped size
    appLog.cssSize = cssString.length;
    appLog.cssGzipSize = gzipSize.sync(cssString);

    // save generated CSS to file
    log.msg('info', 'saveCss');

    return css.save(path.resolve(outputDir, cssFilename), cssArray, opts);

  }).then(() => {

    if (!opts.nopngdata) {

      // number of bytes that will cause IE8 to choke on a datauri
      const TOO_BIG_FOR_IE8 = 32768;

      // check the size of the datauris and throw warning if too big
      return results.forEach((res) => {
        let size = (res.pngdatauri !== null) ? res.pngdatauri.length : void 0;
        if (size >= TOO_BIG_FOR_IE8 && opts.verbose) {
          return log.msg('warn', 'largeDataUri', res.name + ' (' + size + ' bytes)');
        }
      });

    }

  }).then(() => {

    // finished!
    return log.msg('info', 'appEnd');

  }).catch((error) => {

    // errors should output here
    if (opts.debug) {
      console.log(error.stack);
    }

    // if there's errors don't show analytics
    showAnalytics = false;

    return;

  }).finally(() => {

    // log the process analytics
    if (opts.analytics && showAnalytics) {
      appLog.appEnd = microtime.now();
      return analytics(appLog);
    }

  }).done();

};
