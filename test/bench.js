
var Benchmark = require('benchmark')
var suite = new Benchmark.Suite

var winston = require('winston')
winston.add(winston.transports.File, { filename: 'logs.log' });

var loqui = require('../index').createClient()
var loquiQ = require('../index').createClient({ queueSize: 2 })
var log = []

// add tests
suite.add('Winston', function() {
  winston.log('info', 'Hello distributed log files!')
})
.add('Loqui', function() {
  loqui.log('info', 'Hello distributed log files!')
})
.add('Loqui-QueueSize-50%', function() {
  loquiQ.log('info', 'Hello distributed log files!')
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