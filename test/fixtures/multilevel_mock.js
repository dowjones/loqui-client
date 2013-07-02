var dbMock = {
  pipe:function(){return this}
}

exports.client = function(){
  return dbMock;
};
