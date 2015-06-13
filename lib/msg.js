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

  // returns a string of the requested message
  str: function str(type, key) {
    return messages[type][key];
  },

  // logs requested message to the console
  log: function log(type, key, data) {
    var args = data === undefined ? '' : data;
    return console.log(chalk[COLORMAP[type]](messages[type][key]), args);
  },

  // logs message to the console
  // to be used when not in control of message language
  data: function data(type, msg, _data) {
    var args = _data === undefined ? '' : _data;
    if (type === 'error') {
      return console.error(msg);
    }
    return console.log(chalk[COLORMAP[type]](msg, args));
  },

  // dumps a json object to console
  dump: function dump(json) {
    return console.log(JSON.stringify(json, null, ' '));
  }

};