#!/usr/bin/env node

var path = require('path');
var cli = require(path.resolve(__dirname, '..', 'lib', 'cli'));

cli({
  stdin:  process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
  argv: process.argv
});
