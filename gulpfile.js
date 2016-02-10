var   gulp = require("gulp"),
        sass = require("gulp-sass"),
        jade = require("gulp-jade"),
        sourcemaps = require('gulp-sourcemaps'),
        autoprefixer = require('gulp-autoprefixer'),
        imagemin = require('gulp-imagemin'),
        pngquant = require('imagemin-pngquant'),
        uglify = require('gulp-uglify'),
        concat = require('gulp-concat'),
        browserSync = require('browser-sync');

gulp.task('default', ['watch'], function() {
    gulp.start('browser-sync', 'jade', 'sass', 'images', 'scriptsJs');
});

gulp.task('sass', function () {
    return gulp.src('source/css/**/*.sass')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer( ['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
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
	return gulp.src('source/img/*')
		.pipe(imagemin({
            progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('./img'));
});

gulp.task('scriptsJs', function() {
    return gulp.src('source/js/custom/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('script.js'))
        .pipe(gulp.dest('source/js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./js'));
});

gulp.task('watch', function() {
    gulp.watch('source/css/**/*', ['sass']);
    gulp.watch('source/jade/**/*', ['jade']);
    gulp.watch('source/js/custom/*', ['scriptsJs']);
    gulp.watch('source/img/**/*', ['images']);
});

gulp.task('browser-sync', function() {
  browserSync.init({
      server: {
          baseDir: "./"
      }
  });

    gulp.watch('source/css/**/*.sass', ['sass']).on('change', browserSync.reload);
    gulp.watch('source/jade/**/*.jade', ['jade']).on('change', browserSync.reload);
    gulp.watch("./*").on('change', browserSync.reload);
});
