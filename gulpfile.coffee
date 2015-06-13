# modules
path = require('path')
fs = require('fs')
gulp = require('gulp-help')(require('gulp'))
run = require('run-sequence')
gutil = require('gulp-util')
babel = require('gulp-babel')
eslint = require('gulp-eslint')
rename = require('gulp-rename')
plumber = require('gulp-plumber')
template = require('gulp-template')
spawn = require('child_process').spawn
clean = require('del')

# configuration
appRoot = __dirname
pak = JSON.parse(fs.readFileSync './package.json', 'utf8')
readmeTemplate = 'src/readme_template.md'
sourceDir = 'src/**/*.js'
buildDir = 'lib'

# small wrapper around gulp util logging
log = (msg, type) ->
  if type == 'error'
    gutil.log gutil.colors.red(msg)
  else
    gutil.log gutil.colors.blue(msg)

# used to prevent watch from breaking on CS error
swallowError = (error) ->
  log error, 'error'

gulp.task 'watch', 'Watches coffeescript files and triggers build on change.', ->
  log 'watching files...'
  gulp.watch sourceDir, ['lint', 'build']

gulp.task 'clean', 'Deletes build directory.', ->
  log 'deleting build diectory'
  clean [
    buildDir
  ]

gulp.task 'lint', 'Lints javascript.', ->
  log 'linting es6 javascript...'
  gulp
    .src(sourceDir)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())

gulp.task 'compile', 'Compiles ES6 javascript source into ES5 javascript.', ->
  log 'compiling es6 javascript'
  gulp
    .src(sourceDir)
    .pipe(plumber())
    .pipe(babel())
    .on('error', swallowError)
    .pipe(
      gulp.dest(buildDir)
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
    .pipe(rename('README.md'))
    .pipe(gulp.dest './')

gulp.task 'bump', 'Bumps patch version of module', (done) ->
  spawn('npm', ['version', 'patch'],
    stdio: 'inherit'
  ).on 'close', done

gulp.task 'publish', 'Publishes module to npm', (done) ->
  spawn('npm', ['publish'],
    stdio: 'inherit'
  ).on 'close', done

gulp.task 'build', 'Compiles ES6 javascript source into ES5 javascript.', (done) ->
  run(
    'compile'
    'docs'
    done
  )

gulp.task 'release', 'Builds module, bumps version & publishes to npm.', (done) ->
  run(
    'build'
    'bump'
    'publish'
    done
  )
