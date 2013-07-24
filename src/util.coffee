# modules
fs = require('fs')
mime = require('mime')
_ = require('underscore')
Q = require('q')
svgo = new (require('svgo'))()

# returns binary data as encoded string
exports.encodeImage = encodeImage = (file, type) ->
  bitmap = fs.readFileSync(file)
  new Buffer(bitmap).toString(type)

# returns an optimized SVG data string as a promise
exports.saveSvgAsPng = saveSvgAsPng = (data) ->
  d = Q.defer()
  svgo.optimize data, (result) ->
    d.reject new Error(result.error) if result.error
    d.resolve result
  d.promise

# trims file extension from filename
exports.trimExt = trimExt = (filename) ->
  # return filename.split('.')[0]
  filename.replace(/\.[^/.]+$/, '')

# returns boolean for if filetype is SVG
exports.isSvg = isSvg = (file) ->
  mime.lookup(file) == 'image/svg+xml'

# removes files from a list that aren't SVG images
exports.filterNonSvgFiles = filterNonSvgFiles = (files) ->
  _.filter files, (file) ->
    # fs.statSync( path.join(inDir + '/' + file) ).isFile() == true &&
    isSvg file
