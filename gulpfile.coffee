# modules
fs = require('fs')
_ = require('lodash')
gulp = require('gulp-help')(require('gulp'))
run = require('run-sequence')
gutil = require('gulp-util')
babel = require('gulp-babel')
eslint = require('gulp-eslint')
plumber = require('gulp-plumber')
template = require('gulp-template')
rename = require('gulp-rename')
json2markdown = require('json2markdown')
spawn = require('child_process').spawn
clean = require('del')
mocha = require('gulp-mocha')

# directory paths
dir =
  root: __dirname
  test: 'test/**.coffee'
  source: 'src/**/*.js'
  build: 'lib'

# small wrapper around gulp util logging
log = (msg, type) ->
  if type == 'error'
    gutil.log gutil.colors.red(msg)
  else
    gutil.log gutil.colors.blue(msg)

# used to prevent watch from breaking on compilation error
swallowError = (error) ->
  log error, 'error'

gulp.task 'tests', 'Runs test suite.', (done) ->
  log 'running tests...'
  gulp
    .src(dir.test)
    .pipe(mocha(reporter: 'spec')) #list

gulp.task 'test', 'Lints ES6 javascript and runs test suite.', (done) ->
  run(
    'lint'
    'tests'
    done
  )

gulp.task 'test-watch', 'Watches test files and runs suite on changes.', ->
  log 'watching files...'
  gulp.watch(dir.test, ['tests', 'compile'])

gulp.task 'lint', 'Lints ES6 javascript.', ->
  log 'linting es6 javascript...'
  gulp
    .src(dir.source)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())

gulp.task 'compile', 'Compiles ES6 javascript source into ES5.', ->
  log 'compiling es6 javascript...'
  gulp
    .src(dir.source)
    .pipe(plumber())
    .pipe(babel())
    .on('error', swallowError)
    .pipe(
      gulp.dest(dir.build)
    )

gulp.task 'watch', 'Watches ES6 javascript files and lints/compiles on changes.', ->
  log 'watching files...'
  gulp.watch(dir.source, ['lint', 'compile'])

gulp.task 'docs', 'Generates readme file.', ->
  log 'generating readme...'
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
    .pipe(
      gulp.dest(dir.root)
    )

gulp.task 'clean', 'Deletes build directory.', ->
  log 'deleting build diectory...'
  clean [
    dir.build
  ]

gulp.task 'bump', 'Bumps patch version of module.', (done) ->
  spawn('npm', ['version', 'patch'],
    stdio: 'inherit'
  ).on 'close', done

gulp.task 'publish', 'Publishes module to npm.', (done) ->
  spawn('npm', ['publish'],
    stdio: 'inherit'
  ).on 'close', done

gulp.task 'build', 'Compiles ES6 javascript source into ES5 and creates docs.', (done) ->
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
