var   gulp = require("gulp"),
      sass = require("gulp-sass"),
      jade = require("gulp-jade"),
      sourcemaps = require('gulp-sourcemaps'),
      autoprefixer = require('gulp-autoprefixer'),
      imagemin = require('gulp-imagemin'),
      imageminJpegtran = require('imagemin-jpegtran'),
      imageminSvgo = require('imagemin-svgo'),
      imageminPngquant = require('imagemin-pngquant'),
      imageminGifsicle = require('imagemin-gifsicle'),
      uglify = require('gulp-uglify'),
      concat = require('gulp-concat'),
      browserSync = require('browser-sync'),
      reload = browserSync.reload;

gulp.task('default', ['browser-sync'], function() {
    gulp.start('jade', 'sass', 'scriptsJs', 'images');
});

gulp.task('sass', function () {
    return gulp.src('source/css/**/*.sass')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer( ['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
          cascade: true
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./css'));
});

gulp.task('jade', function () {
    return gulp.src('source/jade/**/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./'))
});

gulp.task('images', function() {
  	return gulp.src('source/img/**/*')
        .pipe(imagemin({
          imageminJpegtran: [{progressive: true}],
          imageminSvgo: [{removeViewBox: false}],
          imageminPngquant: [{quality: '65-80', speed: 4}],
          imageminGifsicle: [{interlaced: true}]
        }))
    		.pipe(gulp.dest('./img'))
        .pipe(browserSync.stream());
});

gulp.task('scriptsJs', function() {
    return gulp.src('source/js/concatenar/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('script.js'))
        .pipe(gulp.dest('source/js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./js'));
});

gulp.task('watch', function() {
    gulp.watch('source/css/**/*.sass', ['sass']);
    gulp.watch('source/jade/**/*.jade', ['jade']);
    gulp.watch('source/img/**').on('change', function() {
        gulp.run('images');
    });
    gulp.watch('source/js/**/*', ['scriptsJs']);
    gulp.watch('./**.*').on('change', reload);
});

gulp.task('browser-sync', ['watch'], function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

});
