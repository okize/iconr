# modules
fs = require('fs')
mime = require('mime')
_ = require('underscore')
Q = require('q')
svgo = new (require('svgo'))()

# returns binary data as encoded string
exports.encodeImage = (data, type, format) ->
  formatMap =
    'svg': '\'data:image/svg+xml;base64,',
    'png': '\'data:image/png;base64,'
  encoded = new Buffer(data).toString(type)
  formatMap[format] + encoded + '\''

# returns a rounded string from a float or string
exports.roundNum = (num) ->
  Math.round(num).toString()

# trims file extension from filename
exports.trimExt = (filename) ->
  # return filename.split('.')[0]
  filename.replace(/\.[^/.]+$/, '')

# removes files from a list that aren't SVG images
exports.filterNonSvgFiles = (files) ->
  _.filter files, (file) ->
    # fs.statSync( path.join(inDir + '/' + file) ).isFile() == true &&
    mime.lookup(file) == 'image/svg+xml'

# returns an optimized SVG data string as a promise
exports.optimizeSvg = (data) ->
  d = Q.defer()
  svgo.optimize data, (result) ->
    d.reject new Error(result.error) if result.error
    d.resolve result
  d.promise
