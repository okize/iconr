const fs = require('fs');
const _ = require('lodash');
const gulp = require('gulp-help')(require('gulp'));
const run = require('run-sequence');
const gutil = require('gulp-util');
const template = require('gulp-template');
const rename = require('gulp-rename');
const json2markdown = require('json2markdown');
const spawn = require('child_process').spawn;

// small wrapper around gulp util logging
function log(msg, type) {
  if (type === 'error') {
    return gutil.log(gutil.colors.red(msg));
  }
  return gutil.log(gutil.colors.blue(msg));
}

gulp.task('docs', 'Generates readme file.', () => {
  log('generating readme');
  const pak = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  let helpOptions = JSON.parse(fs.readFileSync('./lang/options.json', 'utf8'));
  helpOptions = _.map(helpOptions, (option) => {
    return _.pick(option, 'longName', 'shortName', 'description');
  });
  const helpText = json2markdown(helpOptions);

  return gulp
          .src('src/readme_template.md')
          .pipe(template({
            name: pak.name,
            description: pak.description,
            help: helpText,
          }))
          .pipe(rename('README.md'))
          .pipe(gulp.dest('./'));
});

gulp.task('bump', 'Bumps patch version of module', (done) => {
  return spawn('npm', ['version', 'patch'], { stdio: 'inherit' }).on('close', done);
});

gulp.task('publish', 'Publishes module to npm', (done) => {
  return spawn('npm', ['publish'], { stdio: 'inherit' }).on('close', done);
});

gulp.task('release', 'Builds module, bumps version & publishes to npm.', (done) => {
  return run('docs', 'bump', 'publish', done);
});
