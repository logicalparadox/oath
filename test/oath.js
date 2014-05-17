function fixture(name, argv, res) {
  var args = [];
  var oop = function() { args.push([].slice.call(arguments)); };
  var t = oath();
  t.thunk(oop);
  t.apply(null, argv);
  test(name, res.bind(null, args));
}

test('oath()', function() {
  var t = oath();
  assert('function' === typeof t);
  assert('function' === typeof t.thunk);
  assert('function' === typeof t.thunk());
  assert('function' === typeof t.thunk(function() {}));
});

test('oath(obj, str', function() {
  var obj = { stub: function(fn) { fn(42); } };
  oath(obj, 'stub')(function(arg) {
    assert(42 === arg);
  });
});

var fix1 = [ new Error('test') ];
fixture('oath(cb -> err)', fix1 , function(argv) {
  assert(argv.length === 1);
  assert(argv[0][0] instanceof Error);
});

var fix2 = [ null, 'foo' ];
fixture('oath(cb -> res)(cb -> res)', fix2, function(argv) {
  assert(argv[0].length === 2);
  argv.forEach(function(x) {
    assert(x[0] === null);
    assert(x[1] === 'foo');
  });
});

test('oath.wrap(fixture)', function() {
  function fixed(str, cb) {
    cb(null, str);
  }

  var fix = oath.wrap(fixed);
  fix('foo')(function(err, res) {
    assert(!err);
    assert(res === 'foo');
  });
});

test('oath.wrap(fixture, ctx, ctx)', function() {
  function fixed(str, cb) {
    assert(this.hello === 'world');
    cb(null, str);
  }

  var fix = oath.wrap(fixed, { hello: 'world' }, { hello: 'universe' });
  fix('foo')(function(err, res) {
    assert(this.hello === 'universe');
    assert(!err);
    assert(res === 'foo');
  });
});

test('oath.defer()', function(done) {
  var def = oath.defer();
  setTimeout(function() {
    def.cb()(null, 'hello');
  }, 10);

  def.wait()(function(err, res) {
    assert(!err);
    assert(res == 'hello');
    done();
  });
});
