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

module.exports = function (argv) {

  // flags we care about for app operation
  var flags = {
    analytics: argv.analytics || argv.a ? true : false,
    base64: argv.base64 || argv.b ? true : false,
    classname: argv.classname || argv.c ? argv.classname || argv.c : '',
    debug: argv.debug || argv.d ? true : false,
    filename: argv.filename || argv.f ? argv.filename || argv.f : null,
    killcomment: argv.killcomment || argv.k ? true : false,
    nopng: argv.nopng || argv.n ? true : false,
    nopngdata: argv.nopngdata || argv.N ? true : false,
    optimizesvg: argv.optimizesvg || argv.o ? true : false,
    pretty: argv.pretty || argv.p ? true : false,
    separatecss: argv.separatecss || argv.s ? true : false,
    stdout: argv.stdout || argv.S ? true : false,
    verbose: argv.verbose || argv.v ? true : false
  };

  // args passed
  if (argv._.length > 0) {
    return iconr(argv._, flags);
  }

  // --version
  if (argv.version || argv.V) {
    return displayVersion();
  }

  // --help (or no args)
  if (argv.help || argv.h || !argv._.length) {
    return displayHelp();
  }
};