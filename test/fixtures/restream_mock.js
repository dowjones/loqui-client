var streamMock = {
  on:function(event,cb){
     console.log('on restream');
     return this;
  }
}

exports.connect = function(opts){
  return streamMock;
};
