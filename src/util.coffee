# modules
fs = require 'fs'
path = require 'path'
mime = require 'mime'
_ = require 'underscore'
Q = require 'q'
svgo = new (require('svgo'))()
svg2png = require 'svg2png'
pretty = require 'cssbeautify'

module.exports =

  # returns binary data as encoded string
  encodeImage: (data, type, format) ->
    str = ','

    formatMap =
      'svg': '\'data:image/svg+xml',
      'png': '\'data:image/png'

    if type is 'base64'
      str = ';base64,'
      encoded = new Buffer(data).toString 'base64'
    else
      encoded = encodeURIComponent(new Buffer(data).toString())

    formatMap[format] + str + encoded + '\''

  # returns a rounded string from a float or string
  roundNum: (num) ->
    Math.round(num).toString()

  # checks if there are spaces in the filename
  hasSpace: (filename) ->
    filename.indexOf(' ') >= 0

  # replaces spaces in filenames with dashes
  replaceSpaces: (filename, inDir) ->
    if this.hasSpace(filename) is true
      newFilename = filename.split(' ').join('-')
      fs.renameSync(inDir + '/' + filename, inDir + '/' + newFilename)

  # trims file extension from filename
  trimExt: (filename) ->
    # return filename.split('.')[0]
    filename.replace(/\.[^/.]+$/, '')

  # removes files from a list that aren't SVG images
  filterNonSvgFiles: (files, dir) ->
    _.filter files, (file) ->
      fs.statSync( path.join(dir + '/' + file) ).isFile() == true &&
      mime.lookup(file) == 'image/svg+xml'

  # returns an optimized SVG data string as a promise
  optimizeSvg: (data) ->
    d = Q.defer()
    svgo.optimize data, (result) ->
      d.reject new Error(result.error) if result.error
      d.resolve result
    d.promise

  # spins up phantomjs and saves SVGs as PNGs
  saveSvgAsPng: (inFile, outFile) ->
    d = Q.defer()
    svg2png inFile, outFile, (err) ->
      d.reject new Error(err) if err
      d.resolve outFile
    d.promise

  # returns a string that can be saved as a CSS file
  createCssRules: (results, opts) ->
    str = ''
    _.each results, (res, i) ->
      str +=
        ".#{res.name}{" +
        "height:#{res.height}px;" +
        "width:#{res.width}px;" +
        "background-image:url(#{res.svgdatauri});" +
        "}" +
        ".no-inlinesvg .#{res.name}{" +
        "background-image:url(#{res.pngdatauri});" +
        "}"

      # fallback PNG images
      if !opts.nopng
        str +=
          ".no-datauri .#{res.name}{" +
          "background-image:url('#{res.pngpath}');" +
          "}"
    str

  # returns a "beautified" version of a css string
  prettyCss: (str) ->
    pretty str