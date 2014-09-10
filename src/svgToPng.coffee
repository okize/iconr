# the following code is executed in phantomjs

"use strict"

webpage = require('webpage')

convert = (source, destination, height, width) ->
  page = webpage.create()
  page.open source, (status) ->
    if status isnt 'success'
      console.error 'Couldn\'t load the source SVG!'
      phantom.exit()
      return
    page.zoomFactor = 1
    page.viewportSize =
      width: Math.round(width)
      height: Math.round(height)

    # delay for resizing
    setTimeout (->
      page.render destination
      phantom.exit()
    ), 0

# expects 4 arguments: source SVG, destination PNG, height & width
if phantom.args.length isnt 4
  console.error 'Missing arguments! Usage: source SVG, destination PNG, height & width'
  phantom.exit()
else
  convert phantom.args[0], phantom.args[1], phantom.args[2], phantom.args[3]
