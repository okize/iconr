#!/usr/bin/env node

const cli = require('../lib/cli');

cli({
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
  argv: process.argv,
});
