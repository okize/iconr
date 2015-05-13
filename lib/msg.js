var chalk, colorMap, messages, path;

path = require('path');

chalk = require('chalk');

messages = require(path.resolve(__dirname, '..', 'lang', 'messages.json'));

colorMap = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  ask: 'green',
  list: 'white'
};

module.exports = {
  str: function(type, key, data) {
    return messages[type][key];
  },
  log: function(type, key, data) {
    if (typeof data === 'undefined') {
      data = '';
    }
    return console.log(chalk[colorMap[type]](messages[type][key]), data);
  },
  data: function(type, msg, data) {
    if (typeof data === 'undefined') {
      data = '';
    }
    if (type === 'error') {
      return console.error(chalk[colorMap[type]](msg, data));
    } else {
      return console.log(chalk[colorMap[type]](msg, data));
    }
  },
  analytics: function(log) {
    var totalTime;
    totalTime = (log.appEnd - log.appStart) / 1000000;
    console.log('\n');
    console.log(' ' + chalk.magenta.inverse(' SUMMARY: '));
    console.log(chalk.magenta('', '☉', 'converted', chalk.white.bold(log.svgCount), 'SVG images totaling', chalk.white.bold(log.svgSize), 'bytes'));
    console.log(chalk.magenta('', '☉', 'into a CSS file that is', chalk.white.bold(log.cssSize), 'bytes'));
    console.log(chalk.magenta('', '☉', 'after gzipping, it should be', chalk.white.bold(log.cssGzipSize), 'bytes'));
    console.log(chalk.magenta('', '☉', 'and it took', chalk.white.bold(totalTime), 'seconds'));
    console.log(chalk.magenta('', '☉', 'at an average of', chalk.white.bold(totalTime / log.svgCount), 'seconds per icon'));
    return console.log('\n');
  },
  dump: function(json) {
    return console.log(JSON.stringify(json, null, ' '));
  }
};
