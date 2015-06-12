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

  return {
    analytics: args.analytics || args.a ? true : false,
    base64: args.base64 || args.b ? true : false,
    classname: args.classname || args.c ? args.classname || args.c : null,
    debug: args.debug || args.d ? true : false,
    filename: args.filename || args.f ? args.filename || args.f : null,
    killcomment: args.killcomment || args.k ? true : false,
    nopng: args.nopng || args.n ? true : false,
    nopngdata: args.nopngdata || args.N ? true : false,
    optimizesvg: args.optimizesvg || args.o ? true : false,
    pretty: args.pretty || args.p ? true : false,
    separatecss: args.separatecss || args.s ? true : false,
    stdout: args.stdout || args.S ? true : false,
    verbose: args.verbose || args.v ? true : false
  };
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