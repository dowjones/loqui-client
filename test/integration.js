
var assert = require('assert')
var path = require('path')
var fs = require('fs')
var level = require('level')
var spawn = require('child_process').spawn
var leveldown = require('leveldown')
var loqui = require('../index')

function spawnServer(args) {
  var p = path.join(__dirname, '..', 'node_modules', 'loqui-server', 'server')
  return spawn(p, args && args.split(' ') || [])
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

      var client = loqui.createClient()
      var donetest = false

      client.log('testvalue')

      setTimeout(function() {

        var server = spawnServer()

        setTimeout(function() {

          if (client.connected) {
            server.kill('SIGINT')
            done()
          }

        }, 1024)

      }, 512)
    }
  )

  it(
    'should log locally even when connected to a server',
    function(done) {

      var client = loqui.createClient()
      var donetest = false

      client.log('testvalue')

      setTimeout(function() {

        var server = spawnServer()

        setTimeout(function() {

          if (client.connected) {
            server.kill('SIGINT')
            fs.unlink(logfile)
            done()
          }

        }, 1024)

      }, 512)
    }
  )

  // it(
  //   'should be able to connect to an alternate server given a list of servers',
  //   function(done) {

  //     var testvalue = 'testvalue'
  //     var testdone = false

  //     var client = loqui.createClient()
  //     var ss = spawnServer('--port 9099')
  //     var sc = spawnClient('--servers ./test/fixtures/servers.json --reconnectTime 10 --connectTimeout 10')

  //     sc.stdout.on('data', function (data) {
  //       if (data.toString() === 'OK\n' && !testdone) {
  //         testdone = true
  //         ss.kill('SIGINT')
  //         sc.kill('SIGINT')
  //         done()
  //       }
  //     })

  //     client.log(testvalue)
  //   }
  // )

 //  it(
 //    'should be able to receive data',
 //    function(done) {

 //      var testdone = false
 //      var client = loqui.createClient()
 //      var ss = spawnServer('--location ./test/fixtures/db')
 //      var sc = spawnClient('--reconnectTime 100')
 //      client.log('testkey', 'testvalue')

 //      setTimeout(function() {

 //        ss.kill('SIGINT')

 //        setTimeout(function() {

 //          if (!testdone) {
 //            testdone = true
 //            level(location, levelopts, function(err, db) {

 //              if (err) {
 //                assert.ok(false, err)
 //              }

 //              db.get('testkey', function(err, val) {
 //                if (err) {
 //                  assert.ok(false, err)
 //                }
 //                else {
 //                  db.close()
 //                  leveldown.destroy(location, function(err) {
 //                    if (err) {
 //                      assert.ok(false, err)
 //                    }
 //                    sc.kill('SIGINT')
 //                    done()
 //                  })
 //                }
 //              })
 //            })
 //          }
 //        }, 512)
 //      }, 1024)

 //    }
 //  )

 //  it(
 //    'should be able to extend the value associated with a custom key (simple)',
 //    function(done) {

 //      var testdone = false
 //      var client = loqui.createClient()
 //      var ss = spawnServer('--location ./test/fixtures/db')
 //      var sc = spawnClient('--reconnectTime 10')
 //      client.extend('testkey', { a: 1 })

 //      setTimeout(function() {
 //        client.extend('testkey', { b: 2 })

 //        setTimeout(function() {

 //          ss.kill('SIGINT')

 //          setTimeout(function() {

 //            if (!testdone) {
 //              testdone = true
 //              level(location, levelopts, function(err, db) {

 //                if (err) {
 //                  assert.ok(false, err)
 //                }

 //                db.get('testkey', function(err, record) {
 //                  if (err) {
 //                    assert.ok(false, err)
 //                  }
 //                  else {

 //                    console.log(record)

 //                    assert.equal(record.value.a, 1, 'correct value')
 //                    assert.equal(record.value.b, 2, 'correct value')

 //                    db.close()
 //                    leveldown.destroy(location, function(err) {
 //                      if (err) {
 //                        assert.ok(false, err)
 //                      }
 //                      sc.kill('SIGINT')
 //                      done()
 //                    })
 //                  }
 //                })
 //              })
 //            }

 //          }, 512)
 //        }, 512)
 //      }, 512)
 //    }
 //  )

 //  it(
 //    'should be able to extend the value associated with a custom key (complex)',
 //    function(done) {

 //      var testdone = false
 //      var client = loqui.createClient()
 //      var ss = spawnServer('--location ./test/fixtures/db')
 //      var sc = spawnClient('--reconnectTime 100')
 //      client.log('testkey', { a: 1, b: [{ c: 3, d: { test: 'A' } }]})

 //      setTimeout(function() {
 //        client.extend('testkey', { a: 1, b: [{ c: { test: 'B' } }]})

 //        setTimeout(function() {

 //          ss.kill('SIGINT')

 //          setTimeout(function() {

 //            if (!testdone) {
 //              testdone = true
 //              level(location, levelopts, function(err, db) {

 //                if (err) {
 //                  assert.ok(false, err)
 //                }

 //                db.get('testkey', function(err, record) {
 //                  if (err) {
 //                    assert.ok(false, err)
 //                  }
 //                  else {

 //                    assert.equal(record.value.a, 1, 'correct value')
 //                    assert.equal(record.value.b[0].c.test, 'B', 'correct value')

 //                    db.close()
 //                    leveldown.destroy(location, function(err) {
 //                      if (err) {
 //                        assert.ok(false, err)
 //                      }
 //                      sc.kill('SIGINT')
 //                      done()
 //                    })
 //                  }
 //                })
 //              })
 //            }

 //          }, 512)
 //        }, 512)
 //      }, 512)
 //    }
 //  )


 //  it(
 //    'should be able to increment a custom key',
 //    function(done) {

 //      var testdone = false
 //      var client = loqui.createClient()
 //      var ss = spawnServer('--location ./test/fixtures/db --port 9099')
 //      var sc = spawnClient('--reconnectTime 100')
 //      client.counter('testkey', { counter: 1 })

 //      setTimeout(function() {
 //        client.counter('testkey', { counter: 1 })

 //        setTimeout(function() {

 //          ss.kill('SIGINT')

 //          setTimeout(function() {

 //            if (!testdone) {
 //              testdone = true
 //              level(location, levelopts, function(err, db) {

 //                if (err) {
 //                  assert.ok(false, err)
 //                }

 //                db.get('testkey', function(err, record) {
 //                  if (err) {
 //                    assert.ok(false, err)
 //                  }
 //                  else {

 //                    console.log(record)

 //                    assert.equal(record.value.counter, 2, 'correct value')

 //                    db.close()
 //                    leveldown.destroy(location, function(err) {
 //                      if (err) {
 //                        assert.ok(false, err)
 //                      }
 //                      sc.kill('SIGINT')
 //                      done()
 //                    })
 //                  }
 //                })
 //              })
 //            }

 //          }, 512)
 //        }, 512)
 //      }, 512)
 //    }
 //  )

 //  it(
 //    'should be able to decrement a custom key',
 //    function(done) {

 //      var testdone = false
 //      var client = loqui.createClient()
 //      var ss = spawnServer('--location ./test/fixtures/db --port 9099')
 //      var sc = spawnClient('--reconnectTime 100')
 //      client.counter('testkey', { counter: 1 })

 //      setTimeout(function() {
 //        client.counter('testkey', { counter: -1 })

 //        setTimeout(function() {

 //          ss.kill('SIGINT')

 //          setTimeout(function() {

 //            if (!testdone) {
 //              testdone = true
 //              level(location, levelopts, function(err, db) {

 //                if (err) {
 //                  assert.ok(false, err)
 //                }

 //                db.get('testkey', function(err, record) {
 //                  if (err) {
 //                    assert.ok(false, err)
 //                  }
 //                  else {

 //                    console.log(record)

 //                    assert.equal(record.value.counter, 0, 'correct value')

 //                    db.close()
 //                    leveldown.destroy(location, function(err) {
 //                      if (err) {
 //                        assert.ok(false, err)
 //                      }
 //                      sc.kill('SIGINT')
 //                      done()
 //                    })
 //                  }
 //                })
 //              })
 //            }

 //          }, 512)
 //        }, 512)
 //      }, 512)
 //    }
 //  )

 // it(
 //    'should report the number of logs sent is the same as the number received',
 //    function(done) {

 //      var testdone = false
 //      var count = 0
 //      var total = 1000
 //      var client = loqui.createClient()
 //      var ss = spawnServer('--location ./test/fixtures/db')
 //      var sc = spawnClient('--reconnectTime 10')

 //      for(var i = 0; i < total; i++) {
 //        client.log('testkey' + i, 'testvalue' + i)
 //      }

 //      setTimeout(function() {

 //        ss.kill('SIGINT')
 //        sc.kill('SIGINT')

 //        setTimeout(function() {

 //          level(location, levelopts, function(err, db) {
 //            db.createReadStream({ keys: false, values: false })
 //            .on('data', function(d) {
 //              count++
 //            })
 //            .on('end', function() {

 //              assert.equal(total, count, 'expected number of records')

 //              db.close()
 //              leveldown.destroy(location, function(err) {
 //                if (err) {
 //                  assert.ok(false, err)
 //                }
 //                done()
 //              })
 //            })
 //          })

 //        }, 512)
 //      }, 1024)
 //    }
 //  )
})
