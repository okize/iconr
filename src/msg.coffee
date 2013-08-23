# modules
path = require 'path'
colors = require 'colors'
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
    console.log messages[type][key][colorMap[type]], data

  # logs message to the console
  # to be used when not in control of message language
  data: (type, msg, data) ->
    if typeof data is 'undefined'
      data = ''
    if type is 'error'
      console.error msg[colorMap[type]], data
    else
      console.log msg[colorMap[type]], data

  # logs a summary message of application operation totals
  summary: (log) ->
    totalTime = (log.appEnd - log.appStart) / 1000000
    console.log '\n'
    console.log ' ' + ' SUMMARY: '.yellow.inverse
    console.log ' - converted '.yellow + log.svgCount + ' SVG images totaling '.yellow + log.svgSize + ' bytes'.yellow
    console.log ' - into a CSS file that is '.yellow + log.cssSize + ' bytes'.yellow
    console.log ' - it took '.yellow + totalTime + ' seconds'.yellow
    console.log ' - an average of '.yellow + (totalTime / log.svgCount) + ' seconds per icon'.yellow
    console.log '\n'

  # dumps a json object to console
  dump: (json) ->
    console.log JSON.stringify json, null, ' '