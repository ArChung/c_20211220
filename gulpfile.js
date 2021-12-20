/**
*   Gulp with TailwindCSS - An CSS Utility framework                                
*   Author : Manjunath G                                              
*   URL : manjumjn.com | lazymozek.com
*   Twitter : twitter.com/manju_mjn                                    
**/

/*
  Usage:
  1. npm install //To install all dev dependencies of package
  2. npm run dev //To start development and server for live preview
  3. npm run prod //To generate minifed files for live server
*/

const { src, dest, task, watch, series, parallel } = require('gulp');
const del = require('del'); //For Cleaning build/dist for fresh export
const options = require("./config"); //paths and other options from config.js
const browserSync = require('browser-sync').create();

const sass = require('gulp-sass'); //For Compiling SASS files
const postcss = require('gulp-postcss'); //For Compiling tailwind utilities with tailwind config
const concat = require('gulp-concat'); //For Concatinating js,css files
const uglify = require('gulp-terser');//To Minify JS files
const imagemin = require('gulp-imagemin'); //To Optimize Images
const cleanCSS = require('gulp-clean-css');//To Minify CSS files
const purgecss = require('gulp-purgecss');// Remove Unused CSS from Styles


////
const frontMatter = require('gulp-front-matter');
const layout = require('gulp-layout');
const useref = require('gulp-useref');
const plumber = require('gulp-plumber');
const sassImage = require("gulp-sass-image");
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const merge = require('merge-stream');
const buffer = require('vinyl-buffer');
const babelify = require("babelify");


//Note : Webp still not supported in major browsers including forefox
//const webp = require('gulp-webp'); //For converting images to WebP format
//const replace = require('gulp-replace'); //For Replacing img formats to webp in html
const logSymbols = require('log-symbols'); //For Symbolic Console logs :) :P 

//Load Previews on Browser on dev
function livePreview(done) {
  browserSync.init({
    server: {
      baseDir: options.paths.dist.base
    },
    port: options.config.port || 5000
  });
  done();
}

// Triggers Browser reload
function previewReload(done) {
  console.log("\n\t" + logSymbols.info, "Reloading Browser Preview.\n");
  browserSync.reload();
  done();
}

//Development Tasks
function devHTML() {
  // return src(`${options.paths.src.base}/**/*.html`).pipe(dest(options.paths.dist.base));
  return src(["./src/**/*.html"])
    .pipe(plumber())
    .pipe(frontMatter())
    .pipe(
      layout(file => {
        return file.frontMatter
      })
    )
    .pipe(useref())
    .pipe(dest(options.paths.dist.base));
}


function devStyles() {
  const tailwindcss = require('tailwindcss');
  return src(`${options.paths.src.css}/**/*.sass`).pipe(sass().on('error', sass.logError))
    .pipe(dest(options.paths.src.css))
    .pipe(postcss([
      tailwindcss(options.config.tailwindjs),
      require('autoprefixer'),
    ]))
    .pipe(concat({ path: 'style.css' }))
    .pipe(dest(options.paths.dist.css));
}



function devScripts() {

  return browserify('src/js/main.js')
    .transform(babelify.configure({
      presets: ["@babel/preset-env"]
    }))
    .bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(dest(options.paths.dist.js));
}

function devImages() {
  return src(`${options.paths.src.img}/**/*.+(jpeg|jpg|png|gif|svg)`).pipe(dest(options.paths.dist.img));
}


function goSassImage() {
  return src(options.paths.src.img + '/**/*.+(jpeg|jpg|png|gif|svg)')
    .pipe(sassImage({
      targetFile: '_images_data.scss', // 處理完的 SCSS 檔名
      css_path: options.paths.src.css, // CSS 檔案位置
      images_path: options.paths.src.img, // image 檔案位置
      includeData: false, // 是否將 image 加入到 SCSS 中
    }))
    .pipe(dest(options.paths.src.css)); // 處理後的 SCSS 檔放位置
}


function watchFiles() {
  watch(`${options.paths.src.base}/**/*.ejs`, series(devHTML, devStyles, previewReload));
  watch(`${options.paths.src.base}/**/*.html`, series(devHTML, devStyles, previewReload));
  watch([options.config.tailwindjs, `${options.paths.src.css}/**/*.sass`], series(devStyles, previewReload));
  watch(`${options.paths.src.js}/**/*.js`, series(devScripts, previewReload));
  watch(`${options.paths.src.img}/**/*`, series(goSassImage, devImages, previewReload));
  console.log("\n\t" + logSymbols.info, "Watching for Changes..\n");
}

function devClean() {
  console.log("\n\t" + logSymbols.info, "Cleaning dist folder for fresh start.\n");
  return del([options.paths.dist.base]);
}

//Production Tasks (Optimized Build for Live/Production Sites)
function prodHTML() {
  // return src(`${options.paths.src.base}/**/*.html`).pipe(dest(options.paths.build.base));
  return src(["./src/**/*.html"])
    .pipe(plumber())
    .pipe(frontMatter())
    .pipe(
      layout(file => {
        return file.frontMatter
      })
    )
    .pipe(useref())
    .pipe(dest(options.paths.build.base));
}

function prodStyles() {
  return src(`${options.paths.dist.css}/**/*`)
    .pipe(purgecss({
      content: ['src/**/*.{html,js,ejs}'],
      defaultExtractor: content => {
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []
        const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || []
        return broadMatches.concat(innerMatches)
      }
    }))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(dest(options.paths.build.css));
}

function prodScripts() {
  return browserify('src/js/main.js')
    .transform(babelify.configure({
      presets: ["@babel/preset-env"]
    }))
    .bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(dest(options.paths.build.js));
}

function prodImages() {
  return src(options.paths.src.img + '/**/*.+(jpeg|jpg|png|gif|svg)').pipe(imagemin()).pipe(dest(options.paths.build.img));
}

function prodClean() {
  console.log("\n\t" + logSymbols.info, "Cleaning build folder for fresh start.\n");
  return del([options.paths.build.base]);
}

function buildFinish(done) {
  console.log("\n\t" + logSymbols.info, `Production build is complete. Files are located at ${options.paths.build.base}\n`);
  done();
}

exports.default = series(
  devClean, // Clean Dist Folder
  parallel(goSassImage, devStyles, devScripts, devImages, devHTML), //Run All tasks in parallel
  livePreview, // Live Preview Build
  watchFiles // Watch for Live Changes
);

exports.prod = series(
  prodClean, // Clean Build Folder
  parallel(goSassImage, prodStyles, prodScripts, prodImages, prodHTML), //Run All tasks in parallel
  buildFinish
);




