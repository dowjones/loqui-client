var multilevel = require(process.env.MULTILEVEL || 'multilevel')
  , util = require('./util')

exports = module.exports = LoquiClientDbModel;

function LoquiClientDbModel(connection,loquiClient){
  if (loquiClient.connected) return;
  loquiClient.connected = true;
  this._multilevelClient = multilevel.client();
  this._multilevelClient.pipe(connection).pipe(this._multilevelClient);
}

LoquiClientDbModel.prototype.batch = function(batch){
  var temp = util.cloneArray(batch); 
  batch.length = 0
  this._multilevelClient.batch(temp, function(err) {
    if (err) { console.log(err) }
    temp.length = 0
  })
}

LoquiClientDbModel.prototype.put = function(key, value, callback) {
  this._multilevelClient.put(key,value,callback);
}
