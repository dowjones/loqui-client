var should = require('should')
  , format = require('../format');

describe('format testing', function() {

  describe('with format', function() {

    it('should return a undefined key/value object', function() {
      var key, value;
      var expected = {'key':key,'value':value};
      format.apply(null).should.eql(expected);
    });

    it('should return a defined key/value object for array size 1', function() {
      var expected = 'testme';
      var o = format.apply(null,['testme']);
      o.value.should.eql(expected);
    });

    it('should return a defined key/value object for array size 2', function() {
      var key = 'mykey';
      var value = 'myvalue';
      var expected = {'key':key,'value':value};
      var o = format.apply(null,[key,value]);
      o.should.eql(expected);
    });

  });

});
