var path = require('path')
var ip = require('ip')
var fs = require('fs')
var deepmerge = require('deepmerge')
var restream = require('restream')
var multilevel = require('multilevel')
var argv = require('optimist').argv

var uuid = require('node-uuid')
var format = require('./format')

var origin = {
  host: ip.address(),
  pid: process.pid
}

exports.createClient = function(opts) {

  opts = opts || {}

  var writecount = 0
  var failed = false
  var db

  var local = opts.local || argv.local
  var logfile = argv.logfile || opts.logfile

  if (logfile) {
    logfile = fs.createWriteStream(logfile, { flags: 'a' })
  }

  opts.queueSize = opts.queueSize || 1

  var rate = opts.rate
  var window = opts.window
  var quota = rate
  var timeStampMS = Date.now()

  var batch = []
  var batchIndexes = {}

  restream.connect(argv)
    .on('connect', function(connection) {
      client.connected = true
      db = multilevel.client()
      db.pipe(connection).pipe(db)
    })
    .on('fail', function() {
      failed = true
    })

  function writeBatch() {

    var temp = []
    temp = deepmerge(batch, temp)

    if (local) {
      temp.forEach(function(log) {
        console.log(log)
      })
    }
    
    if (client.connected) {
      batch.length = 0
      db.batch(temp, function(err) {
        if (err) {
          console.log(err)
        }
      })
    }
    else if (failed || logfile) {
      logfile.write(JSON.stringify(temp) + '\n')
      batch.length = 0
    }
  }

  function queue(obj) {

    //
    // prepare the data to be sent
    //
    var key = client.id ? [client.id, obj.key].join('!') : obj.key
    
    var value = {
      value: obj.value,
      method: obj.method,
      origin: origin,
      timestamp: Date.now()
    }

    var record = { type: 'put', key: key, value: value }

    if(obj.method === 'log' || obj.method === 'extend') {
      batch.push(record)
    }
    else if (obj.method === 'error') {
      batch.push(record)
      writeBatch()
      return
    }
    else if (obj.method === 'counter') {

      var n = obj.value.counter

      if (batchIndexes[obj.key] && obj.value.method === 'counter') {
        batch[batchIndexes[obj.key]].value.counter += n
      }
      else {
        batchIndexes[obj.key] = batch.length
      }

      batch.push(record)
    }

    if (typeof rate !== 'undefined' && typeof window !== 'undefined') {

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

    if (batch.length === opts.queueSize) {
      writeBatch()
    }
  }

  //
  // expose an api for the user to log with
  //

  var client = function(opts) {
    client.id = opts.id || uuid.v4()
  }

  client.connected = false

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
