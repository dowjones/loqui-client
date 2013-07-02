var fs = require(process.env.FS || 'fs')
  , util = require('./util');

exports = module.exports = FileStreamDbModel;

function FileStreamDbModel(logFile){
  this._stream = fs.createWriteStream(logFile, { flags: 'a' });
}

FileStreamDbModel.prototype.batch = function(batch) {
  var temp = util.cloneArray(batch); 
  batch.length = 0
  this._stream.write(JSON.stringify(temp) + '\n', function(err) {
    if (err) { console.log(err) }
    temp.length = 0
  });
}

FileStreamDbModel.prototype.put = function(key, value, callback) {
  var s = JSON.stringify({ key: key, value: value });
  this._stream.write(s + '\n', function(err) {
    callback(err);
  });
}
