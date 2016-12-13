/* eslint-disable */
var webpage = require('webpage');
var system = require('system');

var convert = function convert(source, destination, height, width) {
  var page = webpage.create();
  return page.open(source, function (status) {
    if (status !== 'success') {
      console.error('Couldn\'t load the source SVG!');
      phantom.exit();
      return;
    }

    // set page size to SVG dimensions
    page.zoomFactor = 1;
    page.viewportSize = {
      width: Math.round(width),
      height: Math.round(height)
    };

    // delay for resizing
    setTimeout(function () {
      page.render(destination);
      return phantom.exit();
    }, 0);
  });
};

// expects 4 arguments: source SVG, destination PNG, height & width
if (system.args.length !== 5) {
  console.error('Missing arguments! Usage: source SVG, destination PNG, height & width');
  phantom.exit();
} else {
  convert(system.args[1], system.args[2], system.args[3], system.args[4]);
}
