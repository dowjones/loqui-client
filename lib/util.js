exports.cloneArray = function(a){
  var clone = new Array(a.length)
  for (var i = 0; i < a.length; i++) {
    clone[i] = a[i];
  }
  return clone;
}
