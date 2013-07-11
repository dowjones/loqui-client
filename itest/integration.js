
var assert = require('assert')
var path = require('path')
var fs = require('fs')
var level = require('level')
var spawn = require('child_process').spawn
var leveldown = require('leveldown')
var loqui = require('../index')
var net = require('net')

function spawnServer(args) {
  var p = path.join(__dirname, '..', 'node_modules', 'loqui-server', 'server')
  var cp = spawn(p, args && args.split(' ') || [])

  cp.stdout.on('data', function(d) {
    console.log(d.toString())
  })

  cp.stderr.on('data', function(d) {
    console.log(d.toString())
  })

  return cp
}

var levelopts = {
  valueEncoding: 'json',
  keyEncoding: 'json',
  encoding: 'json'
}

var logfile = path.join(process.cwd(), 'log.json')
var location = __dirname + '/fixtures/db'

describe('A client', function() {

  it(
    'should be able to reconnect to a server that is not yet running',
    function(done) {

      var client = loqui.createClient({ reconnectTime: 16, connectTimeout: 16 })
      var donetest = false

      client.log('testvalue')

      setTimeout(function() {

        var server = spawnServer('--location ' + location)

        setTimeout(function() {

          if (client.connected) {
            server.kill('SIGINT')
            done()
          }

        }, 512)

      }, 1024)
    }
  )

  it(
    'should log locally even when connected to a server',
    function(done) {

      var client = loqui.createClient({ local: true, reconnectTime: 16, connectTimeout: 16 })
      var donetest = false
      var l = console.log

      console.log = function() {
        donetest = true
        l.apply(console, arguments)
      }

      client.log('testvalue')

      setTimeout(function() {

        var server = spawnServer('--location ' + location)

        setTimeout(function() {

          if (client.connected && donetest) {
            server.kill('SIGINT')
            done()
          }

        }, 512)

      }, 1024)
    }
  )

  it(
    'should be able to connect to an alternate server given a list of servers',
    function(done) {

      var testvalue = 'testvalue'
      var serverspath = path.join(__dirname, 'fixtures', 'servers.json')
      var servers = JSON.parse(fs.readFileSync(serverspath).toString())

      var options = {
        servers: servers,
        reconnectTime: 16,
        connectTimeout: 16
      }

      var client = loqui.createClient(options)
      var server = spawnServer('--location ' + location)

      setTimeout(function() {

        if (client.connected) {
          server.kill('SIGINT')
          done()
        }

      }, 512)
    }
  )

  it(
    'should be able to receive data',
    function(done) {

      var options = {
        reconnectTime: 16,
        connectTimeout: 16
      }

      var client = loqui.createClient(options)
      var server = spawnServer('--location ' + location)

      client({ id: 'testclient' })
      client.log('testkey', 'testvalue')

      setTimeout(function() {  

        server.kill('SIGINT')

        setTimeout(function() {

          level(location, levelopts, function(err, db) {

            if (err) {
              assert.ok(false, err)
            }

            db.get('testclient!testkey', function(err, val) {
              if (err) {
                assert.ok(false, err)
              }
              else {
                db.close()
                leveldown.destroy(location, function(err) {
                  if (err) {
                    assert.ok(false, err)
                  }
                  done()
                })
              }
            })
          })
        }, 512)
      }, 1024)

    }
  )

  it(
    'should be able to extend the value associated with a custom key (simple)',
    function(done) {

      var options = {
        reconnectTime: 16,
        connectTimeout: 16
      }

      var client = loqui.createClient(options)
      var server = spawnServer('--location ' + location)

      client({ id: 'testclient' })
      client.extend('testkey', { a: 1 })

      setTimeout(function() {
        client.extend('testkey', { b: 2 })

        setTimeout(function() {

          server.kill('SIGINT')

          setTimeout(function() {

            level(location, levelopts, function(err, db) {

              if (err) {
                assert.ok(false, err)
              }

              db.get('testclient!testkey', function(err, record) {
                if (err) {
                  assert.ok(false, err)
                }
                else {

                  assert.equal(record.value.a, 1, 'correct value')
                  assert.equal(record.value.b, 2, 'correct value')

                  db.close()
                  leveldown.destroy(location, function(err) {
                    if (err) {
                      assert.ok(false, err)
                    }
                    done()
                  })
                }
              })
            })

          }, 512)
        }, 512)
      }, 512)
    }
  )

  it(
    'should be able to extend the value associated with a custom key (complex)',
    function(done) {

      var options = {
        reconnectTime: 16,
        connectTimeout: 16
      }

      var client = loqui.createClient(options)
      var server = spawnServer('--location ' + location)

      client({ id: 'testclient' })
      client.log('testkey', { a: 1, b: [{ c: 3, d: { test: 'A' } }]})

      setTimeout(function() {
        client.extend('testkey', { a: 1, b: [{ c: { test: 'B' } }]})

        setTimeout(function() {

          server.kill('SIGINT')

          setTimeout(function() {

            level(location, levelopts, function(err, db) {

              if (err) {
                assert.ok(false, err)
              }

              db.get('testclient!testkey', function(err, record) {
                if (err) {
                  assert.ok(false, err)
                }
                else {

                  assert.equal(record.value.a, 1, 'correct value')
                  assert.equal(record.value.b[0].c.test, 'B', 'correct value')

                  db.close()
                  leveldown.destroy(location, function(err) {
                    if (err) {
                      assert.ok(false, err)
                    }
                    done()
                  })
                }
              })
            })

          }, 512)
        }, 512)
      }, 512)
    }
  )


  it(
    'should be able to increment a custom key',
    function(done) {

      var options = {
        reconnectTime: 16,
        connectTimeout: 16
      }

      var client = loqui.createClient(options)
      var server = spawnServer('--location ' + location)

      client({ id: 'testclient' })
      client.counter('testkey', { counter: 1 })

      setTimeout(function() {
        client.counter('testkey', { counter: 1 })

        setTimeout(function() {

          server.kill('SIGINT')

          setTimeout(function() {

            level(location, levelopts, function(err, db) {

              if (err) {
                assert.ok(false, err)
              }

              db.get('testclient!testkey', function(err, record) {
                if (err) {
                  assert.ok(false, err)
                }
                else {

                  assert.equal(record.value.counter, 2, 'correct value')

                  db.close()
                  leveldown.destroy(location, function(err) {
                    if (err) {
                      assert.ok(false, err)
                    }
                    done()
                  })
                }
              })
            })

          }, 512)
        }, 512)
      }, 512)
    }
  )

  it(
    'should be able to decrement a custom key',
    function(done) {

      var options = {
        reconnectTime: 16,
        connectTimeout: 16
      }

      var client = loqui.createClient(options)
      var server = spawnServer('--location ' + location)

      client({ id: 'testclient' })
      client.counter('testkey', { counter: 1 })

      setTimeout(function() {
        client.counter('testkey', { counter: -1 })

        setTimeout(function() {

          server.kill('SIGINT')

          setTimeout(function() {

            level(location, levelopts, function(err, db) {

              if (err) {
                assert.ok(false, err)
              }

              db.get('testclient!testkey', function(err, record) {
                if (err) {
                  assert.ok(false, err)
                }
                else {

                  assert.equal(record.value.counter, 0, 'correct value')

                  db.close()
                  leveldown.destroy(location, function(err) {
                    if (err) {
                      assert.ok(false, err)
                    }
                    done()
                  })
                }
              })
            })
          }, 512)
        }, 512)
      }, 512)
    }
  )

  it(
    'should report the number of logs sent is the same as the number received',
    function(done) {

      var count = 0
      var total = 1000

      var options = {
        reconnectTime: 16,
        connectTimeout: 16
      }

      var client = loqui.createClient(options)
      var server = spawnServer('--location ' + location)

      for(var i = 0; i < total; i++) {
        client.log('testkey' + i, 'testvalue' + i)
      }

      setTimeout(function() {

        server.kill('SIGINT')

        setTimeout(function() {

          level(location, levelopts, function(err, db) {
            db.createReadStream({ keys: false, values: false })
            .on('data', function(d) {
              count++
            })
            .on('end', function() {

              assert.equal(total, count, 'expected number of records')

              db.close()
              leveldown.destroy(location, function(err) {
                if (err) {
                  assert.ok(false, err)
                }
                done()
              })
            })
          })

        }, 512)
      }, 1024)
    }
  )
})
