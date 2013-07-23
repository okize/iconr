# modules
path = require('path')
colors = require('colors')
messages = require( path.resolve(__dirname, '..', 'lang', 'messages.json') )

# configuration for command line colorization
colorMap =
  error: 'red'
  warn: 'yellow'
  info: 'blue'
  ask: 'green'
  list: 'white'

# returns a string of the requested message
exports.str = (type, key, data) ->
  messages[type][key]

# logs requested message to the console
exports.msg = (type, key, data) ->
  if typeof data is 'undefined'
    data = ''
  console.log messages[type][key][colorMap[type]], data

# logs message to the console
# to be used when not in control of message language
exports.data = (type, msg, data) ->
  if typeof data is 'undefined'
    data = ''
  if type is 'error'
    console.error msg[colorMap[type]], data
  else
    console.error msg[colorMap[type]], data