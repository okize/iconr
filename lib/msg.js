'use strict';

var path = require('path');
var chalk = require('chalk');
var messages = require(path.resolve(__dirname, '..', 'lang', 'messages.json'));

// configuration for command line colorization
var COLORMAP = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  ask: 'green',
  list: 'white'
};

module.exports = {

  // logs requested message to the console
  log: function log(type, key, data) {
    var args = data === undefined ? '' : data;
    return console.log(chalk[COLORMAP[type]](messages[type][key]), args);
  }

};