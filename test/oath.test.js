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
    
    var promise = function(data) {
      var o = new oath();
      setTimeout(function() { o.resolve(data); }, 100);
      setTimeout(function() { o.reject('too slow'); }, 300);
      return o;
    };
    
    promise({ doctor: 'who' }).then(success, failure);
    
    this.on('exit', function () {
      assert.equal(n, 1, 'the success function has been called');
    });
  },
  'basic oath failure': function () {
    var n = 0;
    var success = function (data) {
      n++;
      assert.fail();
    };
    
    var failure = function (data) {
      n--;
      assert.equal(data, 'pretending i\'m too slow');
    };
    
    var promise = function(data) {
      var o = new oath();
      setTimeout(function() { o.resolve(data); }, 300);
      setTimeout(function() { o.reject('pretending i\'m too slow'); }, 100);
      return o;
    };
    
    promise({ doctor: 'who' }).then(success, failure);
    
    this.on('exit', function () {
      assert.equal(n, -1, 'the success function has been called');
    });
  },
  'multiple then chains on success in order': function () {
    var n = 0;
    var success1 = function (data) {
      assert.equal(n, 0, 'success2 not called yet');
      assert.eql(data, { doctor: 'who' });
      n++;
    };
    
    var success2 = function (data) {
      assert.equal(n, 1, 'success1 has been called');
      assert.eql(data, { doctor: 'who' });
      n++;
    };
    
    var failure = function (data) {
      n--;
      assert.fail();
    };
    
    var promise = function(data) {
      var o = new oath();
      setTimeout(function() { o.resolve(data); }, 100);
      setTimeout(function() { o.reject('too slow'); }, 300);
      return o;
    };
    
    promise({ doctor: 'who' }).then(success1, failure).then(success2);
    
    this.on('exit', function () {
      assert.equal(n, 2, 'the both success functions have been called');
    });
  },
  'multiple then chains on failure in order': function () {
    var n = 0;
    var failure1 = function (data) {
      assert.equal(n, 0, 'failure2 not called yet');
      assert.eql(data, { doctor: 'who' });
      n++;
    };
    
    var failure2 = function (data) {
      assert.equal(n, 1, 'failure1 has been called');
      assert.eql(data, { doctor: 'who' });
      n++;
    };
    
    var success = function (data) {
      n--;
      assert.fail();
    };
    
    var promise = function(data) {
      var o = new oath();
      setTimeout(function() { o.reject(data); }, 100);
      setTimeout(function() { o.resolve('too slow'); }, 300);
      return o;
    };
    
    promise({ doctor: 'who' }).then(success, failure1).then(success, failure2);
    
    this.on('exit', function () {
      assert.equal(n, 2, 'the both failures functions have been called');
    });
  },
  'oath get helper with pop': function () {
    var doctor = new oath(),
        who, tardis, n=0;

    doctor
      .get('doctor')
        .then(function(test) { who = test; })
        .pop()
      .then(function(data) { n++; tardis = { not: 'yet' }; })
      .pop() // this shouldn't do anything
      .then(function(data) { n++; tardis = data; });
    
    setTimeout(function() {
      doctor.resolve({ doctor: 'who' });
    },0);
    
    this.on('exit', function() {
      assert.equal(n, 2, 'both callbacks called');
      assert.equal(who, 'who');
      assert.eql(tardis, { doctor: 'who' });
    });
  },
  'oath call helper': function () {
    var doctor = new oath(),
        who, n=0;
        
    doctor
      .call('who', { time: 'lord' });
    
    setTimeout(function() {
      doctor.resolve({
        who: function(data) { n++; who = data; } 
      });
    }, 100);
    
    this.on('exit', function() {
      assert.equal(n, 1, 'callback called');
      assert.eql(who, { time: 'lord' });
    });
  }
};