var checkForUpdates, displayHelp, displayVersion, fs, iconr, path, pkg, updateNotifier;

path = require('path');

fs = require('fs');

pkg = require('../package.json');

updateNotifier = require('update-notifier');

iconr = require('./app');

displayVersion = function() {
  return console.log(pkg.version);
};

displayHelp = function() {
  var helpFile, helpText;
  helpFile = path.join(__dirname, '..', 'lang', 'help.txt');
  helpText = fs.readFileSync(helpFile, 'utf8');
  return console.log('\n' + helpText + '\n');
};

checkForUpdates = function() {
  var notifier;
  notifier = updateNotifier({
    packageName: pkg.name,
    packageVersion: pkg.version
  });
  if (notifier.update != null) {
    return console.log("Update available: " + notifier.update.latest + " \n");
  }
};

module.exports = function(argv) {
  var flags;
  checkForUpdates();
  flags = {
    verbose: argv.verbose || argv.v ? true : false,
    analytics: argv.analytics || argv.a ? true : false,
    pretty: argv.pretty || argv.p ? true : false,
    base64: argv.base64 || argv.b ? true : false,
    nopng: argv.nopng || argv.n ? true : false,
    nopngdata: argv.nopngdata || argv.N ? true : false,
    stdout: argv.stdout || argv.S ? true : false,
    optimizesvg: argv.optimizesvg || argv.o ? true : false,
    killcomment: argv.killcomment || argv.k ? true : false,
    debug: argv.debug || argv.d ? true : false,
    separatecss: argv.separatecss || argv.s ? true : false,
    filename: argv.filename || argv.f ? argv.filename || argv.f : null,
    classname: argv.classname || argv.c ? argv.classname || argv.c : ''
  };
  if (argv._.length > 0) {
    return iconr(argv._, flags);
  }
  if (argv.version || argv.V) {
    return displayVersion();
  }
  if (argv.help || argv.h) {
    return displayHelp();
  }
  if (!argv._.length) {
    return displayHelp();
  }
};
