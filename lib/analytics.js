'use strict';

var _ = require('lodash');
var chalk = require('chalk');

var render = function render(str, data) {

  // colors
  var COLORMAP = {
    bullet: 'grey',
    text: 'magenta',
    data: 'white'
  };

  var output = '';

  // set lodash template to use curly braces for interpolation
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

  // mutate the data object by wrapping property values in white chalk
  _.each(data, function (value, key, obj) {
    obj[key] = chalk[COLORMAP['data']].bold(value);
  });

  if (data.title) {
    output = '\n' + chalk[COLORMAP['text']].inverse(str);
  } else {
    var template = _.template(str);
    var bullet = chalk[COLORMAP['bullet']](' ☉');
    output = chalk[COLORMAP['text']](bullet, template(data));
  }

  return console.log(output);
};

// logs analytics of application operation totals
module.exports = function (log) {

  var totalTime = (log.appEnd - log.appStart) / 1000000;

  render(' SUMMARY: ', { title: true });
  render('converted {{count}} SVG images totaling {{size}} bytes', { count: log.svgCount, size: log.svgSize });
  render('into a CSS file that is {{size}} bytes', { size: log.cssSize });
  render('after gzipping, it should be {{size}} bytes', { size: log.cssGzipSize });
  render('and it took {{time}} seconds', { time: totalTime });
  render('at an average of {{time}} seconds per icon', { time: totalTime / log.svgCount });

  return;
};