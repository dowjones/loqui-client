var path = require('path')
var ip = require('ip')
var fs = require('fs')
var deepmerge = require('deepmerge')
var argv = require('optimist').argv

var uuid = require('node-uuid')
var format = require('./format')

var origin = {
  host: ip.address(),
  pid: process.pid
}

exports.createClient = function(opts) {

  opts = opts || {}

  var location = opts.logfile || path.join(process.cwd(), 'logs.json')
  var logfile = fs.createWriteStream(location, { flags: 'a' })

  opts.queueSize = opts.queueSize || 1

  var hrtime = process.hrtime()
  var tLastMS = hrtime[0] * 1e3 + hrtime[1] / 1e6
  var quota = opts.throttle
  var window = opts.window
  var batch = []
  var batchIndexes = {}
  
  function writeBatch() {

    var temp = []
    temp = deepmerge(batch, temp)
    batch.length = 0

    if (argv.local) {
      temp.forEach(function(log) {
        console.log(log)
      })
    }

    logfile.write(JSON.stringify(temp) + '\n')
  }

  function queue(obj) {

    //
    // prepare the data to be sent
    //
    var key = client.id ? [client.id, obj.key].join('-') : obj.key
    var value = { value: obj.value, method: obj.method, origin: origin }
    var record = { type: 'put', key: key, value: value }

    switch (obj.method) {

      case 'log':
      case 'extend':
        batch.push(record)
      ;break

      case 'error':
        batch.push(record)
        writeBatch()
        return
      ;break

      case 'counter':

        if (!obj.value.counter && opts.onError) {
          var message = 'decr and incr must contain a counter member'
          var error = new Error(message)
          return opts.onError(error)
        }

        var n = obj.value.counter

        if (batchIndexes[obj.key] && obj.value.method === 'counter') {
          batch[batchIndexes[obj.key]].value.counter += n
        }
        else {
          batchIndexes[obj.key] = batch.length
        }

        batch.push(record)
      ;break
    }

    //
    // determine if we should send the data or not.
    //

    var hrtime = process.hrtime()
    var tNowMS = hrtime[0] * 1e3 + hrtime[1] / 1e6

    if (quota && window) {

      var tDeltaMS = tNowMS - tLastMS

      tLastMS = tNowMS

      quota += tDeltaMS * (opts.throttle / window)

      if (quota > opts.throttle) {
        quota = opts.throttle
      }

      if (quota < 1.0) {
        return
      } 
      else {
        quota -= 1.0
      }
    }

    if (batch.length <= opts.queueSize) {
      writeBatch()
    }
  }

  //
  // expose an api for the user to log with
  //

  var client = function(opts) {
    client.id = opts.id || uuid.v4()
  }

  client.log = client.info = client.warn = function() {
    var obj = format.apply(null, arguments)
    obj.method = 'log'
    queue(obj)
  }

  client.error = function() {
    var obj = format.apply(null, arguments)
    obj.method = 'error'
    queue(obj)
  }

  client.counter = function() {
    var obj = format.apply(null, arguments)
    obj.method = 'counter'
    queue(obj)
  }

  client.extend = function() {
    var obj = format.apply(null, arguments)
    obj.method = 'extend'
    queue(obj)
  }

  return client
}
