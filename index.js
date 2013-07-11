var uuid = require(process.env.NODE_UUID || 'node-uuid')
  , format = require(process.env.FORMAT || './lib/format')
  , net = require(process.env.NET || './lib/net')
  , FileStreamDbModel = require(process.env.FILESTREAMDBMODEL || './lib/file_stream_db_model')
  , LoquiClientDbModel = require(process.env.LOQUICLIENTDBMODEL || './lib/loqui_client_db_model')
  , BatchQueue = require(process.env.BATCH_QUEUE || './lib/batch_queue')

/**
 * @param {Object} opts
 *
 *    queueSize
 *    rate
 *    window
 *    local
 *    logfile
 *    id
 *
 *    connection options
 *
 *    protocol: [ 'tcp' | 'tls' ]
 *    servers - [{port:n,host:s}], [{'port':9099,'host':'localhost'}]
 *    reconnectTime
 *    connectTimeout
 *    maxCycles
 *
 */
exports.createClient = function(opts) {

  opts = opts || {}

  var logfile = opts.logfile

  var batch = []
  var db

  function useFileStream() {
    db = new FileStreamDbModel(logfile);
  }

  function useLoquiServer() {
    net.connect(opts,getConnectCb());
  }

  function getConnectCb() {
    return function(connection) {
      if (connection){ 
        db = new LoquiClientDbModel(connection,client);
      } else {
        useFileStream();
      }
      db.batch(batch);
    }
  }

  if (opts.servers) {
    useLoquiServer();
  } else {
    useFileStream();
  }

  function putDb(key,value,cb){
    if (db) db.put(key,value,cb);
  } 
  function batchDb(batch){
    if (db) db.batch(batch);
  }

  function queue(obj, method) {
    batchQueue.queue(obj,method);
  }

  //
  // expose an api for the user to log with
  //

  var client = function(opts) {
    if (opts.id) { client.id = opts.id }
  }

  client.id = opts.id || uuid.v4()
  client.connected = false

  client.log = client.info = client.warn = function() {
    queue(format.apply(null, arguments), 'log')
  }

  client.error = function() {
    queue(format.apply(null, arguments), 'error')
  }

  client.counter = function() {
    queue(format.apply(null, arguments), 'counter')
  }

  client.extend = function() {
    queue(format.apply(null, arguments), 'extend')
  }

  var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);

  return client
}
