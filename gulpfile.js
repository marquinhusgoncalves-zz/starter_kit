var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    minifycss = require('gulp-minify-css'),
    sass = require('gulp-sass'),
    jade = require("gulp-jade"),
    browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
  browserSync({
    server: {
       baseDir: "./"
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('images', function(){
  gulp.src('source/img/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('img/'));
});

gulp.task('styles', function(){
  gulp.src(['source/styles/**/*.sass'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('css/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('css/'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('scripts', function(){
  return gulp.src('source/js/**/*.js')
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('js/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('js/'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('jade', function () {
    return gulp.src('source/jade/**/!(_)*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./'))
});

gulp.task('default', ['browser-sync'], function(){
  gulp.watch("source/styles/**/*.sass", ['styles']);
  gulp.watch("source/js/**/*.js", ['scripts']);
  gulp.watch("source/jade/**/*.jade", ['jade']);
  gulp.watch("source/img/**/*", ['images']);
  gulp.watch("*.html", ['bs-reload']);
});
