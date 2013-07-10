var restream = require(process.env.RESTREAM || 'restream')
  , dns = require('dns')
  , net = require('net')
  , async = require('async');

exports.connect = function(opts,connectCb){
  if (!opts || !opts.servers) return;
  convertHostNames(opts.servers, function(err,servers){
    if (err) {
      console.error(err);
      return connectCb();
    }
    opts.servers = servers;
    restream.connect(opts)
      .on('connect', connectCb)
      .on('fail', connectCb);
   });
}

var convertHostNames = exports.convertHostNames = function(servers,cb){
  async.map(servers,convertHostName,cb);
}

var convertHostName = exports.convertHostName = function(server,cb){
  if (!net.isIP(server.host)){
    dns.lookup(server.host, function (err, address) {
      if (err) return cb(err);
      server.host = address;
      return cb(null,server);
    });
  } else {
    cb(null,server);
  }
}


