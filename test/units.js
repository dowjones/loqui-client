var assert = require('assert')
var loqui = require('../index')
var fs = require('fs')
var es = require('event-stream')
var deepmerge = require('deepmerge')
var path = require('path')

var logfile = path.join(process.cwd(), 'log.json')
var defaultArgs = { local: true, logfile: logfile }

describe('A client', function() {

  it(
    'should print to the console when logging locally',
    function(done) {

      var l = console.log
      var donetest = false

      console.log = function() {
        if (!donetest) {
          donetest = true
          fs.unlink(logfile)
          done()
        } 
        l.apply(console, arguments)
      }

      var client = loqui.createClient(defaultArgs)
      client.log('test')

    }
  )

  it(
    'should create or append to a log file in the directory from which it is run',
    function(done) {

      var client = loqui.createClient(defaultArgs)
      client.log('test')

      setTimeout(function() {
        if (String(fs.readFileSync(logfile)).length) {
          fs.unlink(logfile)
          done()
        }
        else {
          assert.fail('the file could not be read')
        }
      }, 1024)

    }
  )

  it(
    'should prefix logs with an id if the logger instance is provided one',
    function(done) {

      var client = loqui.createClient(defaultArgs)

      client({ id: 'prefix' })
      client.log('testkey', 'testvalue')

      setTimeout(function() {
        
        fs.createReadStream(logfile)
          .pipe(es.split())
          .pipe(es.parse())
          .on('data', function(data) {

            data = data[0]

            if (data.key.indexOf('prefix') === -1) {
              assert.fail('the key does not contain the prefix')
            }

          })
          .on('end', function() {
            fs.unlink(logfile)
            done()
          })
      }, 1024)
    }
  )

  it(
    'should generate a unique key when one is not provided by the user', 
    function(done) {

      var client = loqui.createClient(defaultArgs)
      var count = 0

      client.log('Felix has %d pet %s', 20, 'squirrels')

      setTimeout(function() {

        var data = JSON.parse(fs.readFileSync(logfile))[0]

        if (data.key.length === 36) {
          fs.unlink(logfile)
          assert.ok('a unique key was generated')
          done()
        }
        else {
          assert.fail('a unique key was not generated')
        }
      }, 1024)
    }
  )

  it(
    'should match console.log() token replacement functionality', 
    function(done) {

      var client = loqui.createClient(defaultArgs)
      var count = 0

      client.log('Felix has %d pet %s', 20, 'squirrels')

      setTimeout(function() {

        var data = JSON.parse(fs.readFileSync(logfile))[0]

        if (data.value.value === 'Felix has 20 pet squirrels') {
          fs.unlink(logfile)
          assert.ok('the value did not contain tokens')
          done()
        }
        else {
          assert.fail('tokens were found in the string')
        }
      }, 1024)
    }
  )

  it(
    'should match console.log() token replacement functionality when there is a custom key', 
    function(done) {

      var client = loqui.createClient(defaultArgs)
      var count = 0

      client.log('testkey', 'Felix has %d pet %s', 20, 'squirrels')

      setTimeout(function() {

        var data = JSON.parse(fs.readFileSync(logfile))[0]

        if (data.value.value === 'Felix has 20 pet squirrels') {
          fs.unlink(logfile)
          assert.ok('the value did not contain tokens')
          done()
        }
        else {
          assert.fail('tokens were found in the string')
        }
      }, 1024)
    }
  )

  it(
    'should match console.error() token replacement functionality', 
    function(done) {

      var client = loqui.createClient(defaultArgs)
      var count = 0

      client.error('Isaac has %d pet %s', 2, 'cats')

      setTimeout(function() {

        var data = JSON.parse(fs.readFileSync(logfile))[0]

        if (data.value.value === 'Isaac has 2 pet cats') {
          fs.unlink(logfile)
          assert.ok('the value did not contain tokens')
          done()
        }
        else {
          assert.fail('tokens were found in the string')
        }
      }, 1024)
    }
  )

  it(
    'should match console.log() token replacement functionality when there is a custom key', 
    function(done) {

      var client = loqui.createClient(defaultArgs)
      var count = 0

      client.log('bird', 'Has a twitter %s', 'account')

      setTimeout(function() {

        var data = JSON.parse(fs.readFileSync(logfile))[0]

        if (data.key === 'bird') {
          fs.unlink(logfile)
          assert.ok('the key is expected')
          done()
        }
        else {
          assert.fail('the key was not expected')
        }
      }, 1024)
    }
  )

  it(
    'should log a value that contains a method, origin and user value', 
    function(done) {

      var client = loqui.createClient(defaultArgs)
      var count = 0

      client.log('bird', 'Has a twitter %s', 'account')

      setTimeout(function() {

        var data = JSON.parse(fs.readFileSync(logfile))[0].value

        if (data.method && data.origin && data.value) {
          fs.unlink(logfile)
          assert.ok('the key is expected')
          done()
        }
        else {
          assert.fail('the key was not expected')
        }
      }, 1024)
    }
  )

  it(
    'should throttle logs when the throttle and window options are provided',
    function(done) {

      var opts = { rate: 2, window: 32, logfile: logfile }
      var client = loqui.createClient(opts)
      var n = 128
      var logs = 0
      var count = 0

      var interval = setInterval(function() {
        client.log('n-' + (++logs), logs)
        if (n === 0) {
          clearInterval(interval)
        }
      }, 64)

      setTimeout(function() {

        fs.createReadStream(logfile)
          .pipe(es.split())
          .pipe(es.parse())
          .on('data', function() {
            ++count
          })
          .on('end', function() {
            assert.ok(count < 16, 'expected quantity')
            fs.unlink(logfile)
            done()
          })

      }, 1024)
    }
  )

  it(
    'should perform a number of operations proportional to the queue size',
    function(done) {

      var opts = { queueSize: 10, logfile: logfile }
      var client = loqui.createClient(opts)
      var n = 100
      var count = 0

      while(--n > -1) {
        client.log('n-' + n, n)
      }

      setTimeout(function() {

        fs.createReadStream(logfile)
          .pipe(es.split())
          .pipe(es.parse())
          .on('data', function() {
            ++count
          })
          .on('end', function() {
            assert.equal(count, 10, 'expected quantity')
            fs.unlink(logfile)
            done()
          })

      }, 1024)
    }
  )
})
