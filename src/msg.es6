const path = require('path');
const chalk = require('chalk');
const messages = require(path.resolve(__dirname, '..', 'lang', 'messages.json'));

// configuration for command line colorization
const COLORMAP = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  ask: 'green',
  list: 'white'
};

module.exports = {

  // logs requested message to the console
  log: (type, key, data) => {
    let args = (data === undefined) ? '' : data;
    return console.log(chalk[COLORMAP[type]](messages[type][key]), args);
  }

};
