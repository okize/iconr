/*global phantom*/
const webpage = require('webpage');

const convert = function (source, destination, height, width) {
  let page = webpage.create();
  return page.open(source, function renderSVG(status) {

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
if (phantom.args.length !== 4) {
  console.error('Missing arguments! Usage: source SVG, destination PNG, height & width');
  phantom.exit();
} else {
  convert(phantom.args[0], phantom.args[1], phantom.args[2], phantom.args[3]);
}
