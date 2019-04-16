var gulp = require('gulp');
var fs = require('fs');
var rimraf = require('rimraf');
var exec = require('child_process').exec;

gulp.task('clean', function (done) {
	rimraf('./build', done);
});

gulp.task('compile', function (done) {
	exec('node-tsc.cmd', (err, stdout, stderr) => {
		console.log(stdout);
		console.log(stderr);
		done(err);
	});
});

gulp.task('watch', function () {
	gulp.watch([
		'src/**/*.ts'
	], ['compile']);
});

gulp.task('default', ['watch']);