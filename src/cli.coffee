# modules
path = require('path')
fs = require('fs')
iconr = require(path.join(__dirname, '..', 'lib', 'app'))

# output version number of app
displayVersion = ->

  pkg = require(path.join(__dirname, '..', 'package.json'))
  console.log pkg.version

# output help documentation of app
displayHelp = ->

  filepath = undefined
  doc = undefined
  filepath = path.join(__dirname, '..', 'txt', 'help.txt')
  doc = fs.readFileSync(filepath, 'utf8')
  console.log '\n' + doc + '\n'

module.exports = (argv) ->

  # args passed
  return iconr(argv._) if argv._.length > 0

  # --version
  return displayVersion() if argv.version or argv.V

  # --help
  return displayHelp() if argv.help or argv.h

  # no command displays help
  displayHelp() unless argv._.length