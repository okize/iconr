#!/usr/bin/env node

// modules
var path = require('path');
var args = require('yargs').argv;
var cli = require(path.resolve(__dirname, '..', 'lib', 'cli'));

// init cli
cli(args);
