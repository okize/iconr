# modules
path = require 'path'
fs = require 'fs'
iconr = require path.join(__dirname, '..', 'lib', 'app')

# output version number of app
displayVersion = ->

  pkg = require path.join(__dirname, '..', 'package.json')
  console.log pkg.version

# output help documentation of app
displayHelp = ->

  filepath = path.join(__dirname, '..', 'lang', 'help.txt')
  doc = fs.readFileSync filepath, 'utf8'
  console.log '\n' + doc + '\n'

module.exports = (argv) ->

  # flags we care about for app operation
  flags =
    verbose: if argv.verbose or argv.v then true else false
    summary: if argv.summary or argv.s then true else false
    pretty: if argv.pretty or argv.p then true else false
    debug: if argv.debug or argv.d then true else false

  # args passed
  return iconr(argv._, flags) if argv._.length > 0

  # --version
  return displayVersion() if argv.version or argv.V

  # --help
  return displayHelp() if argv.help or argv.h

  # no command displays help
  displayHelp() unless argv._.length