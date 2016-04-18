const path = require('path');
const chalk = require('chalk');
const Progger = require('progger');
const messages = require(path.resolve(__dirname, '..', 'lang', 'messages.json'));

// configuration for command line colorization
const COLORMAP = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  ask: 'green',
  list: 'white',
};

class Logger {
  constructor(options) {
    this.verbose = options.verbose;
    this.progress = new Progger({ speed: 100, token: '.', color: 'blue' });
  }

  msg(type, key, data) {
    if (this.verbose || type === 'error') {
      const args = (data === undefined) ? '' : data;
      return console.log(chalk[COLORMAP[type]](messages[type][key]), args);
    }
    return false;
  }

  startProgress() {
    if (this.verbose) {
      this.progress.start();
    }
  }

  stopProgress() {
    if (this.verbose) {
      this.progress.stop();
    }
  }
}

module.exports = Logger;
