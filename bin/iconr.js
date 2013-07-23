#!/usr/bin/env node

// modules
var cli = require('../lib/cli'),
    argv = require('optimist').argv;

// init cli
cli(argv);