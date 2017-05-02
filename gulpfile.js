'use strict';

var gulp         = require('gulp'),		// Основной плагин Gulp
    rename       = require('gulp-rename'), // Переименовать файлы
    rigger       = require('gulp-rigger'), // Склейка //= template/footer.html
    cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
    imagemin     = require('gulp-imagemin'), // Минификация изображений
    //cleanCSS     = require('gulp-clean-css'), // Очистка лишнего CSS
    //csso         = require('gulp-csso'), // Минификация CSS
    autoprefixer = require('gulp-autoprefixer'), // Автопрефікси CSS
    sass         = require('gulp-sass'), // Конверстация SASS (SCSS) в CSS
    sourcemaps   = require('gulp-sourcemaps'), // Карта CSS
    uglify       = require('gulp-uglify'), // Минификация JS
    plumber      = require('gulp-plumber'), // Предохраняе Gulp от вылета
    debug        = require('gulp-debug'), // Вывод в консоль
    notify       = require('gulp-notify'), // Уведомления в всплываючих окнах
    watch        = require('gulp-watch'), // Слежка за файламми
    //zip          = require('gulp-zip'), // Архивация
    clean        = require('gulp-clean'), // Очистка сборочной директории
    browserSync  = require('browser-sync'); //  Локальный сервер

var path = {
	src: { //Пути откуда брать исходники
		dir: 'app/', // Корневая директория исходинков
		html: 'app/template/*.html', //Синтаксис app/*.html говорит gulp что мы хотим взять все файлы с расширением .html
		js: 'app/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
		style: 'app/sass/main.scss',
		libs: 'app/libs/**/*.*',
		img: 'app/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
		fonts: 'app/fonts/**/*.*'
	},
	build: { //Тут мы укажем куда складывать готовые после сборки файлы
		dir: 'build/', // Корневая директория диплойта
		html: 'build/',
		js: 'build/js/',
		css: 'build/style/',
		libs: 'build/libs/',
		img: 'build/img/',
		fonts: 'build/fonts/'
	},
	watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
		html: 'app/template/*.html',
		js: 'app/js/**/*.js',
		style: 'app/sass/**/*.scss',
		img: 'app/img/**/*.*',
		fonts: 'app/fonts/**/*.*'
	}
};

// настройки уведомлений про ошибки
var errorHandler = {
    errorHandler: notify.onError({
        title: '<%= error.plugin %> - <%= error.relativePath %> <%= error.line %> \\ <%= error.column %>',
        message: 'Ошибка <%= error.messageOriginal %>'
    })
};

// настройки dev сервера:
var config = {
	server: {
		baseDir: [path.build.dir]
	},
	notify: false,
	//tunnel: true,
	host: 'localhost',
	port: 9000,
	logPrefix: "WebServer"
};

// Задача "html".  Запускается "gulp html"
gulp.task('html', function () {
	gulp.src(path.src.html) //Выберем файлы по нужному пути
	    .pipe(debug({title: 'html'}))
		.pipe(rigger()) //Прогоним через rigger
		.pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
		.pipe(browserSync.reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

// Задача "sass". Запускается "gulp sass"
gulp.task('sass', function () { 
	gulp.src(path.src.style) // файл, который обрабатываем
		.pipe(debug({title: 'sass'}))
	    .pipe(plumber(errorHandler)) // если ошибка выводим ее
		.pipe(sourcemaps.init()) // инициация map css
		.pipe(sass({outputStyle: 'compact'})) // (expanded,compact,compressed) конвертируем sass в css
		.pipe(autoprefixer()) // автопрефікси css
		//.pipe(rename({suffix: '.min'})) //переименовуем
		//.pipe(cleanCSS()) // удаление лишнего css
		//.pipe(csso()) // минифицируем css, полученный на предыдущем шаге
		.pipe(sourcemaps.write()) // записать map css
		.pipe(gulp.dest(path.build.css)) // результат пишем по указанному адресу
		.pipe(browserSync.reload({stream: true}));
});

// Задача "js". Запускается "gulp js"
gulp.task('js', function() {
	gulp.src(path.src.js)
		.pipe(plumber(errorHandler)) // если ошибка выводим ее
		.pipe(rigger()) //обединение
		.pipe(gulp.dest(path.build.js)) //сохраняем
		.pipe(uglify()) //сожмем наш js
		.pipe(rename({suffix: '.min'})) //переименовуем
		.pipe(gulp.dest(path.build.js)) //сохраняем
});

// Задача "libs". Запускается "gulp libs"
gulp.task('libs', function() {
    gulp.src(path.src.libs)
        .pipe(gulp.dest(path.build.libs))
});

// Задача "images". Запускается "gulp images"
gulp.task('images', function() {
    gulp.src(path.src.img) // берем любые файлы в папке и ее подпапках
        .pipe(cache(imagemin())) // оптимизируем изображения для веба
        .pipe(gulp.dest(path.build.img)) // результат пишем по указанному адресу
        .pipe(browserSync.reload({stream: true}));
});

// Задача "fonts". Запускается "gulp fonts"
gulp.task('fonts', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

// Веб сервер, Запускается "gulp fonts"
gulp.task('webserver', function () {
    browserSync(config);
});

 // Очистить сборочную директорию и удалить все, в ней
gulp.task('clean', function () { 
	gulp.src(path.build.dir, {read: false}) 
		.pipe(debug({title: 'clean'}))
		.pipe(clean())
		.pipe(notify({title: 'Очистка директории',message: 'Директория удалена',}));
});

// Очистить Кеш
gulp.task('clear', function () {
    return cache.clearAll();
});

// Задача "watch". Запускается "gulp watch"
gulp.task('watch', function () {
	gulp.watch(path.watch.html, ['html']); 
	gulp.watch(path.watch.style, ['sass']); 
	gulp.watch(path.watch.js, ['js']);
	gulp.watch(path.watch.img, ['images']);
	gulp.watch(path.watch.fonts, ['fonts']);
});

gulp.task('build', ['html','sass','js','libs','images','fonts']);

gulp.task('default', ['build','watch', 'webserver']);