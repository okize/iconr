'use strict';

var Bluebird = require('bluebird');
var fs = Bluebird.promisifyAll(require('fs'));
var path = require('path');
var _ = require('lodash');
var microtime = require('microtime');
var gzipSize = require('gzip-size');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var Progger = require('progger');
var Logger = require(path.resolve(__dirname, './', 'logger'));
var util = require(path.resolve(__dirname, './', 'util'));
var css = require(path.resolve(__dirname, './', 'css'));
var image = require(path.resolve(__dirname, './', 'image'));
var analytics = require(path.resolve(__dirname, './', 'analytics'));
var p = new Progger({ speed: 100, token: '.', color: 'blue' });

module.exports = function (args, opts) {

  // if sdout option set, supress output noise
  if (opts.stdout) {
    opts.verbose = false;
    opts.analytics = false;
  }

  var log = new Logger(opts);

  // input directory of SVG icons
  var inputDir = path.resolve(args[0]);

  // confirm input directory exists
  if (!fs.existsSync(inputDir)) {
    return log.msg('error', 'wrongDirectory');
  }

  // no output directory provided
  if (args.length < 2) {
    return log.msg('error', 'noOutputDir');
  }

  // output directory
  var outputDir = path.resolve(args[1]);

  // png directory
  var pngDir = outputDir + '/images';

  // if the output directory does not exist, create it
  if (!fs.existsSync(outputDir)) {
    mkdirp(pngDir);
  }

  // name of the CSS file output
  var cssFilename = opts.filename !== null ? util.trimExt(opts.filename) : 'iconr';

  // this is necessary to prevent the analytics from displaying
  // during an application error
  var showAnalytics = true;

  // stores results through the promise chain
  var results = [];

  // logs data about the application operations
  var appLog = {
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
  return fs.readdirAsync(inputDir).then(function (files) {

    log.msg('info', 'filterNonSvg');

    // filter anything that isn't an SVG
    return util.filterNonSvgFiles(files, inputDir);
  }).then(function (svgFiles) {

    // exit if no SVG images found
    if (svgFiles.length < 1) {
      showAnalytics = false;
      return log.msg('error', 'noSvg');
    }

    // store list of files after spaces (if any) have been removed
    var filteredFiles = [];

    // replace spaces in filenames
    svgFiles.forEach(function (filename) {

      if (util.hasSpace(filename) === true) {
        log.msg('warn', 'spaceInFilename', filename);
        var newFilename = filename.split(' ').join('-');
        filteredFiles.push(newFilename);
        return util.replaceSpaceInFilename(filename, newFilename, inputDir);
      }

      return filteredFiles.push(filename);
    });

    return filteredFiles;
  }).then(function (filteredFiles) {

    // read SVGs into memory
    log.msg('info', 'readingSvg');

    // log icon count
    appLog.svgCount = filteredFiles.length;

    var queue = [];

    filteredFiles.forEach(function (file) {
      var svgPath = path.resolve(inputDir, file);
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
  }).then(function (svgData) {

    // optimize SVG data and get width & heights
    // note: optimization process is necessary even if it is not requested
    // in order to get SVG width & height
    log.msg('info', 'optimizingSvg');

    var queue = [];

    svgData.forEach(function (svg) {
      return queue.push(image.optimizeSvg(svg));
    });

    return Bluebird.all(queue);
  }).then(function (data) {

    // merge compressed & encoded SVG data into results
    log.msg('info', 'encodingSvg');

    return _.each(data, function (obj, i) {
      var encoding = opts.base64 ? 'base64' : '';
      var svgOut = opts.optimizesvg ? obj.data : obj.original;
      var svgData = {
        svgsrc: svgOut,
        svgdatauri: image.encode(svgOut, encoding, 'svg'),
        height: util.roundNum(obj.info.height),
        width: util.roundNum(obj.info.width)
      };
      return _.extend(results[i], svgData);
    });
  }).then(function () {

    if (!(opts.nopngdata && opts.nopng)) {
      var _ret = (function () {

        // convert SVGs to PNGs
        log.msg('info', 'convertingSvg');

        var queue = [];

        _.each(results, function (obj) {
          var destFile = path.resolve(pngDir, obj.name + '.png');
          return queue.push(image.saveSvgAsPng(obj.svgpath, destFile, obj.height, obj.width));
        });

        // start progress dots
        p.start();

        return {
          v: Bluebird.all(queue)
        };
      })();

      if (typeof _ret === 'object') return _ret.v;
    }
  }).then(function (unfilteredPngPaths) {

    // remove undefined items from path array
    var pngPaths = _.filter(unfilteredPngPaths, function (pngPath) {
      return pngPath !== undefined;
    });

    if (pngPaths !== null) {
      var _ret2 = (function () {

        // stop progress dots
        p.stop();

        // read PNGs into memory
        log.msg('info', 'readingPng');

        var queue = [];

        pngPaths.forEach(function (pngPath, i) {

          queue.push(fs.readFileAsync(pngPath, null));

          // PNG fallbacks enabled
          // make path relative to location of output css file then
          // add to results object
          if (!opts.nopng) {
            var pngpath = pngPath.replace(outputDir, '.');
            return _.extend(results[i], { pngpath: pngpath });
          }
        });

        return {
          v: Bluebird.all(queue)
        };
      })();

      if (typeof _ret2 === 'object') return _ret2.v;
    }
  }).then(function (pngData) {

    if (pngData !== null) {

      // convert PNGs to data strings
      log.msg('info', 'encodingPng');

      return pngData.forEach(function (data, i) {

        // add to results object
        return _.extend(results[i], {
          pngdatauri: image.encode(data, 'base64', 'png')
        });
      });
    }
  }).then(function () {

    if (opts.nopng || opts.stdout) {

      // delete generated PNG directory
      log.msg('info', 'deletingPng');

      return rimraf(pngDir, function (error) {
        if (error) {
          throw error;
        }
      });
    }
  }).then(function () {

    // generate a string of CSS rules from the results
    log.msg('info', 'generatingCss');

    return css.createRules(results, opts);
  }).then(function (cssArray) {

    var cssString = css.munge(cssArray);

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
  }).then(function () {

    if (!opts.nopngdata) {
      var _ret3 = (function () {

        // number of bytes that will cause IE8 to choke on a datauri
        var TOO_BIG_FOR_IE8 = 32768;

        // check the size of the datauris and throw warning if too big
        return {
          v: results.forEach(function (res) {
            var size = res.pngdatauri !== null ? res.pngdatauri.length : void 0;
            if (size >= TOO_BIG_FOR_IE8 && opts.verbose) {
              return log.msg('warn', 'largeDataUri', res.name + ' (' + size + ' bytes)');
            }
          })
        };
      })();

      if (typeof _ret3 === 'object') return _ret3.v;
    }
  }).then(function () {

    // finished!
    return log.msg('info', 'appEnd');
  })['catch'](function (error) {

    // errors should output here
    if (opts.debug) {
      console.log(error.stack);
    }

    // if there's errors don't show analytics
    showAnalytics = false;

    return;
  })['finally'](function () {

    // log the process analytics
    if (opts.analytics && showAnalytics) {
      appLog.appEnd = microtime.now();
      return analytics(appLog);
    }
  }).done();
};