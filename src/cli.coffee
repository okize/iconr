# modules
path = require 'path'
fs = require 'fs'
pkg = require '../package.json'
updateNotifier = require 'update-notifier'
iconr = require './app'

# output version number of app
displayVersion = ->
  console.log pkg.version

# output help documentation of app
displayHelp = ->
  helpFile = path.join(__dirname, '..', 'lang', 'help.txt')
  helpText = fs.readFileSync helpFile, 'utf8'
  console.log '\n' + helpText + '\n'

# checks for available update
# https://github.com/yeoman/update-notifier
checkForUpdates = ->
  notifier = updateNotifier(
    packageName: pkg.name
    packageVersion: pkg.version
    # updateCheckInterval: 1000 * 60 * 60 * 24 # 1 day
  )

  if notifier.update?
    console.log "Update available: #{notifier.update.latest} \n"

module.exports = (argv) ->

  checkForUpdates()

  # flags we care about for app operation
  flags =
    verbose: if argv.verbose or argv.v then true else false
    analytics: if argv.analytics or argv.a then true else false
    pretty: if argv.pretty or argv.p then true else false
    base64: if argv.base64 or argv.b then true else false
    nopng: if argv.nopng or argv.n then true else false
    nopngdata: if argv.nopngdata or argv.N then true else false
    stdout: if argv.stdout or argv.S then true else false
    optimizesvg: if argv.optimizesvg or argv.o then true else false
    killcomment: if argv.killcomment or argv.k then true else false
    debug: if argv.debug or argv.d then true else false
    separatecss: if argv.separatecss or argv.s then true else false
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