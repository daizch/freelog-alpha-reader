var server = require('@freelog/freelog-dev-server')
var opn = require('opn')
var config = require('../config')
var port = process.env.PORT || config.dev.port
var autoOpenBrowser = !!config.dev.autoOpenBrowser

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

server.ready.then(function () {
  var uri = config.dev.uri || ('http://local.testfreelog.com' + (port.http !== 80 ? `:${port.http}` : ''))
  console.log('> Listening at ' + uri + '\n')

  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
})
