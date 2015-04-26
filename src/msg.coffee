# modules
path = require 'path'
chalk = require 'chalk'
messages = require path.resolve(__dirname, '..', 'lang', 'messages.json')

# configuration for command line colorization
colorMap =
  error: 'red'
  warn: 'yellow'
  info: 'blue'
  ask: 'green'
  list: 'white'

module.exports =

  # returns a string of the requested message
  str: (type, key, data) ->
    messages[type][key]

  # logs requested message to the console
  log: (type, key, data) ->
    if typeof data is 'undefined'
      data = ''
    console.log chalk[colorMap[type]](messages[type][key]), data

  # logs message to the console
  # to be used when not in control of message language
  data: (type, msg, data) ->
    if typeof data is 'undefined'
      data = ''
    if type is 'error'
      console.error chalk[colorMap[type]] msg, data
    else
      console.log chalk[colorMap[type]] msg, data

  # logs analytics of application operation totals
  analytics: (log) ->
    totalTime = (log.appEnd - log.appStart) / 1000000
    console.log '\n'
    console.log ' ' + chalk.magenta.inverse ' SUMMARY: '
    console.log chalk.magenta '', '☉', 'converted', chalk.white.bold(log.svgCount), 'SVG images totaling', chalk.white.bold(log.svgSize), 'bytes'
    console.log chalk.magenta '', '☉', 'into a CSS file that is', chalk.white.bold(log.cssSize), 'bytes'
    console.log chalk.magenta '', '☉', 'and it took', chalk.white.bold(totalTime), 'seconds'
    console.log chalk.magenta '', '☉', 'at an average of', chalk.white.bold(totalTime / log.svgCount), 'seconds per icon'
    console.log '\n'

  # dumps a json object to console
  dump: (json) ->
    console.log JSON.stringify json, null, ' '
