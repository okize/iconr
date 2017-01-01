# modules
path = require('path')
fs = require('fs')
_ = require('lodash')
gulp = require('gulp-help')(require('gulp'))
run = require('run-sequence')
gutil = require('gulp-util')
eslint = require('gulp-eslint')
plumber = require('gulp-plumber')
template = require('gulp-template')
rename = require('gulp-rename')
json2markdown = require('json2markdown')
spawn = require('child_process').spawn
clean = require('del')

# configuration
appRoot = __dirname

# small wrapper around gulp util logging
log = (msg, type) ->
  if type == 'error'
    gutil.log gutil.colors.red(msg)
  else
    gutil.log gutil.colors.blue(msg)

# used to prevent watch from breaking on CS error
swallowError = (error) ->
  log error, 'error'

gulp.task 'watch', 'Watches files and triggers lint on change.', ->
  log 'watching files...'
  gulp.watch 'lib/**/*.js', ['lint']

gulp.task 'lint', 'Lints javascript.', ->
  log 'linting es6 javascript...'
  gulp
    .src('**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())

gulp.task 'docs', 'Generates readme file.', ->
  log 'generating readme'
  pak = JSON.parse(fs.readFileSync './package.json', 'utf8')
  helpOptions = JSON.parse(fs.readFileSync './lang/options.json', 'utf8')
  helpOptions = _.map(helpOptions, (option) ->
    _.pick(option, 'longName', 'shortName', 'description');
  )
  helpText = json2markdown(helpOptions)
  gulp
    .src('src/readme_template.md')
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

gulp.task 'release', 'Builds module, bumps version & publishes to npm.', (done) ->
  run(
    'docs'
    'bump'
    'publish'
    done
  )
