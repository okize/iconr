const chalk = require('chalk');

const COLORMAP = {
  bullet: 'grey',
  text: 'magenta',
  data: 'white',
};

const bold = (str) => chalk[COLORMAP.data].bold(str);

const render = (str, isTitle) => {
  let output = '';

  if (isTitle) {
    output = `\n${chalk[COLORMAP.text].inverse(str)}`;
  } else {
    const bullet = chalk[COLORMAP.bullet](' ☉');
    output = chalk[COLORMAP.text](bullet, str);
  }

  return console.log(output);
};

// logs analytics of application operation totals
module.exports = (log) => {
  const [seconds, nanoseconds] = log.appEnd;
  const totalTime = seconds + (nanoseconds / 1e9);

  render(' SUMMARY: ', true);
  render(`converted ${bold(log.svgCount)} SVG images totaling ${bold(log.svgSize)} bytes`);
  render(`into a CSS file that is ${bold(log.cssSize)} bytes`);
  render(`after gzipping, it should be ${bold(log.cssGzipSize)} bytes`);
  render(`and it took ${bold(totalTime)} seconds`);
  render(`at an average of ${bold(totalTime / log.svgCount)} seconds per icon`);
};
