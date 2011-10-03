
function oath () {
  var self = this;
  this.pending = [];
  
  this.resolve = function (result) {
    self.complete('resolve', result);
  };
  
  this.reject = function (result) {
    self.complete('reject', result);
  };
}

oath.prototype.then = function (success, failure) {
  this.pending.push({ resolve: success, reject: failure });
  return this;
};

oath.prototype.get = function (property) {
  return this.then(function(value) {
    return value[property];
  });
};

oath.prototype.call = function (fn) {
  return this.then(function(value) {
    return value[fn].apply(value, Array.prototype.slice.call(arguments, 1));
  });
};

oath.prototype.complete = function (type, result) {
  while (this.pending[0]) {
    this.pending.shift()[type](result);
  }
};

module.exports = oath;