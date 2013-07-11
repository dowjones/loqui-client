var should = require('should')

describe('loqui_client_db_model testing', function() {

  var DbModel
    , moduleUnderTest = '../lib/loqui_client_db_model';

  beforeEach(function(){
     process.env.MULTILEVEL = '../test/fixtures/multilevel_mock';
  });

  afterEach(function(){
    delete DbModel;
    delete require.cache[require.resolve(moduleUnderTest)];
  });

  describe('with constructor', function() {
    it('should construct', function() {
      DbModel = require(moduleUnderTest);
      var connection = {};
      var client = {connected:false};
      var dbModel = new DbModel(connection,client);
    });
  });

  describe('with batch', function() {
    it('should reset batch length to 0', function() {
      DbModel = require(moduleUnderTest);
      var connection = {};
      var client = {connected:false};
      var dbModel = new DbModel(connection,client);
      
      var batch = [1,2,3];
      var expected = [1,2,3];
      dbModel._multilevelClient.batch = function (a,cb){
        a.should.eql(expected);
        cb();
      };
      dbModel.batch(batch);
      batch.length.should.eql(0);
    });
  });

  describe('with batch', function() {
    it('should handle write err', function() {
      DbModel = require(moduleUnderTest);
      var connection = {};
      var client = {connected:false};
      var dbModel = new DbModel(connection,client);

      var batch = [1,2,3];
      var expected = [1,2,3];
      dbModel._multilevelClient.batch = function (a,cb){
        a.should.eql(expected);
        cb(new Error('test error message'));
      };
      dbModel.batch(batch);
      batch.length.should.eql(0);
    });
  });

  describe('with put', function() {
    it('should write value to stream', function() {
      DbModel = require(moduleUnderTest);
      var connection = {};
      var client = {connected:false};
      var dbModel = new DbModel(connection,client);

      var key = 'test';
      var value = 1;
      var expected = '{"key":"test","value":1}\n';
      dbModel._multilevelClient.put = function (k,v,cb){
        k.should.eql(key);
        v.should.eql(value);
        cb();
      };
      dbModel.put(key,value,function(err){
        should.not.exist(err);
      });
    });
  });

});
