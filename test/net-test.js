var should = require('should');

describe('net testing', function() {

  afterEach(function(){
    delete require.cache[require.resolve('../lib/net')];
  });

  describe('with convertHostName', function() {
    it('should convert host to ip address', function() {
      var net = require('../lib/net');
      var server = {host:'localhost',port:9999};
      var expected = { host: '127.0.0.1',port:9999};
      net.convertHostName(server,function(err,result){
        result.should.eql(expected);
      });
    });
  });

  describe('with convertHostName', function() {
    it('should leave ip addresses alone', function() {
      var net = require('../lib/net');
      var server = {host:'127.0.0.1',port:9999};
      var expected = { host: '127.0.0.1',port:9999};
      net.convertHostName(server,function(err,result){
        result.should.eql(expected);
      });
    });
  });

  describe('with convertHostNames', function() {
    it('should convert host to ip address', function() {
      var net = require('../lib/net');
      var servers = [{host:'localhost',port:9990},{host:'localhost',port:9991}];
      var expected = [{ host: '127.0.0.1',port:9990 },{ host: '127.0.0.1',port:9991 }];
      net.convertHostNames(servers,function(err,results){
        results.should.eql(expected);
      });
    });
  });

  describe('with connect', function() {
    it('should handle dns error', function(done) {
      process.env.RESTREAM = '../test/fixtures/restream_mock';
      var net = require('../lib/net');
      var servers = [{host:'unknown',port:9999}];
      var opts = {servers:servers};
      net.connect(opts,function(connection){done()});
    });
  });

  describe('with connect', function() {
    it('should call connect', function() {
      process.env.RESTREAM = '../test/fixtures/restream_mock';
      var net = require('../lib/net');
      var servers = [{host:'127.0.0.1',port:9999}];
      var opts = {servers:servers};
      net.connect(opts,function(connection){});
    });
  });

  describe('with connect', function() {
    it('should handle no servers provided', function() {
      var net = require('../lib/net');
      var opts = {};
      net.connect(opts,function(connection){});
    });
  });

});
