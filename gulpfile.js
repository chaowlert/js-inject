'use strict';

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************

// Enable ES6
require('harmonize')();

var gulp = require('gulp'),
    clean = require('gulp-clean'),
    istanbul = require('gulp-istanbul'),
    istanbulReport = require('gulp-istanbul-report'),
    listfiles = require('gulp-listfiles'),
    mocha = require('gulp-mocha'),
    ngAnnotate = require('gulp-ng-annotate'),
    sourcemaps = require('gulp-sourcemaps'),
    tslint = require('gulp-tslint'),
    typedoc = require('gulp-typedoc'),
    tsc = require('gulp-typescript'),
    merge = require('merge2'),
    remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul'),
    runSequence = require('run-sequence');

//******************************************************************************
//* LINT
//******************************************************************************
gulp.task('lint', function () {

    return gulp.src([
        'src/**/*.ts',
        'test/**/*.ts'
    ])
        .pipe(tslint({ formatter: 'verbose' }))
        .pipe(tslint.report({ emitError: true }));
});

//******************************************************************************
//* PUBLISH
//******************************************************************************
var pkg = require('./package.json');

var tsDistProject = tsc.createProject('tsconfig.json', {
    declaration: true,
    stripInternal: true,
    typescript: require('typescript')
});

gulp.task('build-dist', function () {
    var tsResult = gulp.src('src/**/*.ts')
        .pipe(tsc(tsDistProject))
        .on('error', function (err) {
            process.exit(1);
        });
    return merge([
        tsResult.js.pipe(gulp.dest('dist/')),
        tsResult.dts.pipe(gulp.dest('dist/')),
    ]);
});

gulp.task('clean-dist', function () {
    return gulp.src('dist', { read: false })
        .pipe(clean());
});

gulp.task('dist', function (cb) {
    runSequence(
        'clean-dist',
        'build-dist',
        cb);
});

//******************************************************************************
//* TESTS
//******************************************************************************

gulp.task('listfiles-model', function () {
    return gulp.src([
        'src/models/**.ts'
    ], { read: false })
        .pipe(listfiles({
            filename: '_models.ts',
            prefix: 'import \'./',
            postfix: '\';',
            replacements: [{
                pattern: /\.[^/.]+$/,
                replacement: ''
            }]
        }))
        .pipe(gulp.dest('src/models'));
});

gulp.task('listfiles-index', function () {
    return gulp.src([
        'src/**/*.ts',
        '!src/index.ts',
        '!src/models/**.ts'
    ], { read: false })
        .pipe(listfiles({
            filename: 'index.ts',
            prefix: 'export * from \'./',
            postfix: '\';',
            banner: 'import \'./models/_models\';',
            replacements: [{
                pattern: /\.[^/.]+$/,
                replacement: ''
            }]
        }))
        .pipe(gulp.dest('src/'));
});

var tsSrcProject = tsc.createProject('tsconfig.json', {
    typescript: require('typescript')
});

gulp.task('build-src', function () {
    return gulp.src(['src/**/*.ts'], { base: './' })
        .pipe(sourcemaps.init())
        .pipe(tsc(tsSrcProject))
        .on('error', function (err) {
            process.exit(1);
        })
        .js
        .pipe(sourcemaps.write('./', {sourceRoot: './'}))
        .pipe(gulp.dest('build/'));
});

var tsTestProject = tsc.createProject('tsconfig.json', {
    removeComments: false,
    typescript: require('typescript')
});

gulp.task('build-test', function () {
    return gulp.src(['test/**/*.ts'], { base: './' })
        .pipe(sourcemaps.init())
        .pipe(tsc(tsTestProject))
        .on('error', function (err) {
            process.exit(1);
        })
        .js
        .pipe(ngAnnotate({ add: true, remove: true, singleQuotes: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('build/'));
});

gulp.task('clean-build', function () {
    return gulp.src('build', { read: false })
        .pipe(clean());
});

gulp.task('mocha', function () {
    return gulp.src([
        'node_modules/reflect-metadata/Reflect.js',
        'build/test/**/*.js'
    ])
        .pipe(mocha({ ui: 'bdd' }))
        .pipe(istanbul.writeReports({
            reporters: ['json']
        }));
});

gulp.task('istanbul:hook', function () {
    return gulp.src([
        'build/src/**/*.js',
        '!build/src/index.js',
        '!build/src/models/_models.js'])
        // Covering files
        .pipe(istanbul())
        // Force `require` to return covered files
        .pipe(istanbul.hookRequire());
});

gulp.task('remap-istanbul', function () {
    return gulp.src('coverage/coverage-final.json')
        .pipe(remapIstanbul())
        .pipe(istanbulReport({
            dir: './coverage',
            reporters: ['lcov', 'json', 'text', 'text-summary']
        }));
});

gulp.task('test', function (cb) {
    runSequence('istanbul:hook', 'mocha', 'remap-istanbul', cb);
});

gulp.task('build', function (cb) {
    runSequence(
        'lint',
        'clean-build',
        'listfiles-model',
        'listfiles-index',
        'build-src',
        'build-test', cb);
});

//******************************************************************************
//* DOCS
//******************************************************************************
gulp.task('document', function () {
    return gulp
        .src([
            'src/**/**.ts',
            'typings/index.d.ts'
        ])
        .pipe(typedoc({
            // TypeScript options (see typescript docs)
            target: 'es6',
            module: 'commonjs',
            moduleResolution: 'node',
            isolatedModules: false,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            noImplicitAny: true,
            noLib: false,
            preserveConstEnums: true,
            suppressImplicitAnyIndexErrors: true,
            // Output options (see typedoc docs)
            out: './docs',
            name: pkg.name,
            version: true,
            theme: 'minimal'
        }));
});

//******************************************************************************
//* DEFAULT
//******************************************************************************
gulp.task('default', function (cb) {
    runSequence(
        'build',
        'test',
        'dist',
        cb);
});
