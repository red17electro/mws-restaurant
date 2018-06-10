/* eslint-env node */

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var uglifyes = require('gulp-uglifyes');
var uglifycss = require('gulp-uglifycss');
var cssnano = require('cssnano');
var autoprefixer = require('autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var postcss = require('gulp-postcss');
var jpegRecompress = require('imagemin-jpeg-recompress');
var concat = require('gulp-concat');
var responsive = require('gulp-responsive');
var webp = require('gulp-webp');
var babel = require('gulp-babel');
var htmlmin = require('gulp-htmlmin');
var replace = require('gulp-replace');
var fs = require('fs');

gulp.task('optimize-html', function () {
    return gulp.src('*.html')
        .pipe(replace('<link rel="stylesheet" href="css/styles.css">', function (s) {
            var style = fs.readFileSync('dist/css/styles.css', 'utf8');
            return '<style>\n' + style + '\n</style>';
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('copy-images', function () {
    gulp.src('img/*.png')
        /*         .pipe(imagemin([
                    imagemin.gifsicle({interlaced: true}),
                    imagemin.jpegtran({progressive: true}),
                    imagemin.optipng({optimizationLevel: 5}),
                    imagemin.svgo({
                        plugins: [
                            {removeViewBox: true},
                            {cleanupIDs: false}
                        ]
                    }),
                    pngquant()
                ])) */
        .pipe(webp())
        .pipe(gulp.dest('dist/img'));

    gulp.src('img/*.jpg')
        .pipe(webp())
        .pipe(gulp.dest('dist/img'));

    gulp.src('img/*.svg')
        .pipe(imagemin([
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('resp-images', function () {
    return gulp.src('src/*.{jpg,png}')
        .pipe($.responsive({
            // Convert all images to JPEG format
            '*': [{
                width: 300,
                rename: {
                    extname: '.jpg',
                },
            }, {
                // Produce 2x images and rename them
                width: 300 * 2,
                rename: {
                    suffix: '@2x',
                    extname: '.jpg',
                },
            }],
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('scripts_main', function () {
    gulp.src(['js/**/*.js', '!js/restaurant*.js'])
        .pipe(babel())
        .pipe(concat('all_main.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts_rest', function () {
    gulp.src(['js/**/*.js', '!js/main.js'])
        .pipe(babel())
        .pipe(concat('all_rest.js'))
        .pipe(gulp.dest('dist/js'));
});



gulp.task('scripts_main-dist', function () {
    gulp.src(['js/**/*.js', '!js/restaurant*.js'])
        .pipe(babel())
        .pipe(sourcemaps.init())
        .pipe(concat('all_main.js'))
        .pipe(uglifyes({
            mangle: false,
            ecma: 6
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
});


gulp.task('scripts_rest-dist', function () {
    gulp.src(['js/**/*.js', '!js/main.js'])
        .pipe(babel())
        .pipe(sourcemaps.init())
        .pipe(concat('all_rest.js'))
        .pipe(uglifyes({
            mangle: false,
            ecma: 6
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
});

/* This task, for now, just copies css to the dist folder */
gulp.task('styles', function () {

    var plugins = [
        autoprefixer({
            browsers: ['last 1 version']
        }),
        cssnano()
    ];

    gulp.src('css/**/*.css')
        .pipe(postcss(plugins))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('manifest', function () {
    gulp.src('manifest.json')
        .pipe(gulp.dest('dist/'));
});

gulp.task('sw', function () {
    gulp.src('sw.js')
        .pipe(gulp.dest('dist/'));
});

gulp.task('dist', [
    'copy-images',
    'styles',
    'optimize-html',
    'scripts_main-dist',
    'scripts_rest-dist',
    'manifest',
    'sw'
]);

gulp.task('default', ['copy-images', 'styles', 'optimize-html', 'scripts_main', 'scripts_rest', 'manifest', 'sw'], function () {

    gulp.watch('css/**/*.css', ['styles']);
    //gulp.watch('js/**/*.js', ['lint']);
    gulp.watch('*.html', ['optimize-html']);
    gulp.watch('dist/*.html').on('change', browserSync.reload);
    /* ensures live editing*/
    browserSync.init({
        server: './dist'
    });
});