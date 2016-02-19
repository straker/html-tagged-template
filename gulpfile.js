var gulp = require('gulp');
var jshint = require('gulp-jshint');
var Server = require('karma').Server;
var connect = require('gulp-connect');

gulp.task('lint', function() {
  return gulp.src('index.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
});

gulp.task('test', function(done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
  }, done).start();
});

gulp.task('test-ci', function(done) {
  new Server({
    configFile: __dirname + '/karma.conf-ci.js',
  }, done).start();
});

gulp.task('connect', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch('index.js', ['lint']);
});

gulp.task('default', ['lint', 'test', 'watch']);