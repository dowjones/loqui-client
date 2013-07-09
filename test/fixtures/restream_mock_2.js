var streamMock = {
  on:function(event,cb){
    if (event === 'connect'){
      cb();
    }
    return this;
  }
}

exports.connect = function(opts){
  return streamMock;
};
