const fs = require('fs');
const gulp = require('gulp-help')(require('gulp'));
const gutil = require('gulp-util');
const template = require('gulp-template');
const rename = require('gulp-rename');
const json2markdown = require('json2markdown');

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
  const helpOptions = JSON.parse(fs.readFileSync('./lang/options.json', 'utf8'));
  const helpText = helpOptions.map(({ longName, shortName, description }) => {
    return { longName, shortName, description };
  });

  return (
    gulp
      .src('lib/readme_template.md')
      .pipe(template({
        name: pak.name,
        description: pak.description,
        help: json2markdown(helpText),
      }))
      .pipe(rename('README.md'))
      .pipe(gulp.dest('./'))
  );
});
