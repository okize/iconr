const iconr = require('./app');
const path = require('path');
const fs = require('fs');

// output version number of app
const displayVersion = () => {
  const pkg = require('../package.json');
  return console.log(pkg.version);
};

// output help documentation of app
const displayHelp = () => {
  const helpFile = path.join(__dirname, '..', 'lang', 'help.txt');
  const helpText = fs.readFileSync(helpFile, 'utf8');
  return console.log('\n' + helpText + '\n');
};

// create options object from cli arguments
const getOptions = (args) => {

  return {
    analytics: args.analytics || args.a ? true : false,
    base64: args.base64 || args.b ? true : false,
    classname: args.classname || args.c ? args.classname || args.c : '',
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

module.exports = (argv) => {

  // args passed
  if (argv._.length > 0) {
    return iconr(argv._, getOptions(argv));
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
