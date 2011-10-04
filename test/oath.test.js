var assert = require('assert'),
    oath = require('oath');

module.exports = {
  'oath has version': function () {
    assert.isNotNull(oath.version);
  },
  'basic oath success': function() {
    var n = 0;
    var success = function (data) {
      n++;
      assert.eql(data, { doctor: 'who' });
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