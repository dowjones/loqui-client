var db = {
  put: function(key,value,cb){cb(null)}
  , batch: function(batch){}
}

exports.getDbForFileStream = function(logfile){
  return db;
};

exports.getConnection = function(opts,cb){
  var connection = {};
  cb(connection);
};

exports.getDbForConnection = function(connection,client){
  return db;
};
