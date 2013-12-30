var assert = require('assert');
var co = require('co');
var oath = require('../index');

function async(echo, cb) {
  var done = oath(cb);

  setTimeout(function() {
    done(null, echo);
  }, 100);

  return done.thunk();
}

function embedded(echo, cb) {
  var done = oath(cb);

  co(function*() {
    return yield async(echo);
  })(done);

  return done.thunk();
}

co(function*() {
  var echo = embedded('echo');

  var a = async('a');
  var b = async('b');
  var c = async('c');
  var res = yield [ a, b, c ];

  console.log(yield echo);
  console.log(res);
})();
