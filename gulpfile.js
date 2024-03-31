
let project_folder = "dist";
let source_folder = "#src";
let fs = require('fs');

let path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    //js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
    //icons: project_folder + "/fonts/webfonts/",
    //audio: project_folder + "/sounds/",
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    //js: [source_folder + "/js/script.js", "./node_modules/bootstrap/dist/js/bootstrap.bundle.js"],
    //js: [source_folder + "/js/script.js", source_folder + "/js/*.js" ],
    //js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/fonts/*.ttf",
    //icons: "./node_modules/@fortawesome/fontawesome-free/webfonts/*",
    //audio: source_folder + "/sounds/*.{wav,ac3,mp3,mp4,m4a,ogg}",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    //js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: "./" + project_folder + "/",
}

let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del");
    scss = require("gulp-sass")(require('sass'));
    autoprefixer = require("gulp-autoprefixer");
    group_media = require("gulp-group-css-media-queries");
    clean_css = require("gulp-clean-css");
    rename_css = require("gulp-rename");
    rename = require("gulp-rename");
    uglify = require("gulp-uglify-es").default;
    imagemin = require("gulp-imagemin");
    ttf2woff = require("gulp-ttf2woff");
    ttf2woff2 = require("gulp-ttf2woff2");
    fonter = require("gulp-fonter");
    //audiosprite = require("gulp-audiosprite");

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false,
  })
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(
      group_media()
      )
    .pipe(
      autoprefixer({        
        cascade: false
      })
    )
    .pipe(dest(path.build.css))
    .pipe(clean_css({
      level: { 1: { specialComments: 0 } }
    }))
    .pipe(
      rename_css({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

/* function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(
      uglify()
    )
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
} */

function images() {
  return src(path.src.img)
    .pipe(
      imagemin([
        imagemin.gifsicle(),
        imagemin.mozjpeg(),
        imagemin.optipng(),
        imagemin.svgo()
      ])
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function fonts() {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}

/* function faIcon () {
  return src(path.src.icons)
    .pipe(dest(path.build.icons));
} */

gulp.task('otf2ttf', function () {
  return src([source_folder + '/fonts/*.otf'])
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest(source_folder + '/fonts/'));
})

/* function audio () {
  return src(path.src.audio)
    .pipe(audiosprite({
      format: 'createjs'
    }))
    .pipe(dest(path.build.audio));
} */

function fontsStyle(params) {
  let file_content = fs.readFileSync(source_folder + '/scss/_fonts.scss');
  if (file_content == '') {
    fs.writeFile(source_folder + '/scss/_fonts.scss', '', cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(source_folder + '/scss/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
          }
          c_fontname = fontname;
        }
      }
    })
  }
}


function cb() {
  
}

function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  //gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);

}

function clean(params) {
  return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(/* js, */ css, html, images, fonts, /* audio, faIcon */), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

//exports.faIcon = faIcon;
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
//exports.js = js;
exports.css = css;
exports.html = html;
//exports.audio = audio;
exports.build = build;
exports.watch = watch;
exports.default = watch;