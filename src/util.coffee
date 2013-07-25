# modules
fs = require('fs')
mime = require('mime')
_ = require('underscore')
Q = require('q')
svgo = new (require('svgo'))()
svg2png = require('svg2png')

module.exports =

  # returns binary data as encoded string
  encodeImage: (data, type, format) ->
    formatMap =
      'svg': '\'data:image/svg+xml;base64,',
      'png': '\'data:image/png;base64,'
    encoded = new Buffer(data).toString(type)
    formatMap[format] + encoded + '\''

  # returns a rounded string from a float or string
  roundNum: (num) ->
    Math.round(num).toString()

  # trims file extension from filename
  trimExt: (filename) ->
    # return filename.split('.')[0]
    filename.replace(/\.[^/.]+$/, '')

  # removes files from a list that aren't SVG images
  filterNonSvgFiles: (files) ->
    _.filter files, (file) ->
      # fs.statSync( path.join(inDir + '/' + file) ).isFile() == true &&
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
  createCss: (results) ->
    results


    # _.each results, (obj) ->
    #   console.log obj.pngdatauri.length



    # .then( (filteredFiles) ->
    #   console.log 'starting SVG to PNG conversion...'
    #   _.each filteredFiles, (file) ->
    #     svg2png path.resolve(inDir, file), path.resolve(outDir, util.trimExt(file)) + '.png', (err) ->
    #       throw err if err
    # )