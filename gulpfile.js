var gulp = require('gulp');
var webserver = require('gulp-webserver');
var browserify = require('gulp-browserify');

gulp.task('dex', function(){
  console.log('dexin is playing with gulp');
});

gulp.task('build', function(){
  gulp.src('main.html').pipe(gulp.dest('dist'));
  return gulp.src(['src/*.js'])
    .pipe(browserify())
    .pipe(gulp.dest('dist'));
});


gulp.task('serve', function() {
  gulp.src('dist')
    .pipe(webserver({
      fallback: 'main.html',
      livereload: true
    }));
});
