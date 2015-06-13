const _ = require('lodash');
const chalk = require('chalk');

const render = (str, data) => {

  // colors
  const COLORMAP = {
    bullet: 'grey',
    text: 'magenta',
    data: 'white'
  };

  let output = '';

  // set lodash template to use curly braces for interpolation
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

  // mutate the data object by wrapping property values in white chalk
  _.each(data, (value, key, obj) => {
    obj[key] = chalk[COLORMAP['data']].bold(value);
  });

  if (data.title) {
    output = '\n' + chalk[COLORMAP['text']].inverse(str);
  } else {
    let template = _.template(str);
    let bullet = chalk[COLORMAP['bullet']](' ☉');
    output = chalk[COLORMAP['text']](bullet, template(data));
  }

  return console.log(output);
};

// logs analytics of application operation totals
module.exports = (log) => {

  const totalTime = (log.appEnd - log.appStart) / 1000000;

  render(' SUMMARY: ', {title: true});
  render('converted {{count}} SVG images totaling {{size}} bytes', {count: log.svgCount, size: log.svgSize});
  render('into a CSS file that is {{size}} bytes', {size: log.cssSize});
  render('after gzipping, it should be {{size}} bytes', {size: log.cssGzipSize});
  render('and it took {{time}} seconds', {time: totalTime});
  render('at an average of {{time}} seconds per icon', {time: totalTime / log.svgCount});

  return;

};
