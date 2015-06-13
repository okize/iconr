'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var path = require('path');
var chalk = require('chalk');
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
  function Logger() {
    _classCallCheck(this, Logger);
  }

  _createClass(Logger, [{
    key: 'msg',
    value: function msg(type, key, data) {
      var args = data === undefined ? '' : data;
      return console.log(chalk[COLORMAP[type]](messages[type][key]), args);
    }
  }]);

  return Logger;
})();

module.exports = exports = new Logger();