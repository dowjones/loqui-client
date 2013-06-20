var fs = require('fs');
  , multilevel = require('multilevel')
  , restream = require('restream')

function cloneArray(a){
  var clone = new Array(a.length)
  for (var i = 0; i < a.length; i++) {
    clone[i] = a[i];
  }
  return clone;
}

exports.getDbForFileStream = function(logfile){

  var stream = fs.createWriteStream(logfile, { flags: 'a' })

  var db = {};

  db.batch = function(batch) {
    var temp = cloneArray(batch); 
    batch.length = 0
    stream.write(JSON.stringify(temp) + '\n', function(err) {
      if (err) { console.log(err) }
      temp.length = 0
    })
  }

  db.put = function(key, value, callback) {
    var s = JSON.stringify({ key: key, value: value })
    stream.write(s + '\n', function(err) {
      callback(err);
    });
  }

  return db;

}

exports.getDbForConnection = function(connection, loquiClient){

  if (loquiClient.connected) return; // TODO: is this needed?
  loquiClient.connected = true;

  var db = {};

  var multilevelClient = multilevel.client();

  multilevelClient.pipe(connection).pipe(multilevelClient);

  db.batch = function(batch) {
    var temp = cloneArray(batch); 
    batch.length = 0
    multilevelClient.batch(temp, function(err) {
      if (err) { console.log(err) }
      temp.length = 0
    })
  }

  db.put = function(key, value, callback) {
    multilevelClient.put(key,value,callback);
  }
  
}

exports.getConnection = function(opts,connectCb){
  restream.connect(opts)
    .on('connect', connectCb)
    .on('fail', connectCb)
}

