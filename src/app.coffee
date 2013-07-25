# modules
fs = require('fs')
path = require('path')
_ = require('underscore')
Q = require('q')
svg2png = require('svg2png')
util = require( path.resolve(__dirname, './', 'util') )
log = require( path.resolve(__dirname, './', 'log') )

ut = require('util')
Q.longStackSupport = true

# Q wrappers for some node methods
readDir = Q.denodeify fs.readdir
readFile = Q.denodeify fs.readFile
pathExists = Q.denodeify fs.exists

module.exports = (args) ->

  # console.log args

  # temp (these will be passed as arguments)
  inDir = path.resolve(__dirname, '..', 'test', 'inDir')
  outDir = path.resolve(__dirname, '..', 'test', 'outDir')

  # stores results through the promise chain
  results = []

  # confirm directory exists
  pathExists inDir, (exists) ->

    if exists

      # read files in directory
      readDir(inDir)
        .then( (files) -> # filter anything that isn't an SVG
          util.filterNonSvgFiles files
        )
        .then( (filteredFiles) -> # read SVG data into an array

          queue = []

          filteredFiles.forEach (file) ->
            filepath = path.resolve inDir, file
            queue.push readFile(filepath, 'utf8')

            # add to results
            results.push
              name: util.trimExt file
              filepath: filepath

          Q.all(queue)

        )
        .then( (svgData) -> # optimize SVG data and get width & heights

          queue = []

          svgData.forEach (svg) ->
            queue.push util.optimizeSvg(svg)

          Q.all(queue)

        )
        .then( (data) -> # merge compressed SVG data into results

          _.each data, (obj, i) ->

            svgData =
              svgsrc: obj.data
              svgdatauri: util.encodeImage(obj.data, 'base64', 'svg')
              height: util.roundNum(obj.info.height)
              width: util.roundNum(obj.info.width)

            _.extend results[i], svgData

        )
        .then( ->
          console.log JSON.stringify results, null, ' '
        )
        .fail( (error) ->
          log.data 'error', error
        )
        .done()

    else
      log.msg 'error', 'wrongDirectory'
