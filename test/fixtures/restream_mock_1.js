var connection = {};

var streamMock = {
  on:function(event,cb){
    if (event === 'connect'){
      cb(connection);
    }
    return this;
  }
}

exports.connect = function(opts){
  return streamMock;
};
