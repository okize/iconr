var Progger, Q, colors, fs, microtime, mkdirp, msg, p, path, readDir, readFile, rimraf, util, _;

fs = require('fs');

path = require('path');

_ = require('lodash');

Q = require('q');

colors = require('colors');

microtime = require('microtime');

mkdirp = require('mkdirp');

rimraf = require('rimraf');

Progger = require('progger');

p = new Progger({
  speed: 100,
  token: '.',
  color: 'blue'
});

util = require(path.resolve(__dirname, './', 'util'));

msg = require(path.resolve(__dirname, './', 'msg'));

readDir = Q.denodeify(fs.readdir);

readFile = Q.denodeify(fs.readFile);

module.exports = function(args, opts) {
  var cssFilename, inputDir, log, outputDir, pngDir, results, showAnalytics;
  inputDir = path.resolve(args[0]);
  if (!fs.existsSync(inputDir)) {
    return msg.log('error', 'wrongDirectory');
  }
  if (args.length < 2) {
    return msg.log('error', 'noOutputDir');
  }
  outputDir = path.resolve(args[1]);
  pngDir = outputDir + '/images';
  if (!fs.existsSync(outputDir)) {
    mkdirp(pngDir);
  }
  if (opts.stdout) {
    opts.verbose = false;
    opts.analytics = false;
  }
  cssFilename = opts.filename != null ? util.trimFilename(opts.filename) : 'iconr';
  showAnalytics = true;
  results = [];
  log = {
    appStart: microtime.now(),
    appEnd: 0,
    svgCount: 0,
    svgSize: 0,
    cssSize: 0
  };
  if (opts.verbose) {
    msg.log('info', 'appStart');
  }
  return readDir(inputDir).then(function(files) {
    if (opts.verbose) {
      msg.log('info', 'filterNonSvg');
    }
    return util.filterNonSvgFiles(files, inputDir);
  }).then(function(svgFiles) {
    var filteredFiles;
    if (svgFiles.length < 1) {
      showAnalytics = false;
      return msg.log('error', 'noSvg');
    }
    filteredFiles = [];
    svgFiles.forEach(function(filename) {
      var newFilename;
      if (util.hasSpace(filename) === true) {
        if (opts.verbose) {
          msg.log('warn', 'spaceInFilename', filename);
        }
        newFilename = filename.split(' ').join('-');
        filteredFiles.push(newFilename);
        return util.replaceSpaceInFilename(filename, newFilename, inputDir);
      } else {
        return filteredFiles.push(filename);
      }
    });
    return filteredFiles;
  }).then(function(filteredFiles) {
    var queue;
    if (opts.verbose) {
      msg.log('info', 'readingSvg');
    }
    log.svgCount = filteredFiles.length;
    queue = [];
    filteredFiles.forEach(function(file) {
      var svgPath;
      svgPath = path.resolve(inputDir, file);
      queue.push(readFile(svgPath, 'utf8'));
      log.svgSize += fs.statSync(svgPath).size;
      return results.push({
        name: util.trimExt(file),
        svgpath: svgPath
      });
    });
    return Q.all(queue);
  }).then(function(svgData) {
    var queue;
    if (opts.verbose) {
      msg.log('info', 'optimizingSvg');
    }
    queue = [];
    svgData.forEach(function(svg) {
      return queue.push(util.optimizeSvg(svg));
    });
    return Q.all(queue);
  }).then(function(data) {
    if (opts.verbose) {
      msg.log('info', 'encodingSvg');
    }
    return _.each(data, function(obj, i) {
      var encoding, svgData, svgOut;
      encoding = opts.base64 ? 'base64' : '';
      svgOut = opts.optimizesvg ? obj.data : obj.original;
      svgData = {
        svgsrc: svgOut,
        svgdatauri: util.encodeImage(svgOut, encoding, 'svg'),
        height: util.roundNum(obj.info.height),
        width: util.roundNum(obj.info.width)
      };
      return _.extend(results[i], svgData);
    });
  }).then(function() {
    var queue;
    if (!(opts.nopngdata && opts.nopng)) {
      if (opts.verbose) {
        msg.log('info', 'convertingSvg');
      }
      queue = [];
      _.each(results, function(obj) {
        var destFile;
        destFile = path.resolve(pngDir, obj.name + '.png');
        return queue.push(util.saveSvgAsPng(obj.svgpath, destFile, obj.height, obj.width));
      });
      if (opts.verbose) {
        p.start();
      }
      return Q.all(queue);
    }
  }).then(function(pngPaths) {
    var queue;
    if (pngPaths != null) {
      if (opts.verbose) {
        p.stop();
      }
      if (opts.verbose) {
        msg.log('info', 'readingPng');
      }
      queue = [];
      pngPaths.forEach(function(path, i) {
        var pngpath;
        queue.push(readFile(path, null));
        if (!opts.nopng) {
          pngpath = path.replace(outputDir, '.');
          return _.extend(results[i], {
            pngpath: pngpath
          });
        }
      });
      return Q.all(queue);
    }
  }).then(function(pngData) {
    if (pngData != null) {
      if (opts.verbose) {
        msg.log('info', 'encodingPng');
      }
      return pngData.forEach(function(data, i) {
        return _.extend(results[i], {
          pngdatauri: util.encodeImage(data, 'base64', 'png')
        });
      });
    }
  }).then(function() {
    if (opts.nopng || opts.stdout) {
      if (opts.verbose) {
        msg.log('info', 'deletingPng');
      }
      return rimraf(pngDir, function(error) {
        if (error) {
          throw error;
        }
      });
    }
  }).then(function() {
    if (opts.verbose) {
      msg.log('info', 'generatingCss');
    }
    return util.createCssRules(results, opts);
  }).then(function(cssArray) {
    var cssString;
    cssString = util.mungeCss(cssArray);
    if (opts.stdout) {
      if (opts.verbose) {
        msg.log('info', 'outputCss');
      }
      if (opts.pretty) {
        cssString = util.prettyCss(cssString);
      }
      return process.stdout.write(cssString);
    } else {
      log.cssSize = cssString.length;
      if (opts.verbose) {
        msg.log('info', 'saveCss');
      }
      return util.saveCss(path.resolve(outputDir, cssFilename), cssArray, opts);
    }
  }).then(function() {
    var tooLarge;
    if (!opts.nopngdata) {
      tooLarge = 32768;
      return results.forEach(function(res) {
        var size;
        size = res.pngdatauri.length;
        if (size >= tooLarge && opts.verbose) {
          return msg.log('warn', 'largeDataUri', res.name + ' (' + size + ' bytes)');
        }
      });
    }
  }).then(function() {
    if (opts.verbose) {
      return msg.log('info', 'appEnd');
    }
  }).fail(function(error) {
    if (opts.debug) {
      console.log(error.stack);
    }
    return showAnalytics = false;
  })["finally"](function() {
    if (opts.analytics && showAnalytics) {
      log.appEnd = microtime.now();
      return msg.analytics(log);
    }
  }).done();
};
