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
const parseArguments = (args) => {

  const options = require(path.join(__dirname, '..', 'lang', 'options.json'));
  const parsedOptions = {};

  options.forEach((opt) => {
    let val = args[opt.longName] || args[opt.shortName];
    if (opt.type === 'string') {
      parsedOptions[opt.longName] = val ? val : null;
    } else {
      parsedOptions[opt.longName] = val ? true : false;
    }
    return;
  });

  return parsedOptions;

};

module.exports = (args) => {

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
