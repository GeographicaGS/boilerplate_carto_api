'use strict';

const gulp = require('gulp');
const batch = require('gulp-batch');
const watch = require('gulp-watch');
const spawn = require('child_process').spawn;

let node = undefined;

gulp.task('start', function() {
  if (node) {
    node.kill('SIGKILL');
  }
  node = spawn('node', ['./bin/api'], { stdio: 'inherit' });
  node.on('close', function(code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('start-dev', ['start'], function () {
  watch('./**/*.js', batch(function(events, done) {
    gulp.start('start', done);
  }));
});

gulp.task('default', ['start']);

process.on('exit', function() {
  if (node) {
    node.kill()
  }
});
