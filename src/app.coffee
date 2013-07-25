# modules
fs = require 'fs'
path = require 'path'
_ = require 'underscore'
Q = require 'q'
util = require path.resolve(__dirname, './', 'util')
log = require path.resolve(__dirname, './', 'log')

# Q wrappers for some node methods
readDir = Q.denodeify fs.readdir
readFile = Q.denodeify fs.readFile
writeFile = Q.denodeify fs.writeFile
pathExists = Q.denodeify fs.exists

module.exports = (args) ->

  console.time('time-to-run'); # start timer

  # console.log args

  # temp (these will be passed as arguments)
  inDir = path.resolve(__dirname, '..', 'test', 'inDir')
  outDir = path.resolve(__dirname, '..', 'test', 'outDir')

  # stores results through the promise chain
  results = []

  # confirm input directory exists
  pathExists inDir, (exists) ->

    if exists

      # read files in directory
      readDir(inDir)
        .then( (files) -> # filter anything that isn't an SVG
          util.filterNonSvgFiles files
        )
        # .then( (filteredFiles) -> # read SVG data into an array

        #   queue = []

        #   filteredFiles.forEach (file) ->
        #     svgPath = path.resolve inDir, file
        #     queue.push readFile(svgPath, 'utf8')

        #     # add to results
        #     results.push
        #       name: util.trimExt file
        #       svgpath: svgPath

        #   Q.all(queue)

        # )
        # .then( (svgData) -> # optimize SVG data and get width & heights

        #   queue = []

        #   svgData.forEach (svg) ->
        #     queue.push util.optimizeSvg(svg)

        #   Q.all(queue)

        # )
        # .then( (data) -> # merge compressed SVG data into results

        #   _.each data, (obj, i) ->

        #     svgData =
        #       svgsrc: obj.data
        #       svgdatauri: util.encodeImage(obj.data, 'base64', 'svg')
        #       height: util.roundNum(obj.info.height)
        #       width: util.roundNum(obj.info.width)

        #     _.extend results[i], svgData

        # )
        # .then( -> # convert SVGs to PNGs

        #   # console.log 'converting ' + results.length + ' SVGs to PNG'

        #   queue = []

        #   _.each results, (obj) ->
        #     destFile = path.resolve(outDir, obj.name + '.png')
        #     queue.push util.saveSvgAsPng(obj.svgpath, destFile)

        #   Q.all(queue)

        # )
        # .then( (pngPaths) -> # read PNGs into memory

        #   # console.log 'conversion complete'

        #   queue = []

        #   pngPaths.forEach (path, i) ->
        #     queue.push readFile(path, 'utf8')
        #     _.extend results[i], pngpath: path # add to results

        #   Q.all(queue)

        # )
        # .then( (pngData) -> # convert PNGs to data strings

        #   pngData.forEach (data, i) ->
        #     _.extend results[i], pngdatauri: util.encodeImage(data, 'base64', 'png') # add to results

        # )
        .then( -> # generate a string of CSS rules from the results

          resultsTemp = require(path.resolve(__dirname, '../test', 'results.json'))
          util.createCssRules resultsTemp

        )
        .then( (cssString) -> # save generated CSS to file

          console.log util.prettyCss(cssString)

        )
        .then( -> # in debug mode also expose results object

          # console.log JSON.stringify results, null, ' '

        )
        .fail( (error) ->
          log.data 'error', error
        )
        .finally( ->
          console.timeEnd('time-to-run'); # end timer
        )
        .done() # finished!

    else
      log.msg 'error', 'wrongDirectory'
