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
    analytics: if argv.analytics or argv.a then true else false
    pretty: if argv.pretty or argv.p then true else false
    base64: if argv.base64 or argv.b then true else false
    nopng: if argv.nopng or argv.n then true else false
    stdout: if argv.stdout or argv.s then true else false
    optimizesvg: if argv.optimizesvg or argv.o then true else false
    killcomment: if argv.killcomment or argv.k then true else false
    debug: if argv.debug or argv.d then true else false
    filename: if argv.filename or argv.f then argv.filename or argv.f else null
    classname: if argv.classname or argv.c then argv.classname or argv.c else ''

  # args passed
  return iconr(argv._, flags) if argv._.length > 0

  # --version
  return displayVersion() if argv.version or argv.V

  # --help
  return displayHelp() if argv.help or argv.h

  # no args so display help
  displayHelp() unless argv._.length