var _ = require('underscore');
var es = require('event-stream');
var gulp = require('gulp');
var karma = require('gulp-karma');
var livereload = require('gulp-livereload');
var protractor = require('gulp-protractor').protractor;
var replace = require('gulp-replace');
var rjs = require('gulp-requirejs');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var express = require('express');
var path = require('path');
var plumber = require('gulp-plumber');
var clean = require('gulp-clean');

gulp.task('clean', function () {
    return gulp.src(['build', 'source/assets/css'], {read: false})
        .pipe(clean());
});

gulp.task('less', function () {
    return gulp.src('source/less/**/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest('./source/assets/css'))
        .pipe(livereload({ auto: false }));
});

gulp.task('js', function () {
    var configRequire = require('./source/js/config-require.js');
    var configBuild = {
        baseUrl: 'source/js',
        name: 'main',
        optimize: 'none',
        out: 'main.js',
        wrap: true
    };
    var config = _(configBuild).extend(configRequire);

    rjs(config)
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest('./build/js/'))
        .pipe(livereload({ auto: false }));
});

gulp.task('karma-ci', function () {
    gulp.src(['no need to supply files because everything is in config file'])
        .pipe(karma({
            configFile: 'karma-compiled.conf.js',
            action: 'run'
        }));
});

gulp.task('watch', ['server'], function () {

    livereload.listen();

    gulp.watch('./source/less/**/*.less', ['less']);
    gulp.watch('./source/js/**/*.js', ['js']);
    gulp.watch('./source/**/*.html').on('change', livereload.changed);
});

gulp.task('server', function () {
    var port = 4000;
    var app = express();
    app.use(require('connect-livereload')());
    app.use(express.static('source'));
    app.listen(port);
    console.log('static server start on port:' + port);
});

// Copy
gulp.task('copy', ['less'], function () {
    return es.concat(
        // update index.html to work when built
        gulp.src(['source/index.html'])
            .pipe(replace("require(['./js/main.js'])", "require(['./js/main.js'], function () { require(['main']); })"))
            .pipe(gulp.dest('build')),
        // copy config-require
        gulp.src(['source/js/config-require.js'])
            .pipe(uglify())
            .pipe(gulp.dest('build/js')),
        // copy vendor files
        gulp.src(['source/vendor/**/*'])
            .pipe(gulp.dest('build/vendor')),
        // copy assets
        gulp.src(['source/assets/**/*'])
            .pipe(gulp.dest('build/assets')),
        // minify requirejs
        gulp.src(['build/vendor/requirejs/require.js'])
            .pipe(uglify())
            .pipe(gulp.dest('build/vendor/requirejs')),
        // minify domReady
        gulp.src(['build/vendor/requirejs-domready/domReady.js'])
            .pipe(uglify())
            .pipe(gulp.dest('build/vendor/requirejs-domready'))
    );
});

gulp.task('build', ['copy', 'js']);
