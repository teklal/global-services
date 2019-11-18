var gulp = require('gulp');

var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var cp = require('child_process');
var fs = require('fs');
var plumber = require('gulp-plumber');
var request = require('request');
var runSequence = require('run-sequence').use(gulp);
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');  

// Copy from the .tmp to _site directory.
// To reduce build times the assets are compiles at the same time as jekyll
// renders the site. Once the rendering has finished the assets are copied.
gulp.task('copy:assets', function(done) {
  return gulp.src('.tmp/assets/**')
    .pipe(gulp.dest('_site/assets'));
});


var sassInput = 'app/assets/styles/*.scss';
var sassOptions = {
  includePaths: ['node_modules/bootstrap/scss','node_modules/@fortawesome/fontawesome-free/scss'],
  errLogToConsole: true,
  outputStyle: 'expanded'
};
var autoprefixerOptions = {};

// TODO: clean this up
// ===================
gulp.task('sass', function() {
  return gulp.src(sassInput)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(sourcemaps.write('.'))
    // .pipe($.if(isProduction, uglify({ mangle: false })))
    // .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('.tmp/assets/styles'));
});

gulp.task('fontawesome', function() {
  return gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/**.*')
    .pipe(gulp.dest('.tmp/assets/fonts'));
});

gulp.task('lightgallery-fonts', function() {
  return gulp.src('node_modules/lightgallery/dist/fonts/**.*')
    .pipe(gulp.dest('.tmp/assets/fonts'));
});
gulp.task('lightgallery-css', function() {
  return gulp.src('node_modules/lightgallery/dist/css/lightgallery.min.css')
    .pipe(gulp.dest('.tmp/assets/styles'));
});
gulp.task('lightgallery-img', function() {
  return gulp.src('node_modules/lightgallery/dist/img/**.*')
    .pipe(gulp.dest('.tmp/assets/img'));
});

gulp.task('justifiedGallery-css', function() {
  return gulp.src('app/assets/styles/justifiedGallery.min.css')
    .pipe(gulp.dest('.tmp/assets/styles'));
});


var javascriptPaths = [
  // the order of these matter
  "node_modules/jquery/dist/jquery.js",
  "node_modules/popper.js/dist/umd/popper.js",
  "node_modules/bootstrap/dist/js/bootstrap.js",
  "node_modules/lightgallery/dist/js/lightgallery.min.js",
  "node_modules/lightgallery/dist/js/lightgallery-all.min.js"
]

// TODO: clean this up
// ===================
gulp.task('javascripts', function() {
  // # https://github.com/Foundation-for-Jekyll-sites/jekyll-foundation/blob/master/gulp/tasks/javascript.js
  return gulp.src(javascriptPaths)
    // .pipe(sourcemaps.init())
    // .pipe(babel())
    .pipe(concat('vendor.min.js'))
    .pipe(uglify({ mangle: false }))
    // .pipe($.if(isProduction, uglify({ mangle: false })))
    // .pipe($.if(!isProduction, $.sourcemaps.write()))
    // Write the file to source dir and build dir
    .pipe(gulp.dest('.tmp/assets/js'))  
});

// Build the jekyll website.
gulp.task('jekyll', function (done) {
  var args = ['exec', 'jekyll', 'build'];

  switch (environment) {
    case 'development':
      args.push('--config=_config.yml,_config-dev.yml');
    break;
    case 'production':
      args.push('--config=_config.yml');
    break;
  }

  return cp.spawn('bundle', args, {stdio: 'inherit'})
    .on('close', done);
});

// Build the jekyll website. Reload all the browsers.
gulp.task('jekyll:rebuild', ['jekyll'], function () {
  browserSync.reload();
});

gulp.task('build', function(done) {
  runSequence(['jekyll', 'sass', 'javascripts', 'fontawesome', 'justifiedGallery-css', 'lightgallery-fonts', 'lightgallery-css', 'lightgallery-img'], ['copy:assets'], done);
});

// Default task.
gulp.task('default', function(done) {
  runSequence('build', done);
});

gulp.task('serve', ['build'], function () {
  browserSync({
    port: 3000,
    server: {
      baseDir: ['.tmp', '_site']
    }
  });
  
  // TODO: clean this up
  // ===================
  var watching = [
    './app/**/*.html',
    './app/**/*.yml',
    './app/**/*.md', 
    '_config*', 
    './app/assets/styles/*.scss'
  ]
  gulp.watch(watching, function() {
    runSequence('build', browserReload);
  });

});

var shouldReload = true;
gulp.task('no-reload', function(done) {
  shouldReload = false;
  runSequence('serve', done);
});

var environment = 'development';
gulp.task('prod', function(done) {
  environment = 'production';
  runSequence('clean', 'build', 'get-humans', done);
});

// Removes jekyll's _site folder
gulp.task('clean', function() {
  return gulp.src(['_site', '.tmp'], {read: false})
    .pipe(clean());
});


// Helper functions 
// ----------------

function browserReload() {
  if (shouldReload) {
    browserSync.reload();
  }
}

// Humans task 
// -----------
gulp.task('get-humans', function(){
  var getHumans = function(callback){
    var options = {
      url: 'https://api.github.com/repos/IFRCGo/global-services/contributors',
      headers: {
        'User-Agent': 'request'
      }
    };

    request(options, function (err, res, body) {
      if (!err && res.statusCode == 200) {
        var humans = JSON.parse(res.body).map(function(human){
          return {login: human.login, html_url: human.html_url, contributions: human.contributions}
        });
        humans.sort(function(a,b){
          return b.contributions - a.contributions;
        })
        callback(humans);
      } else {
        callback([]);
      }
    });
  }

  getHumans(function(humans){
    fs.readFile('./humans-template.txt', 'utf8', function (err, doc) {
      if (err) throw err;
      for (i = 0; i < humans.length; i++) {
        doc = doc + '\nContributor: '+humans[i].login + '\nGithub: '+humans[i].html_url +'\n';
      }
      fs.writeFile('./_site/humans.txt', doc, function(err) {
        if (err) throw err;
      });
    });
  });
});
