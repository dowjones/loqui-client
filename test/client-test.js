var should = require('should')

describe('loqui-client testing', function() {

  var loqui_client
    , moduleUnderTest = '../';

  beforeEach(function(){
     process.env.NODE_UUID = './test/fixtures/node-uuid_mock';
     process.env.FORMAT = './test/fixtures/format_mock';
     process.env.FILESTREAMDBMODEL = './test/fixtures/file_stream_db_model_mock';
     process.env.LOQUICLIENTDBMODEL = './test/fixtures/loqui_client_db_model_mock';
     process.env.BATCH_QUEUE = './test/fixtures/batch_queue_mock';
  });

  afterEach(function(){
    delete loqui_client;
    delete require.cache[require.resolve(moduleUnderTest)];
  });

  describe('with client', function() {
    it('should createClient with no options provided', function() {
      loqui_client = require(moduleUnderTest);
      var opts = {};
      var client = loqui_client.createClient(opts);
      client.log('testme');
      client.info('testme');
      client.warn('testme');
      client.error('testme');
      client.counter('testme');
      client.extend('testme');
    });
  });

  describe('with client', function() {
    it('should createClient with logfile options provided', function() {
      loqui_client = require(moduleUnderTest);
      var opts = {"logfile":"/tmp/loqui-client-test.log"};
      var client = loqui_client.createClient(opts);
      client.log('testme');
      client.info('testme');
      client.warn('testme');
      client.error('testme');
      client.counter('testme');
      client.extend('testme');
    });
  });

  describe('with client', function() {
    it('should call useFileStream', function() {
      process.env.DB_MODEL  = './test/fixtures/bad_db_model_mock';
      loqui_client = require(moduleUnderTest);
      var opts = {};
      var client = loqui_client.createClient(opts);
      client.log('testme');
      client.info('testme');
      client.warn('testme');
      client.error('testme');
      client.counter('testme');
      client.extend('testme');
    });
  });

  describe('with client', function() {
    it('should call putdb', function() {
      process.env.BATCH_QUEUE = './test/fixtures/putdb_batch_queue_mock';
      loqui_client = require(moduleUnderTest);
      var opts = {};
      var client = loqui_client.createClient(opts);
      client.log('testme');
      client.info('testme');
      client.warn('testme');
      client.error('testme');
      client.counter('testme');
      client.extend('testme');
    });
  });

  describe('with client', function() {
    it('should call batchdb', function() {
      process.env.BATCH_QUEUE = './test/fixtures/batchdb_batch_queue_mock';
      loqui_client = require(moduleUnderTest);
      var opts = {};
      var client = loqui_client.createClient(opts);
      client.log('testme');
      client.info('testme');
      client.warn('testme');
      client.error('testme');
      client.counter('testme');
      client.extend('testme');
    });
  });

  describe('with client', function() {
    it('should call useLoquiServer and create a loqui_dbmodel', function() {
      process.env.BATCH_QUEUE = './test/fixtures/batchdb_batch_queue_mock';
      process.env.NET = './test/fixtures/net_mock';
      loqui_client = require(moduleUnderTest);
      var opts = {servers:[{port:9999,host:'127.0.0.1'}]};
      var client = loqui_client.createClient(opts);
    });
  });

  describe('with client', function() {
    it('should call useLoquiServer and create a file dbmodel', function() {
      process.env.BATCH_QUEUE = './test/fixtures/batchdb_batch_queue_mock';
      process.env.NET = './test/fixtures/net_mock_2';
      loqui_client = require(moduleUnderTest);
      var opts = {servers:[{port:9999,host:'127.0.0.1'}]};
      var client = loqui_client.createClient(opts);
    });
  });

});
