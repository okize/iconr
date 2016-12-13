const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const path = require('path');
const _ = require('lodash');
const microtime = require('microtime');
const gzipSize = require('gzip-size');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const Logger = require('./Logger');
const util = require('./util');
const css = require('./css');
const image = require('./image');
const analytics = require('./analytics');

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
  const pngDir = `${outputDir}/images`;

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
  const results = [];

  // logs data about the application operations
  const appLog = {
    appStart: microtime.now(),
    appEnd: 0,
    svgCount: 0,
    svgSize: 0,
    cssSize: 0,
    cssGzipSize: 0,
  };

  // starting app
  log.msg('info', 'appStart');

  // start of promise chain
  // read files in directory
  return fs.readdirAsync(inputDir).then((files) => {
    log.msg('info', 'filterNonSvg');

    // filter anything that isn't an SVG
    return util.filterNonSvgFiles(files, inputDir);
  })
  .then((svgFiles) => {
    // exit if no SVG images found
    if (svgFiles.length < 1) {
      showAnalytics = false;
      return log.msg('error', 'noSvg');
    }

    // store list of files after spaces (if any) have been removed
    const filteredFiles = [];

    // replace spaces in filenames
    svgFiles.forEach((filename) => {
      if (util.hasSpace(filename) === true) {
        log.msg('warn', 'spaceInFilename', filename);
        const newFilename = filename.split(' ').join('-');
        filteredFiles.push(newFilename);
        return util.replaceSpaceInFilename(filename, newFilename, inputDir);
      }

      return filteredFiles.push(filename);
    });

    return filteredFiles;
  })
  .then((filteredFiles) => {
    // read SVGs into memory
    log.msg('info', 'readingSvg');

    // log icon count
    appLog.svgCount = filteredFiles.length;

    const queue = [];

    filteredFiles.forEach((file) => {
      const svgPath = path.resolve(inputDir, file);
      queue.push(fs.readFileAsync(svgPath, 'utf8'));

      // log total file size of the SVG files we're optimizing
      appLog.svgSize += fs.statSync(svgPath).size;

      // add to results object
      return results.push({
        name: util.trimExt(file),
        svgpath: svgPath,
      });
    });

    return Bluebird.all(queue);
  })
  .then((svgData) => {
    // optimize SVG data and get width & heights
    // note: optimization process is necessary even if it is not requested
    // in order to get SVG width & height
    log.msg('info', 'optimizingSvg');

    const queue = [];

    svgData.forEach((svg) => {
      return queue.push(image.optimizeSvg(svg));
    });

    return Bluebird.all(queue);
  })
  .then((data) => {
    // merge compressed & encoded SVG data into results
    log.msg('info', 'encodingSvg');

    return _.each(data, (obj, i) => {
      const encoding = opts.base64 ? 'base64' : '';
      const svgOut = opts.optimizesvg ? obj.data : obj.original;
      const svgData = {
        svgsrc: svgOut,
        svgdatauri: image.encode(svgOut, encoding, 'svg'),
        height: util.roundNum(obj.info.height),
        width: util.roundNum(obj.info.width),
      };
      return _.extend(results[i], svgData);
    });
  })
  .then(() => {
    const queue = [];

    if (!(opts.nopngdata && opts.nopng)) {
      // convert SVGs to PNGs
      log.msg('info', 'convertingSvg');

      results.forEach((obj) => {
        const destFile = path.resolve(pngDir, `${obj.name}.png`);
        return queue.push(image.saveSvgAsPng(obj.svgpath, destFile, obj.height, obj.width));
      });

      // start progress dots
      log.startProgress();
    }

    return Bluebird.all(queue);
  })
  .then((unfilteredPngPaths) => {
    // remove undefined items from path array
    const pngPaths = _.filter(unfilteredPngPaths, (pngPath) => {
      return pngPath !== undefined;
    });

    const queue = [];

    if (pngPaths !== null) {
      // stop progress dots
      log.stopProgress();

      // read PNGs into memory
      log.msg('info', 'readingPng');

      pngPaths.forEach((pngPath, i) => {
        queue.push(fs.readFileAsync(pngPath, null));

        // PNG fallbacks enabled
        // make path relative to location of output css file then
        // add to results object
        if (!opts.nopng) {
          const pngpath = pngPath.replace(outputDir, '.');
          return _.extend(results[i], { pngpath });
        }
        return null;
      });
    }

    return Bluebird.all(queue);
  })
  .then((pngData) => {
    if (pngData !== null) {
      // convert PNGs to data strings
      log.msg('info', 'encodingPng');

      return pngData.forEach((data, i) => {
        // add to results object
        return _.extend(results[i], {
          pngdatauri: image.encode(data, 'base64', 'png'),
        });
      });
    }
    return null;
  })
  .then(() => {
    if (opts.nopng || opts.stdout) {
      // delete generated PNG directory
      log.msg('info', 'deletingPng');

      return rimraf(pngDir, (error) => {
        if (error) {
          throw error;
        }
      });
    }
    return null;
  })
  .then(() => {
    // generate a string of CSS rules from the results
    log.msg('info', 'generatingCss');

    return css.createRules(results, opts);
  })
  .then((cssArray) => {
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
  })
  .then(() => {
    if (!opts.nopngdata) {
      // number of bytes that will cause IE8 to choke on a datauri
      const TOO_BIG_FOR_IE8 = 32768;

      // check the size of the datauris and throw warning if too big
      return results.forEach((res) => {
        const size = (res.pngdatauri !== null) ? res.pngdatauri.length : undefined;
        if (size >= TOO_BIG_FOR_IE8 && opts.verbose) {
          return log.msg('warn', 'largeDataUri', `${res.name} (${size} bytes)`);
        }
        return null;
      });
    }
    return null;
  })
  .then(() => {
    // finished!
    return log.msg('info', 'appEnd');
  })
  .catch((error) => {
    // errors should output here
    if (opts.debug) {
      console.log(error.stack);
    }

    // if there's errors don't show analytics
    showAnalytics = false;
  })
  .finally(() => {
    // log the process analytics
    if (opts.analytics && showAnalytics) {
      appLog.appEnd = microtime.now();
      analytics(appLog);
    }
  })
  .done();
};
