
// var assert = require('assert')
// var path = require('path')
// var fs = require('fs')
// var spawn = require('child_process').spawn

// var loqui = require('../index')

// function spawnClient(args) {
//   var p = path.join(__dirname, '..', 'bin', 'client')
//   return spawn(p, args && args.split(' ') || [])
// }

// function spawnServer(args) {
//   var p = path.join(__dirname, '..', 'node_modules', 'loqui-server', 'server')
//   return spawn(p, args && args.split(' ') || [])
// }

// describe('A client should observe log data', function() {

//   it(
//     'should be able to reconnect to a server that is not yet running',
//     function(done) {

//       var client = loqui.createClient()
//       var sc = spawnClient()
//       var ss

//       sc.stdout.on('data', function (data) {
//         if (data.toString() === 'OK\n') {
//           setTimeout(function() {
//             ss.kill('SIGINT')
//             done()            
//           }, 512)
//         }
//       })

//       setTimeout(function() {
//         ss = spawnServer()
//         client.log('testvalue1')
//       }, 1024)
//     }
//   )

  // it(
  //   'should log locally even when connected to a server',
  //   function(done) {

  //     var client = loqui.createClient({ local: true })
  //     var sc = spawnClient()
  //     var ss

  //     var l = console.log
  //     var donetest = false

  //     console.log = function() {
  //       if (!donetest) {
  //         setTimeout(function() {
  //           donetest = true
  //           fs.unlink('./logs.json')
  //           ss.kill('SIGHUP')
  //           done()
  //         }, 128)
  //       } 
  //       l.apply(console, arguments)
  //     }

  //     setTimeout(function() {
  //       ss = spawnServer()
  //       client.log('testvalue1')
  //     }, 128)
  //   }
  // )

  // it(
  //   'should be able to connect to an alternate server given a list of servers',
  //   function(done) {

  //     var testvalue = 'testvalue'

  //     var client = loqui.createClient()
  //     var ss = spawnServer('--servers .\/fixtures\/servers.json')
  //     var sc = spawnClient()

  //     ss.stderr.on('data', function(d) {
  //       console.log(d.toString())
  //     })

  //     ss.stdout.on('data', function (data) {
  //       if (data.toString() === 'OK\n') {
  //         ss.kill('SIGHUP')
  //         done()
  //       }
  //     })

  //     client.log(testvalue)
  //   }
  // )

//   it(
//     'should be able to communicate a log with a generated key',
//     function(done) {

//       var server = loquiServer.createServer()
//       var client = loquiClient.createClient({ reconnectTime: 128 })

//       var testvalue = 'testvalue'

//       server.on('log', function(log) {

//         assert.equal(
//           log.key.length, 36, 
//           'A unique key was created'
//         )

//         server.close()
//         done()
//       })

//       client.log(testvalue)
//     }
//   )

//   it(
//     'should be able to communicate a log with a custom key',
//     function(done) {

//       var server = loquiServer.createServer()
//       var client = loquiClient.createClient({ reconnectTime: 128 })

//       server.on('log', function(log) {

//         assert.equal(
//           log.key, 'custom1', 
//           'A unique key was created'
//         )

//         server.close()
//         done()
//       })

//       client.log('custom1', 1)
//     }
//   )

//   it(
//     'should be able to update a custom key',
//     function(done) {

//       var server = loquiServer.createServer()
//       var client = loquiClient.createClient({ reconnectTime: 128 })

//       server.on('log', function(log) {

//         assert.equal(log.key, 'custom1', 'A custom key was retrieved')
//         assert.equal(log.value.value, 2, 'the value was retrieved and is equal')
//         server.close()
//         done()
//       })

//       client.log('custom1', 2)
//     }
//   )

//   it(
//     'should be able to communicate a log with a object as a value',
//     function(done) {

//       var server = loquiServer.createServer()
//       var client = loquiClient.createClient({ reconnectTime: 128 })

//       server.on('log', function(log) {

//         assert.equal(
//           log.key, 'object1', 
//           'A unique key was created'
//         )

//         assert.equal(
//           typeof log.value, 'object',
//           'The value was an object'
//         )

//         server.close()
//         done()
//       })

//       client.log('object1', { counter: 1 })
//     }
//   )

//   it(
//     'should be able to extend a logs value',
//     function(done) {

//       var server = loquiServer.createServer()
//       var client = loquiClient.createClient({ reconnectTime: 128 })

//       server.on('log', function(log) {

//         assert.equal(log.value.value.counter, 1, 'Still has the original value')
//         assert.equal(log.value.value.extended, true, 'Has an additional member')
//         server.close()
//         done()
//       })

//       client.extend('object1', { extended: true })
//     }
//   )

//   it(
//     'should be able to increment a custom key',
//     function(done) {

//       var server = loquiServer.createServer()
//       var client = loquiClient.createClient({ reconnectTime: 128 })

//       server.on('log', function(log) {

//         assert.equal(log.key, 'object1', 'A custom key was retrieved')
//         assert.equal(log.value.value.counter, 2, 'the value was incremented')
//         server.close()
//         done()
//       })

//       client.counter('object1', { counter: 1 })
//     }
//   )

//   it(
//     'should be able to decrement a custom key',
//     function(done) {

//       var server = loquiServer.createServer()
//       var client = loquiClient.createClient({ reconnectTime: 128 })

//       server.on('log', function(log) {

//         assert.equal(log.key, 'object1', 'A custom key was retrieved')
//         assert.equal(log.value.value.counter, 1, 'the value was decremented')
//         server.close()
//         done()
//       })

//       client.counter('object1', { counter: -1 })
//     }
//   )

//   it(
//     'should agree that the number of logs sent was the number of logs received',
//     function(done) {

//       var server = loquiServer.createServer()
//       var client = loquiClient.createClient({ reconnectTime: 128 })

//       var inLogs = 0, outLogs = 10

//       server.on('log', function(log) {
//         ++inLogs

//         if (inLogs === 10) {
//           server.close()
//           done()
//         }
//       })

//       while(outLogs--) {
//         client.log('outLog' + outLogs, outLogs)
//       }
//     }
//   )


})
