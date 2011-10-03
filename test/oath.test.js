var assert = require('assert'),
    oath = require('oath');

module.exports = {
  'its an oath': function() {
    var n = 0;
    var success = function () {
      n++;
      assert.ok(true);
    };
    
    var failure = function () {
      n--;
      assert.fail();
    };
    
    var runner = function(text) {
      var p = new oath();
      setTimeout(function() {
        p.resolve(text);
      }, 100);
      setTimeout(function() {
        p.reject(text);
      }, 300);
      return p;
    };
    
    runner('test').then(success, failure);
    
    this.on('exit', function () {
      assert.equal(n, 1, 'the success function has been called');
    });
  }
};