var Sherlock = require('sherlock')
  , assert = Sherlock.assert;

var oath = require('..');

module.exports = new Sherlock.Investigation('Oath', function (test, done) {
  
  test('oath has version', function (test, done) {
    assert.isNotNull(oath.version);
    done();
  });
  
  test('basic oath success', function (test, done) {
    var success = Sherlock.Spy(function (data) {
          assert.deepEqual(data, { doctor: 'who' });
        })
      , failure = Sherlock.Spy();
    
    var promise = function(data) {
      var o = new oath();
      setTimeout(function() { o.resolve(data);  }, 100);
      setTimeout(function() { o.reject('too slow'); }, 300);
      return o;
    };
    
    // waiting, to ensure o.reject is not called
    setTimeout(function() {
      done();
    }, 500);
    
    promise({ doctor: 'who' }).then(success, failure);
    
    this.on('exit', function () {
      assert.equal(success.calls.length, 1, 'the success function was only called once');
      assert.equal(failure.called, false, 'fail was not called');
    });
  });
  
  test('basic oath failure', function (test, done) {
    var success = Sherlock.Spy()
      , failure = Sherlock.Spy(function (data) {
          assert.equal(data, 'pretending i\'m too slow');
        });
    
    var promise = function(data) {
      var o = new oath();
      setTimeout(function() { o.resolve(data); }, 300);
      setTimeout(function() { o.reject('pretending i\'m too slow'); }, 100);
      return o;
    };
    
    // waiting to ensure o.resolve is not called
    setTimeout(function() {
      done();
    }, 500);
    
    promise({ doctor: 'who' })
      .then(success) // if no failure object skip
      .then(success, failure);
    
    this.on('exit', function () {
      assert.equal(success.called, false, 'success was not called');
      assert.equal(failure.calls.length, 1, ' i have successfully failed, once');
    });
  });
  
  test('multiple then chains on success in order', function (test, done) {
    var n = 0;
    var success1 = function (data) {
      assert.equal(n, 0, 'success2 not called yet');
      assert.deepEqual(data, { doctor: 'who' });
      n++;
    };
    
    var success2 = function (data) {
      assert.equal(n, 1, 'success1 has been called');
      assert.deepEqual(data, { doctor: 'who' });
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
    
    setTimeout(function () {
      done();
    }, 500);
    
    promise({ doctor: 'who' }).then(success1, failure).then(success2);
    
    this.on('exit', function () {
      assert.equal(n, 2, 'the both success functions have been called');
    });
  });
  
  test('multiple then chains on failure in order', function (test, done) {
    var n = 0;
    var failure1 = function (data) {
      assert.equal(n, 0, 'failure2 not called yet');
      assert.deepEqual(data, { doctor: 'who' });
      n++;
    };
    
    var failure2 = function (data) {
      assert.equal(n, 1, 'failure1 has been called');
      assert.deepEqual(data, { doctor: 'who' });
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
    
    setTimeout(function () {
      done();
    }, 500);
    
    promise({ doctor: 'who' }).then(success, failure1).then(success, failure2);
    
    this.on('exit', function () {
      assert.equal(n, 2, 'the both failures functions have been called');
    });
  });
  
  test('oath call helper', function (test, done) {
    var doctor = new oath(),
        who, n=0;
        
    doctor
      .call('who', { time: 'lord' });
    
    setTimeout(function() {
      doctor.resolve({
        who: function(data) { n++; who = data; } 
      });
      done();
    }, 100);
    
    this.on('exit', function() {
      assert.equal(n, 1, 'callback called');
      assert.deepEqual(who, { time: 'lord' });
    });
  });
  
  test('oath get helper with pop', function (test, done) {
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
      done();
    },0);
    
    this.on('exit', function() {
      assert.equal(n, 2, 'both callbacks called');
      assert.equal(who, 'who');
      assert.deepEqual(tardis, { doctor: 'who' });
    });
  });
  
  done();
});