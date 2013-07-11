var should = require('should')
  BatchQueue = require('../lib/batch_queue');

describe('batch-queue testing', function() {

  describe('with queue', function() {

    it('should return from throttle', function() {
      var opts = {};
      var batch = [];
      var client = {connected:false};

      function putDb(key,value,cb){ should.fail('putDb called') };
      function batchDb(batch){ should.fail('batchDb called') };

      var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);
      batchQueue.throttle = function() { return true }

      var obj = {};
      var method;

      batchQueue.queue(obj,method);
      batch.should.eql([]);

    });

  });

  describe('with queue', function() {
    it('should call putDb returning successful', function() {
      var opts = {local:true};
      var batch = [];
      var client = {connected:true};
      var op = {key:1,value:1};

      function putDb(key,value,cb){
        key.should.eql(op.key);
        value.should.eql(op.value);
        cb(null);
      };

      function batchDb(batch){ should.fail('batchDb called') };

      var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);
      batchQueue.throttle = function() { return false }
      batchQueue.getOp = function() { return op };

      var obj = {};
      var method;

      batchQueue.queue(obj,method);
    });

  });

  describe('with queue', function() {
    it('should call putDb returning error', function() {
      var opts = {local:false};
      var batch = [];
      var client = {connected:true};
      var op = {key:1,value:1};
      var err = new Error('test error message');

      function putDb(key,value,cb){
        key.should.eql(op.key);
        value.should.eql(op.value);
        cb(err);
      };

      function batchDb(batch){ should.fail('batchDb called') };

      var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);
      batchQueue.throttle = function() { return false }
      batchQueue.getOp = function() { return op };

      var obj = {};
      var method;

      batchQueue.queue(obj,method);
    });

  });

  describe('with queue', function() {
    it('should push op to batch', function() {
      var opts = {local:false};
      var batch = [];
      var client = {connected:false};
      var op = {key:1,value:1};

      function putDb(key,value,cb){
        key.should.eql(op.key);
        value.should.eql(op.value);
        cb(err);
      };

      function batchDb(batch){ should.fail('batchDb called') };

      var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);
      batchQueue.throttle = function() { return false }
      batchQueue.getOp = function() { return op };

      var obj = {};
      var method;

      batchQueue.queue(obj,method);
      batch.should.eql([op]);
    });

  });

  describe('with queue', function() {
    it('should write an error method', function() {
      var opts = {local:false, queueSize:1};
      var batch = [];
      var client = {connected:true};
      var op = {key:1,value:1};

      function putDb(key,value,cb){ should.fail('putDb called') };
      function batchDb(batch){ batch.should.eql([op]); };

      var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);
      batchQueue.throttle = function() { return false }
      batchQueue.getOp = function() { return op };

      var obj = {};
      var method = 'error';

      batchQueue.queue(obj,method);
    });

  });

  describe('with queue', function() {
    it('should add counter method to batch', function() {
      var opts = {local:false, queueSize:1};
      var batch = [];
      var client = {id:'queue-test-1',connected:true};
      var obj = {key:'test',value:{method:'counter',counter:1}};

      function putDb(key,value,cb){ should.fail('putDb called') };
      function batchDb(batch){ batch[0].value.value.should.eql(obj.value) };

      var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);
      batchQueue.throttle = function() { return false };
      var method = 'counter';

      batchQueue.queue(obj,method);
      batchQueue.batchIndexes.should.eql({});
      batch[0].value.value.counter.should.eql(1);
    });
  });

  describe('with queue', function() {
    it('should add counter method to batch', function() {
      var opts = {local:false, queueSize:3};
      var batch = [];
      var client = {id:'queue-test-2',connected:true};
      var obj1 = {key:'test',value:{method:'counter',counter:1}};
      var obj2 = {key:'test',value:{method:'counter',counter:1}};

      function putDb(key,value,cb){ should.fail('putDb called') };
      function batchDb(batch){ };

      var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);
      batchQueue.throttle = function() { return false };
      var method = 'counter';

      batchQueue.queue(obj1,method);

      batchQueue.batchIndexes.should.eql({ 'queue-test-2!test': 0 });

      batchQueue.queue(obj2,method);

      batchQueue.batchIndexes.should.eql({ 'queue-test-2!test': 0 });

      batch[0].value.value.counter.should.eql(2);

    });
  });

  describe('with queue', function() {
    it('should write other method to batch', function() {
      var opts = {local:false, queueSize:1};
      var batch = [];
      var client = {id:'queue-test',connected:true};
      var op = {key:1,value:1};

      function putDb(key,value,cb){ should.fail('putDb called') };
      function batchDb(batch){ 
        batch.should.eql([op]);
      };

      var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);
      batchQueue.throttle = function() { return false };
      batchQueue.getOp = function() { return op };

      var obj = {};
      var method = 'other';

      batchQueue.queue(obj,method);
    });
  });

  describe('with queue', function() {
    it('should store other method to batch', function() {
      var opts = {local:false, queueSize:2};
      var batch = [];
      var client = {id:'queue-test',connected:true};
      var op = {key:1,value:1};

      function putDb(key,value,cb){ should.fail('putDb called') };
      function batchDb(batch){should.fail('batchDb called') };

      var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);
      batchQueue.throttle = function() { return false };
      batchQueue.getOp = function() { return op };

      var obj = {};
      var method = 'other';

      batchQueue.queue(obj,method);
      batch.should.eql([op]);
    });
  });

  describe('with throttle', function() {
    it('should return true', function() {
      var opts = {rate:0,window:1};
      var batch = [];
      var client = {id:'queue-test',connected:true};
      function putDb(key,value,cb){ should.fail('putDb called') };
      function batchDb(batch){should.fail('batchDb called') };

      var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);
      batchQueue.throttle().should.eql(true);
    });
  });

  describe('with throttle', function() {
    it('should return false', function() {
      var opts = {};
      var batch = [];
      var client = {id:'queue-test',connected:true};
      function putDb(key,value,cb){ should.fail('putDb called') };
      function batchDb(batch){should.fail('batchDb called') };

      var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);

      batchQueue.throttle().should.eql(false);
    });
  });

  describe('with throttle', function() {
    it('should return false', function() {
      var opts = {rate:1,window:1};
      var batch = [];
      var client = {id:'queue-test',connected:true};
      function putDb(key,value,cb){ should.fail('putDb called') };
      function batchDb(batch){should.fail('batchDb called') };

      var batchQueue = new BatchQueue(opts,client,batch,putDb,batchDb);
      batchQueue.timeStampMS = Date.now() - 1000;

      batchQueue.throttle().should.eql(false);
    });
  });

});
