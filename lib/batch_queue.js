var ip = require('ip');

exports = module.exports = BatchQueue;

function BatchQueue(opts,client,batch,putDb,batchDb){

  this.client = client;
  this.rate = opts.rate;
  this.window = opts.window;
  this.local = opts.local;
  this.logfile = opts.logfile;
  this.quota = this.rate;
  this.throttling = typeof this.rate !== 'undefined' && typeof this.window !== 'undefined';
  this.timeStampMS = Date.now();
  this.queueSize = opts.queueSize;
  this.batch = batch;
  this.batchIndexes = {};

  this.putDb = putDb;
  this.batchDb = batchDb;

  this.origin = {
    host: ip.address(),
    pid: process.pid
  };
}


BatchQueue.prototype.queue = function(obj,method){

  if (this.throttle()) return;

  var write = false;
  var op = this.getOp(obj,method);
  if (this.local){
    console.log(op);
  }

  if (!this.queueSize && (this.client.connected || this.logfile)) {
    return this.putDb(op.key, op.value, function(err) {
      if (err) { console.log(err) }
    })
  } else if (!this.queueSize) {
    return this.batch.push(op);
  }

  if (method === 'error') {

    this.batch.push(op)
    write = true

  } else if (method === 'counter') {

      var n = obj.value.counter;

      if (typeof this.batchIndexes[op.key] !== 'undefined' && obj.value.method === 'counter') {
        this.batch[this.batchIndexes[op.key]].value.value.counter += n;
      } else {
        this.batchIndexes[op.key] = this.batch.length;
        this.batch.push(op);
      }

  } else {

    this.batch.push(op);

  }

  if (this.batch.length === this.queueSize) {
    write = true
  }

  if (write && (this.client.connected || this.logfile)) {
    this.batchDb(this.batch);
    this.batchIndexes = {};
  }

}


BatchQueue.prototype.getOp = function(obj,method) {

  var key = this.client.id + '!' + obj.key;

  var op = {
    type: 'put',
    key: key,
    value: {
      value: obj.value,
      method: method,
      origin: this.origin,
      timestamp: Date.now()
    } 
  }

  return op;

}

/**
 * return true|false
 */
BatchQueue.prototype.throttle = function() {
  if (this.throttling) {
    var current = Date.now();
    var delta = current - this.timeStampMS;
    this.timeStampMS = current;
    this.quota += delta * (this.rate / this.window);

    if (this.quota > this.rate) {
      this.quota = this.rate;
    }
    if (this.quota < 1) {
      return true;
    } else {
      this.quota -= 1;
    }
  }
  return false;
}
