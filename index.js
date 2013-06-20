var uuid = process.env.NODE_UUID ? require(process.env.NODE_UUID) : require('node-uuid')
  , format = process.env.FORMAT ? require(process.env.FORMAT) : require('./format')
  , DbModel = process.env.DB_MODEL ? require(process.env.DB_MODEL) : require('./lib/db_model')
  , BatchQueue = process.env.BATCH_QUEUE ? require(process.env.BATCH_QUEUE) : require('./lib/batch_queue')

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
 *    restream options
 *
 *    protocol
 *    servers - [{port:n,host:s}]
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
    db = DbModel.getDbForFileStream(logfile);
  }

  function useLoquiServer() {
    DbModel.getConnection(opts,getConnectCb());
  }

  function getConnectCb() {

    return function(connection) {
      if (connection){ 
        db = DbModel.getDbForConnection(connection, client) || db;
      } else {
        useFileStream()
      }
      db.batch(batch);
    }

  }

  if (logfile) {
    useFileStream();
  } else {
    useLoquiServer();
  }

  function putDb(key,value,cb){
    db.put(key,value,cb); 
  } 
  function batchDb(batch){
    db.batch(batch);
  }

  var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);

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

  return client
}
