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

  // returns a string of the requested message
  str: (type, key) => {
    return messages[type][key];
  },

  // logs requested message to the console
  log: (type, key, data) => {
    let args = (data === undefined) ? '' : data;
    return console.log(chalk[COLORMAP[type]](messages[type][key]), args);
  },

  // logs message to the console
  // to be used when not in control of message language
  data: (type, msg, data) => {
    let args = (data === undefined) ? '' : data;
    if (type === 'error') {
      return console.error(msg);
    }
    return console.log(chalk[COLORMAP[type]](msg, args));
  },

  // dumps a json object to console
  dump: (json) => {
    return console.log(JSON.stringify(json, null, ' '));
  }

};
