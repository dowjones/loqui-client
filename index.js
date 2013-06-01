var ip = require('ip')
var fs = require('fs')
var deepmerge = require('deepmerge')
var restream = require('restream')
var multilevel = require('multilevel')

var uuid = require('node-uuid')
var format = require('./format')

var origin = {
  host: ip.address(),
  pid: process.pid
}

exports.createClient = function(opts) {

  opts = opts || {}

  opts.queueSize = opts.queueSize

  var rate = opts.rate
  var window = opts.window
  var quota = rate
  var throttling = typeof rate !== 'undefined' && typeof window !== 'undefined'
  var timeStampMS = Date.now()

  var writecount = 0
  var failed = false
  var local = opts.local
  var logfile = opts.logfile
  var logfilestream

  var batch = []
  var batchIndexes = {}
  var db

  function useFileStream() {

    var stream = fs.createWriteStream(logfile, { flags: 'a' })

    db = {}

    db.batch = function(batch) {

      var temp = []

      for (var i = 0; i < batch.length; i++) {
        temp[i] = batch[i]
      }

      batch.length = 0

      stream.write(JSON.stringify(temp) + '\n', function(err) {
        if (err) { console.log(err) }
        temp.length = 0
      })
    }

    db.put = function(key, value, callback) {
      var s = JSON.stringify({ key: key, value: value })
      stream.write(s + '\n', function(err) {
        callback(err)
      })
    }
  }

  if (logfile) {
    useFileStream()
  }
  else {

    restream.connect(opts)
      .on('connect', function(connection) {
        if (client.connected) return

        client.connected = true
        db = multilevel.client()
        db.pipe(connection).pipe(db)

        //console.log(batch)

        var temp = new Array(batch.length)
        for (var i = 0; i < batch.length; i++) {
          temp[i] = batch[i]
        }

        batch.length = 0

        //console.log('SENDING INITIAL BATCH')

        db.batch(temp, function(err) {
          if (err) {
            return console.log(err)
          }
          temp.length = 0
        })
      })
      .on('fail', function() {
        useFileStream()
        db.batch(batch)
      })
  }

  function queue(obj, method) {

    if (throttling) {

      var current = Date.now()
      var delta = current - timeStampMS

      timeStampMS = current
      quota += delta * (rate / window)

      if (quota > rate) {
        quota = rate
      }
      if (quota < 1) {
        return
      }
      else {
        quota -= 1
      }
    }

    var write = false
    var key = client.id + '!' + obj.key

    var op = {
      type: 'put',
      key: key,
      value: {
        value: obj.value,
        method: method,
        origin: origin,
        timestamp: Date.now()
      } 
    }

    if (local) {
      console.log(op)
    }

    if (!opts.queueSize && (client.connected || logfile)) {
      //console.log('PUTTING')
      return db.put(op.key, op.value, function(err) {
        if (err) {
          console.log(err)
        }
      })
    }
    else if (!opts.queueSize) {
      //console.log('BATCHING')
      return batch.push(op)
    }

    if (method === 'error') {
      batch.push(op)
      write = true
    }
    else if (method === 'counter') {

      var n = obj.value.counter

      if (batchIndexes[key] && obj.value.method === 'counter') {
        batch[batchIndexes[key]].value.counter += n
      }
      else {
        batchIndexes[key] = batch.length
      }

      batch.push(op)
    }
    else {
      batch.push(op)
    }

    if (batch.length === opts.queueSize) {
      write = true
    }

    if (write && (client.connected || logfile)) {

      var temp = new Array(batch.length)
      for (var i = 0; i < batch.length; i++) {
        temp[i] = batch[i]
      }

      batch.length = 0

      db.batch(temp, function(err) {
        if (err) {
          return console.log(err)
        }
        temp.length = 0
      })
    }
  }

  //
  // expose an api for the user to log with
  //

  var client = function(opts) {
    if (opts.id) { client.id = opts.id }
  }

  client.id = opts.id || uuid.v4()
  client.connected = false

  client.log = client.info = client.warn = function() {
    queue(format.apply(null, arguments), 'log')
  }

  client.error = function() {
    queue(format.apply(null, arguments), 'error')
  }

  client.counter = function() {
    queue(format.apply(null, arguments), 'counter')
  }

  client.extend = function() {
    queue(format.apply(null, arguments), 'extend')
  }

  return client
}
