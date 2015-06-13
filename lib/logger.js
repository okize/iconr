'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var path = require('path');
var chalk = require('chalk');
var Progger = require('progger');
var progress = new Progger({ speed: 100, token: '.', color: 'blue' });
var messages = require(path.resolve(__dirname, '..', 'lang', 'messages.json'));

// configuration for command line colorization
var COLORMAP = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  ask: 'green',
  list: 'white'
};

var Logger = (function () {
  function Logger(options) {
    _classCallCheck(this, Logger);

    this.verbose = options.verbose;
  }

  _createClass(Logger, [{
    key: 'msg',
    value: function msg(type, key, data) {
      if (this.verbose || type === 'error') {
        var args = data === undefined ? '' : data;
        return console.log(chalk[COLORMAP[type]](messages[type][key]), args);
      }
    }
  }, {
    key: 'startProgress',
    value: function startProgress() {
      if (this.verbose) {
        progress.start();
      }
    }
  }, {
    key: 'stopProgress',
    value: function stopProgress() {
      if (this.verbose) {
        progress.stop();
      }
    }
  }]);

  return Logger;
})();

module.exports = Logger;