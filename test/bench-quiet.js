
var Benchmark = require('benchmark')
Benchmark.options.minSamples = 40
var suite = new Benchmark.Suite()
var fs = require('fs')

var winston = require('winston')
winston.add(winston.transports.File, { filename: 'log.log' });
winston.remove(winston.transports.Console);

var loqui = require('../index').createClient()
var loquiQueued = require('../index').createClient({ queueSize: 100 })
var log = []
var i1 = 0, i2 = 0, i3 = 0

var data = ["Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod",
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
"proident, sunt in culpa qui officia deserunt mollit anim id est laborum."].join('')

// add tests
suite
.add('Loqui', function() {
  loqui.log('info' + i1++, data)
})
.add('Winston', function() {
  winston.log('info', data + i2++)
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
  fs.unlink('./log.log')
  fs.unlink('./log.json')
})
// run async
.run({ 'async': true })
