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
    if (typeof data === 'undefined') {
      data = '';
    }
    return console.log(chalk[COLORMAP[type]](messages[type][key]), data);
  },

  // logs message to the console
  // to be used when not in control of message language
  data: function data(type, msg, _data) {
    if (typeof _data === 'undefined') {
      _data = '';
    }
    if (type === 'error') {
      return console.error(msg);
    }
    return console.log(chalk[COLORMAP[type]](msg, _data));
  },

  // logs analytics of application operation totals
  analytics: function analytics(log) {
    var totalTime = (log.appEnd - log.appStart) / 1000000;
    console.log('\n');
    console.log(' ' + chalk.magenta.inverse(' SUMMARY: '));
    console.log(chalk.magenta('', '☉', 'converted', chalk.white.bold(log.svgCount), 'SVG images totaling', chalk.white.bold(log.svgSize), 'bytes'));
    console.log(chalk.magenta('', '☉', 'into a CSS file that is', chalk.white.bold(log.cssSize), 'bytes'));
    console.log(chalk.magenta('', '☉', 'and it took', chalk.white.bold(totalTime), 'seconds'));
    console.log(chalk.magenta('', '☉', 'at an average of', chalk.white.bold(totalTime / log.svgCount), 'seconds per icon'));
    return console.log('\n');
  },

  // dumps a json object to console
  dump: function dump(json) {
    return console.log(JSON.stringify(json, null, ' '));
  }

};