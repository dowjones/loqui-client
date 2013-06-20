var streamMock = {
  write: function(){console.log('fsmock.write')}
};

exports.createWriteStream = function(file,opts){
  return streamMock;
};
