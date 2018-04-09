var gulp = require('gulp');
var webserver = require('gulp-webserver');
var concat = require('gulp-concat');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rimraf = require('rimraf');

gulp.task('dex', function(){
  console.log('dexin is playing with gulp');
});

gulp.task('clean', function(c){
  rimraf('./dist', c);
});

gulp.task('build', function(){
  gulp.src('src/main.html').pipe(gulp.dest('dist'));
  return browserify({
    entries: './src/main.js', 
    debug: true
  }).bundle()
    .pipe(source('bundle.js'))
  //.pipe(sourcemaps.init())
  //.pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
});


gulp.task('serve', function() {
  gulp.src('dist')
    .pipe(webserver({
      fallback: 'main.html',
      livereload: true
    }));
});

gulp.task('default', ['clean', 'build', 'serve']);
