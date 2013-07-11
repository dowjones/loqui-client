var should = require('should')
  , util = require('../lib/util')

describe('util testing', function() {

  describe('with cloneArray', function() {
    it('should create shallow copy of array', function() {
      var a = ['a'];
      var clone = util.cloneArray(a);
      clone.should.eql(a);
    });
  });

});
