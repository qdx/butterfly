var gulp = require('gulp');
var webserver = require('gulp-webserver');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rimraf = require('rimraf');


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

gulp.task('release', function(){
  gulp.src('src/main.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest('qdx.github.io'));
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

// tasks for view render test
gulp.task('build-render-test', function(){
  gulp.src('src/render_test.html').pipe(gulp.dest('dist'));
  return browserify({
    entries: './src/render_test.js', 
    debug: true
  }).bundle()
    .pipe(source('render_test_bundle.js'))
  //.pipe(sourcemaps.init())
  //.pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
});

gulp.task('serve-render-test', function() {
  gulp.src('dist')
    .pipe(webserver({
      fallback: 'render_test.html',
      livereload: true
    }));
});

gulp.task('default', ['clean', 'build', 'serve']);
gulp.task('render-test', ['clean', 'build-render-test', 'serve-render-test']);
