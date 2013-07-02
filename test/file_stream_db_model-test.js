var should = require('should')

describe('file_stream_db_model testing', function() {

  var DbModel
    , moduleUnderTest = '../lib/file_stream_db_model';

  beforeEach(function(){
     process.env.FS = '../test/fixtures/fs_mock';
  });

  afterEach(function(){
    delete DbModel;
    delete require.cache[require.resolve(moduleUnderTest)];
  });

  describe('with constructor', function() {
    it('should construct', function() {
      DbModel = require(moduleUnderTest);
      var dbModel = new DbModel('/tmp/test.log');
      should.exist(dbModel._stream);
    });
  });

  describe('with batch', function() {
    it('should reset batch length to 0', function() {
      DbModel = require(moduleUnderTest);
      var dbModel = new DbModel('/tmp/test.log');
      var expected = '[1,2,3]\n';
      dbModel._stream.write = function (s,cb){
        s.should.eql(expected);
        cb();
      };

      var batch = [1,2,3];
      dbModel.batch(batch);
      batch.length.should.eql(0);
    });
  });

  describe('with batch', function() {
    it('should handle write err', function() {
      DbModel = require(moduleUnderTest);
      var dbModel = new DbModel('/tmp/test.log');
      var expected = '[1,2,3]\n';
      dbModel._stream.write = function (s,cb){
        s.should.eql(expected);
        cb(new Error('test error message'));
      };

      var batch = [1,2,3];
      dbModel.batch(batch);
      batch.length.should.eql(0);
    });
  });

  describe('with put', function() {
    it('should write value to stream', function() {
      DbModel = require(moduleUnderTest);
      var dbModel = new DbModel('/tmp/test.log');
      var expected = '{"key":"test","value":1}\n';

      dbModel._stream.write = function (s,cb){
        s.should.eql(expected);
        cb();
      };

      var key = 'test';
      var value = 1;

      dbModel.put(key,value,function(err){
        should.not.exist(err);
      });
    });
  });

});
