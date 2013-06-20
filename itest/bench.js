
var Benchmark = require('benchmark')
var util = require('util')
var multilevel = require('multilevel')
var suite = new Benchmark.Suite()
var fs = require('fs')
var net = require('net')
var format = require('../format')
var ip = require('ip')

var winston = require('winston')
winston.remove(winston.transports.Console)

var CustomLogger = winston.transports.CustomerLogger = function (options) {
  this.name = 'customLogger'
  this.level = options.level || 'info'
}

var origin = {
  host: ip.address(),
  pid: process.pid
}

util.inherits(CustomLogger, winston.Transport)

var db = multilevel.client()
db.pipe(net.connect(9099)).pipe(db)

var batch = []

function put(obj) {

  var key = client.id + '!' + obj.key
  var op = {
    type: 'put',
    key: key,
    value: {
      value: obj.value,
      method: 'log',
      origin: origin,
      timestamp: Date.now()
    } 
  }

  db.put(op.key, op.value, function(err) {
    if (err) {
      console.log(err)
    }
  })
}

CustomLogger.prototype.log = function () {

  //
  // Notes: to make this comparison realistic, we add a few requirements
  // similar to those of found in loqui, for example string formatting,
  // meta data and a batch function to prep and send the data.
  //
  put(format.apply(null, arguments))
}


var loqui = require('../index').createClient()
var loquiQueued = require('../index').createClient({ queueSize: 100 })
var log = []
var i1 = 0, i2 = 0, i3 = 0

var data = [
  "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod",
  "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,",
  "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo",
  "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse",
  "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non",
  "proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod",
  "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,",
  "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo",
  "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse",
  "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non",
  "proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
].join('')

// add tests
suite
.add('Loqui', function() {
  loqui.log('info' + i1++, data)
})
.add('Winston', function() {
  winston.log('info' + i2++, data)
})
.add('Loqui-Queued', function() {
  loquiQueued.log('info' + i3++, data)
})

// add listeners
.on('cycle', function(event) {
  log.push(String(event.target))
})
.on('complete', function() {
  console.log(log)
  console.log('Fastest is ' + this.filter('fastest').pluck('name'))
})
// run async
.run({ 'async': true })
