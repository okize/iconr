# modules
path = require 'path'
fs = require 'fs'
gulp = require('gulp-help')(require 'gulp')
run = require 'run-sequence'
gutil = require 'gulp-util'
coffee = require 'gulp-coffee'
coffeelint = require 'gulp-coffeelint'
template = require 'gulp-template'
bump = require 'gulp-bump'
confirm = require 'gulp-confirm'
spawn = require('child_process').spawn
clean = require 'gulp-clean'

# configuration
appRoot = __dirname
pak = JSON.parse(fs.readFileSync './package.json', 'utf8')
readmeTemplate = 'src/README.md'
sourceDir = 'src/**/*.coffee'
buildDir = 'lib'

# small wrapper around gulp util logging
log = (msg) ->
  gutil.log gutil.colors.blue(msg)

# default task that's run with 'gulp'
gulp.task 'default', 'Builds module, bumps version & publishes to npm.', (done) ->
  run(
    'clean'
    ['docs', 'build']
    'bump'
    'npm'
    done
  )

gulp.task 'watch', 'Watches coffeescript files and triggers build on change.', ->
  log 'watching files...'
  gulp.watch sourceDir, ['build']

gulp.task 'clean', 'Deletes build directory.', ->
  log 'deleting build diectory'
  gulp
    .src(buildDir, read: false)
    .pipe(clean())

gulp.task 'lint', 'Lints coffeescript.', ->
  log 'linting coffeescript'
  gulp
    .src(sourceDir)
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())

gulp.task 'build', 'Compiles coffeescript source into javascript.', ->
  log 'compiling coffeescript'
  gulp
    .src(sourceDir)
    .pipe(coffee(
      bare: true
      sourceMap: false
    ).on('error', gutil.log))
    .pipe(
      gulp.dest buildDir
    )

gulp.task 'docs', 'Generates readme file.', ->
  log 'generating readme'
  helpText = fs.readFileSync './lang/help.txt', 'utf8'
  gulp
    .src(readmeTemplate)
    .pipe(
      template
        name: pak.name
        description: pak.description
        help: helpText
    )
    .pipe(
      gulp.dest './'
    )

gulp.task 'bump', 'Bumps patch version of module', ->
  gulp
  .src('./package.json')
  .pipe(bump(
    type: 'patch'
  ))
  .pipe gulp.dest('./')

gulp.task 'npm', 'Publishes module to npm', (done) ->
  spawn('npm', ['publish'],
    stdio: 'inherit'
  ).on 'close', done
