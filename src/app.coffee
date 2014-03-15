# modules
fs = require 'fs'
path = require 'path'
_ = require 'underscore'
Q = require 'q'
colors = require 'colors'
microtime = require 'microtime'
mkdirp = require 'mkdirp'
rimraf = require 'rimraf'
Progger = require 'progger'
p = new Progger
  speed: 100
  token: '.'
  color: 'blue'
util = require path.resolve(__dirname, './', 'util')
msg = require path.resolve(__dirname, './', 'msg')

# Q wrappers for some node methods
readDir = Q.denodeify fs.readdir
readFile = Q.denodeify fs.readFile

module.exports = (args, opts) ->

  # input directory of SVG icons
  inputDir = path.resolve(args[0])

  # confirm input directory exists
  return msg.log 'error', 'wrongDirectory' if !fs.existsSync inputDir

  # no output directory provided
  return msg.log 'error', 'noOutputDir' if args.length < 2

  # output directory
  outputDir = path.resolve(args[1])

  # png directory
  pngDir = outputDir + '/images'

  # if the output directory does not exist, create it
  if !fs.existsSync outputDir
    mkdirp pngDir

  # name of the CSS file output
  cssFilename = if opts.filename? then util.trimFilename(opts.filename) else 'iconr'

  # this is necessary to prevent the analytics from displaying
  # during an application error
  showAnalytics = true

  # stores results through the promise chain
  results = []

  # logs data about the application operations
  log =
    appStart: microtime.now()
    appEnd: 0
    svgCount: 0
    svgSize: 0
    cssSize: 0

  # starting app
  msg.log 'info', 'appStart' if opts.verbose

  # start of promise chain
  # read files in directory
  readDir(inputDir)
    .then( (files) ->

      msg.log 'info', 'filterNonSvg' if opts.verbose

      # filter anything that isn't an SVG
      util.filterNonSvgFiles files, inputDir

    )
    .then( (svgFiles) ->

      # exit if no SVG images found
      if svgFiles.length < 1
        showAnalytics = false
        return msg.log 'error', 'noSvg'

      # list of files after spaces (if any) have been removed
      filteredFiles = []

      # replace spaces in filenames
      svgFiles.forEach (filename) ->
        if util.hasSpace(filename) is true
          msg.log 'warn', 'spaceInFilename', filename if opts.verbose
          newFilename = filename.split(' ').join('-')
          filteredFiles.push newFilename
          util.replaceSpaceInFilename filename, newFilename, inputDir
        else
          filteredFiles.push filename

      filteredFiles

    )
    .then( (filteredFiles) ->

      # read SVGs into memory
      msg.log 'info', 'readingSvg' if opts.verbose

      # log icon count
      log.svgCount = filteredFiles.length

      queue = []

      filteredFiles.forEach (file) ->
        svgPath = path.resolve inputDir, file
        queue.push readFile(svgPath, 'utf8')

        # log total file size of the SVG files we're optimizing
        log.svgSize += fs.statSync(svgPath).size

        # add to results object
        results.push
          name: util.trimExt file
          svgpath: svgPath

      Q.all(queue)

    )
    .then( (svgData) ->

      # optimize SVG data and get width & heights
      msg.log 'info', 'optimizingSvg' if opts.verbose

      queue = []

      svgData.forEach (svg) ->
        queue.push util.optimizeSvg(svg)

      Q.all(queue)

    )
    .then( (data) ->

      # merge compressed & encoded SVG data into results
      msg.log 'info', 'encodingSvg' if opts.verbose

      _.each data, (obj, i) ->

        encoding = if opts.base64 then 'base64' else ''
        svgOut = if opts.optimizesvg then obj.data else obj.original

        svgData =
          svgsrc: svgOut
          svgdatauri: util.encodeImage(svgOut, encoding, 'svg')
          height: util.roundNum(obj.info.height)
          width: util.roundNum(obj.info.width)

        _.extend results[i], svgData

    )
    .then( ->

      unless opts.nopngdata and opts.nopng

        # convert SVGs to PNGs
        msg.log 'info', 'convertingSvg' if opts.verbose

        queue = []

        _.each results, (obj) ->
          destFile = path.resolve(pngDir, obj.name + '.png')
          queue.push util.saveSvgAsPng(obj.svgpath, destFile, obj.height, obj.width)

        # start progress dots
        p.start() if opts.verbose

        Q.all(queue)

    )
    .then( (pngPaths) ->

      if pngPaths?

        # stop progress dots
        p.stop() if opts.verbose

        # read PNGs into memory
        msg.log 'info', 'readingPng' if opts.verbose

        queue = []

        pngPaths.forEach (path, i) ->
          queue.push readFile(path, null)

          # PNG fallbacks enabled
          # make path relative to location of output css file then
          # add to results object
          if !opts.nopng
            pngpath = path.replace(outputDir, '.')
            _.extend results[i], pngpath: pngpath

        Q.all(queue)

    )
    .then( (pngData) ->

      if pngData?

        # convert PNGs to data strings
        msg.log 'info', 'encodingPng' if opts.verbose

        pngData.forEach (data, i) ->
          # add to results object
          _.extend results[i], pngdatauri: util.encodeImage(data, 'base64', 'png')

    )
    .then( ->

      if !opts.nopngdata and !opts.nopng

        if opts.nopng || opts.stdout

          msg.log 'info', 'deletingPng' if opts.verbose

          # delete generated PNG directory
          rimraf pngDir, (error) ->
            if error
              throw error

    )
    .then( ->

      # generate a string of CSS rules from the results
      msg.log 'info', 'generatingCss' if opts.verbose

      util.createCssRules(results, opts)

    )
    .then( (cssArray) ->

      cssString = util.mungeCss cssArray

      if opts.stdout

        # send generated CSS to stdout
        msg.log 'info', 'outputCss' if opts.verbose

        # prettify the CSS if necessary
        cssString = util.prettyCss cssString if opts.pretty

        process.stdout.write cssString

      else

        # save CSS size
        log.cssSize = cssString.length

        # save generated CSS to file
        msg.log 'info', 'saveCss' if opts.verbose

        util.saveCss path.resolve(outputDir, cssFilename), cssArray, opts

    )
    .then( ->

      if !opts.nopngdata

        # number of bytes that will cause IE8 to choke on a datauri
        tooLarge = 32768

        # check the size of the datauris and throw warning if too big
        results.forEach (res) ->
          size = res.pngdatauri.length
          if size >= tooLarge and opts.verbose
            msg.log 'warn', 'largeDataUri', res.name + ' (' + size + ' bytes)'

    )
    .then( ->

      # finished!
      msg.log 'info', 'appEnd' if opts.verbose

    )
    .fail( (error) ->

      # errors should output here
      console.log error.stack if opts.debug

      # if there's errors don't show analytics
      showAnalytics = false

    )
    .finally( ->

      # in debug mode also expose results object
      # msg.dump results if opts.debug

      # log the process analytics
      if opts.analytics && showAnalytics
        log.appEnd = microtime.now()
        msg.analytics log

    )
    .done()