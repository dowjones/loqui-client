var streamMock = {
  write: function(s,cb){ cb() }
};

exports.createWriteStream = function(file,opts){
  return streamMock;
};
