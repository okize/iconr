# modules
fs = require('fs')
path = require('path')
_ = require('underscore')
Q = require('q')
SVGO = require('svgo')
svgo = new SVGO()
svg2png = require('svg2png')
mime = require('mime')
log = require( path.resolve(__dirname, './', 'log') )

# temp (these will be passed as arguments)
inDir = path.resolve(__dirname, '..', 'test', 'inDir')
outDir = path.resolve(__dirname, '..', 'test', 'outDir')

# Q wrappers for some node methods
readDir = Q.denodeify fs.readdir
pathExists = Q.denodeify fs.exists

module.exports = (args) ->
  # console.log args

  # confirm directory exists
  pathExists inDir, (exists) ->

    if exists

      # read files in directory
      # filter anything that isn't an SVG
      #
      readDir(inDir)
        .then( (files) ->
          filtered = _.filter files, (file) ->
            fs.statSync( path.join(inDir + '/' + file) ).isFile() == true &&
            mime.lookup(file) == 'image/svg+xml'
        )
        .then( (filtered) ->
          console.log filtered
        )

    else
      log.msg 'error', 'wrongDirectory'
