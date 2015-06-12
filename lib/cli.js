'use strict';

var iconr = require('./app');
var path = require('path');
var fs = require('fs');

// output version number of app
var displayVersion = function displayVersion() {
  var pkg = require('../package.json');
  return console.log(pkg.version);
};

// output help documentation of app
var displayHelp = function displayHelp() {
  var helpFile = path.join(__dirname, '..', 'lang', 'help.txt');
  var helpText = fs.readFileSync(helpFile, 'utf8');
  return console.log('\n' + helpText + '\n');
};

// create options object from cli arguments
var parseArguments = function parseArguments(args) {

  var options = require(path.join(__dirname, '..', 'lang', 'options.json'));
  var parsedOptions = {};

  options.forEach(function (opt) {
    var val = args[opt.longName] || args[opt.shortName];
    if (opt.type === 'string') {
      parsedOptions[opt.longName] = val ? val : null;
    } else {
      parsedOptions[opt.longName] = val ? true : false;
    }
    return;
  });

  return parsedOptions;
};

module.exports = function (args) {

  // args passed
  if (args._.length > 0) {
    return iconr(args._, parseArguments(args));
  }

  // --version
  if (args.version || args.V) {
    return displayVersion();
  }

  // --help (or no args)
  if (args.help || args.h || !args._.length) {
    return displayHelp();
  }
};