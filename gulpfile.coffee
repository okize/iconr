# modules
gulp = require 'gulp'
gutil = require 'gulp-util'
coffee = require 'gulp-coffee'
coffeelint = require 'gulp-coffeelint'
clean = require 'gulp-clean'

# configuration
appRoot = __dirname
sourceDir = 'src/**/*.coffee'
buildDir = 'lib'

# small wrapper around gulp util logging
log = (msg) ->
  gutil.log '[gulpfile]', gutil.colors.blue(msg)

# default task that's run with 'gulp'
gulp.task 'default', [
  'watch'
]

# watches source files and triggers build on change
gulp.task 'watch', ->
  log 'watching files...'
  gulp.watch sourceDir, ['build']

# removes distribution folder
gulp.task 'clean', ->
  gulp
    .src(buildDir, read: false)
    .pipe(clean())

# lints coffeescript
gulp.task 'lint', ->
  gulp
    .src(sourceDir)
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())

# builds coffeescript source into deployable javascript
gulp.task 'build', ->
  gulp
    .src(sourceDir)
    .pipe(coffee(
      bare: true
      sourceMap: false
    ).on('error', gutil.log))
    .pipe(
      gulp.dest(buildDir)
    )

# deploys application
gulp.task 'deploy', [
  'clean',
  'build'
]
