'use strict';

var chalk = require('chalk');

// logs analytics of application operation totals
var analytics = function analytics(log) {
  var totalTime = (log.appEnd - log.appStart) / 1000000;
  console.log('\n');
  console.log(' ' + chalk.magenta.inverse(' SUMMARY: '));
  console.log(chalk.magenta('', '☉', 'converted', chalk.white.bold(log.svgCount), 'SVG images totaling', chalk.white.bold(log.svgSize), 'bytes'));
  console.log(chalk.magenta('', '☉', 'into a CSS file that is', chalk.white.bold(log.cssSize), 'bytes'));
  console.log(chalk.magenta('', '☉', 'after gzipping, it should be', chalk.white.bold(log.cssGzipSize), 'bytes'));
  console.log(chalk.magenta('', '☉', 'and it took', chalk.white.bold(totalTime), 'seconds'));
  console.log(chalk.magenta('', '☉', 'at an average of', chalk.white.bold(totalTime / log.svgCount), 'seconds per icon'));
  console.log('\n');
  return;
};

module.exports = analytics;