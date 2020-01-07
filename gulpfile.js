const gulp = require('gulp');

const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const cleaner = require('gulp-clean');
const concat = require('gulp-concat');
const cp = require('child_process');
const fs = require('fs');
const plumber = require('gulp-plumber');
const request = require('request');
const runSequence = require('run-sequence').use(gulp);
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');  


function clean() {
  return gulp.src(['_site', '.tmp'], {read: false, allowEmpty: true})
    .pipe(cleaner());
}
exports.clean = clean;


function copyAssets() {
  /* copy from the .tmp to _site directory. */
  /* to reduce build times the assets are compiles at the same time as jekyll */
  /* renders the site. Once the rendering has finished the assets are copied. */
  return gulp.src('.tmp/assets/**')
    .pipe(gulp.dest('_site/assets'));
}
exports.copyAssets = copyAssets;


function styles() { 
  const sassInput = 'app/assets/styles/*.scss';
  const sassOptions = {
    includePaths: ['node_modules/bootstrap/scss','node_modules/@fortawesome/fontawesome-free/scss'],
    errLogToConsole: true,
    outputStyle: 'expanded'
  };
  return gulp.src(sassInput)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('.tmp/assets/styles'));
}
exports.styles = styles;


function fontawesome() {
  return gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/**.*')
    .pipe(gulp.dest('.tmp/assets/fonts'));
}
exports.fontawesome = fontawesome;

function lightgalleryFonts() {
  return gulp.src('node_modules/lightgallery/dist/fonts/**.*')
    .pipe(gulp.dest('.tmp/assets/fonts'));
}
exports.lightgalleryFonts = lightgalleryFonts;

function lightgalleryCss() {
  return gulp.src('node_modules/lightgallery/dist/css/lightgallery.min.css')
    .pipe(gulp.dest('.tmp/assets/styles'));
}
exports.lightgalleryCss = lightgalleryCss;

function lightgalleryImg() {
  return gulp.src('node_modules/lightgallery/dist/img/**.*')
    .pipe(gulp.dest('.tmp/assets/img'));
}
exports.lightgalleryImg = lightgalleryImg;

function justifiedGalleryCss() {
  return gulp.src('app/assets/styles/justifiedGallery.min.css')
    .pipe(gulp.dest('.tmp/assets/styles'));
}
exports.justifiedGalleryCss = justifiedGalleryCss;

function javascripts() {
  const javascriptPaths = [
    // the order of these matter
    "node_modules/jquery/dist/jquery.js",
    "node_modules/popper.js/dist/umd/popper.js",
    "node_modules/@fortawesome/fontawesome-free/js/all.min.js",
    "node_modules/bootstrap/dist/js/bootstrap.js",
    "node_modules/lightgallery/dist/js/lightgallery.min.js",
    "node_modules/lightgallery/dist/js/lightgallery-all.min.js"
  ]
  /* https://github.com/Foundation-for-Jekyll-sites/jekyll-foundation/blob/master/gulp/tasks/javascript.js */
  return gulp.src(javascriptPaths)
    .pipe(concat('vendor.min.js'))
    .pipe(uglify({ mangle: false }))
    .pipe(gulp.dest('.tmp/assets/js'))  
}
exports.javascripts = javascripts;


/* Build the jekyll website. */
function jekyll(done) {
  const args = ['exec', 'jekyll', 'build'];

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
}
exports.jekyll = jekyll;


function getHumans(cb){

  function askGitHub(callback){
    const options = {
      url: 'https://api.github.com/repos/IFRCGo/global-services/contributors',
      headers: {
        'User-Agent': 'request'
      }
    };
    request(options, function (err, res) {
      var humans = JSON.parse(res.body).map(function(human){
        return {login: human.login, html_url: human.html_url, contributions: human.contributions}
      });
      humans.sort(function(a,b){
        return b.contributions - a.contributions;
      })
      callback(humans);
    });
  }
  
  askGitHub(function(humans){
    fs.readFile('./humans-template.txt', 'utf8', function (err, doc) {
      if (err) throw err;
      for (i = 0; i < humans.length; i++) {
        doc = doc + '\nContributor: '+humans[i].login + '\nGithub: '+humans[i].html_url +'\n';
      }
      fs.writeFile('./_site/humans.txt', doc, function(err) {
        if (err) throw err;
        cb()
      });
    });
  });

}
exports.getHumans = getHumans;



/* different build options */
/* ======================= */

function watching() {
  function browserReload() { browserSync.reload(); }
  browserSync({
    port: 3000,
    server: {
      baseDir: ['_site']
    }
  });
  gulp.watch(['app/', '_config*'], gulp.series(
    jekyll, 
    gulp.parallel(styles, javascripts), 
    copyAssets, 
    browserReload));   
}
exports.serve = gulp.series(
  jekyll, 
  gulp.parallel(styles, javascripts, fontawesome, justifiedGalleryCss, lightgalleryFonts, lightgalleryCss, lightgalleryImg), 
  copyAssets, 
  watching);

var environment = 'development';
function setProd(cb) { environment = 'production'; cb(); }
exports.prod = gulp.series(clean, setProd, jekyll, gulp.parallel(styles, javascripts, fontawesome, justifiedGalleryCss, lightgalleryFonts, lightgalleryCss, lightgalleryImg, getHumans), copyAssets);
