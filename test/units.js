var assert = require('assert')
var loqui = require('../index')
var fs = require('fs')
var es = require('event-stream')


describe('A client', function() {

  it(
    'should print to the console when logging locally',
    function(done) {

      var l = console.log
      var donetest = false

      console.log = function() {
        if (!donetest) {
          donetest = true
          fs.unlink('./logs.json')
          done()
        } 
        l.apply(console, arguments)
      }

      var client = loqui.createClient({ local: true })
      client.log('test')

    }
  )

  it(
    'should create or append to a log file in the directory from which it is run',
    function(done) {

      var client = loqui.createClient({ local: true })
      client.log('test')

      setTimeout(function() {
        if (String(fs.readFileSync('./logs.json')).length) {
          fs.unlink('./logs.json')
          done()
        }
        else {
          assert.fail('the file could not be read')
        }
      }, 1024);

    }
  )

  it(
    'should prefix logs with an id if the logger instance is provided one',
    function(done) {

      var client = loqui.createClient({ local: true })

      client({ id: 'prefix' })
      client.log('testkey', 'testvalue')

      setTimeout(function() {
        
        fs.createReadStream('./logs.json')
          .pipe(es.split())
          .pipe(es.parse())
          .on('data', function(data) {

            data = data[0]

            if (data.key.indexOf('prefix') === -1) {
              assert.fail('the key does not contain the prefix')
            }

          })
          .on('end', function() {
            fs.unlink('./logs.json')
            done()
          })
      }, 1024);
    }
  )

  it(
    'should generate a unique key when one is not provided by the user', 
    function(done) {

      var client = loqui.createClient({ local: true })
      var count = 0

      client.log('Felix has %d pet %s', 20, 'squirrels')

      setTimeout(function() {

        var data = JSON.parse(fs.readFileSync('./logs.json'))[0]

        if (data.key.length === 36) {
          fs.unlink('./logs.json')
          assert.ok('a unique key was generated')
          done()
        }
        else {
          assert.fail('a unique key was not generated')
        }
      }, 1024);
    }
  )

  it(
    'should match console.log() token replacement functionality', 
    function(done) {

      var client = loqui.createClient({ local: true })
      var count = 0

      client.log('Felix has %d pet %s', 20, 'squirrels')

      setTimeout(function() {

        var data = JSON.parse(fs.readFileSync('./logs.json'))[0]

        if (data.value.value === 'Felix has 20 pet squirrels') {
          fs.unlink('./logs.json')
          assert.ok('the value did not contain tokens')
          done()
        }
        else {
          assert.fail('tokens were found in the string')
        }
      }, 1024);
    }
  )

  it(
    'should match console.log() token replacement functionality when there is a custom key', 
    function(done) {

      var client = loqui.createClient({ local: true })
      var count = 0

      client.log('testkey', 'Felix has %d pet %s', 20, 'squirrels')

      setTimeout(function() {

        var data = JSON.parse(fs.readFileSync('./logs.json'))[0]

        if (data.value.value === 'Felix has 20 pet squirrels') {
          fs.unlink('./logs.json')
          assert.ok('the value did not contain tokens')
          done()
        }
        else {
          assert.fail('tokens were found in the string')
        }
      }, 1024);
    }
  )

  it(
    'should match console.error() token replacement functionality', 
    function(done) {

      var client = loqui.createClient({ local: true })
      var count = 0

      client.error('Isaac has %d pet %s', 2, 'cats')

      setTimeout(function() {

        var data = JSON.parse(fs.readFileSync('./logs.json'))[0]

        if (data.value.value === 'Isaac has 2 pet cats') {
          fs.unlink('./logs.json')
          assert.ok('the value did not contain tokens')
          done()
        }
        else {
          assert.fail('tokens were found in the string')
        }
      }, 1024);
    }
  )

  it(
    'should match console.log() token replacement functionality when there is a custom key', 
    function(done) {

      var client = loqui.createClient({ local: true })
      var count = 0

      client.log('bird', 'Has a twitter %s', 'account')

      setTimeout(function() {

        var data = JSON.parse(fs.readFileSync('./logs.json'))[0]

        if (data.key === 'bird') {
          fs.unlink('./logs.json')
          assert.ok('the key is expected')
          done()
        }
        else {
          assert.fail('the key was not expected')
        }
      }, 1024);
    }
  )

  it(
    'should log a value that contains a method, origin and user value', 
    function(done) {

      var client = loqui.createClient({ local: true })
      var count = 0

      client.log('bird', 'Has a twitter %s', 'account')

      setTimeout(function() {

        var data = JSON.parse(fs.readFileSync('./logs.json'))[0].value

        if (data.method && data.origin && data.value) {
          fs.unlink('./logs.json')
          assert.ok('the key is expected')
          done()
        }
        else {
          assert.fail('the key was not expected')
        }
      }, 1024);
    }
  )

})
