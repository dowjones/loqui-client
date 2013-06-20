exports = module.exports = BatchQueue;

function BatchQueue (opts,client,batch,putDb,batchDb){
  return {
    queue: function(obj,method){
      putDb('testKey','testValue',function(err){
        if (err) console.log(err);
      });                                                                                                    
    }
  };
};
