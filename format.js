var util = require('util');
var uuid = require('node-uuid');

//
// generate a key-value object.
//
module.exports = function format() {

  var key, value, args;

  if (arguments.length === 1) {

    key = uuid.v4();
    value = arguments[0];
  }
  else if (arguments.length > 1) {

    if (/%[sdj%]/g.test(arguments[1])) {
      key = arguments[0];
      args = Array.prototype.slice.call(arguments)
      args.shift();
      value = util.format.apply(
        null,
        args
      );
    }
    else if (/%[sdj%]/g.test(arguments[0])) {
      key = uuid.v4();
      value = util.format.apply(
        null,
        Array.prototype.slice.call(arguments)
      );
    }
    else {
      key = arguments[0];
      value = arguments[1];
    }
  }

  return {
    key: key,
    value: value
  };
};
