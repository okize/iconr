const path = require('path');
const fs = require('fs');
const yargs = require('yargs');
const iconr = require(path.resolve(__dirname, './', 'app'));

// output version number of app
const getVersion = () => {
  const pkg = require('../package.json');
  return pkg.version;
};

// output help documentation of app
const getHelpText = () => {
  const helpFile = path.join(__dirname, '..', 'lang', 'help.txt');
  return fs.readFileSync(helpFile, 'utf8');
};

// create options object from cli arguments
const parseArguments = (args) => {
  const options = require(path.join(__dirname, '..', 'lang', 'options.json'));
  const parsedOptions = {};

  options.forEach((opt) => {
    const value = args[opt.longName] || args[opt.shortName];
    switch (opt.type) {
      case 'string':
        parsedOptions[opt.longName] = value || null;
        break;
      case 'boolean':
        parsedOptions[opt.longName] = value === true;
        break;
      default:
        throw new Error('Options need to have a type specified');
    }
    return;
  });

  return parsedOptions;
};

const printHelp = () => {
  return console.log(`\n${getHelpText()}\n`);
};

module.exports = (process) => {
  const args = yargs.parse(process.argv);
  const commands = args._.slice(2, 4);

  // --version
  if (args.version || args.V) {
    return console.log(getVersion());
  }

  // --help
  if (args.help || args.h) {
    return printHelp();
  }

  // at least one command sent
  if (commands.length) {
    return iconr(commands, parseArguments(args));
  }

  // display help as default
  return printHelp();
};
