/*!
 * Oath - Node.js / browser event emitter.
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var assert = require('simple-assert');

/*!
 * Primary exports
 */

var exports = module.exports = createThunk;

/**
 * ### thunk(cb, [ctx])
 *
 * Create a thunk that can later be "completed".
 *
 * ```js
 * function async(cb) {
 *  var done = thunk(cb);
 *  setImmediate(done);
 *  return done.thunk;
 * }
 *
 * var res = async(next);
 * res(alsoNext);
 * ```
 *
 * @param {Function} first callback
 * @param {Object} context to invoke callback(s) with
 * @return {Function} completed handle
 * @api public
 */

function createThunk(cb, ctx) {
  var t = {
    ctx: ctx || null,
    res: null,
    progress: { total: null, complete: null },
    listeners: { complete: [], error: [], progress: [] }
  };

  /*!
   * Scoped `.call` for invoke the callback chain.
   * Returns a function that is to be called with
   * an `{Array}` of callbacks to invoke.
   *
   * @param {Object} store
   * @return {Function}
   * @api private
   */

  var call = (function(t) {
    return function call(fns) {
      for(var i = 0; i < fns.length; i++) {
        fns[i].apply(t.ctx, t.res);
      }
    };
  })(t);

  /**
   * #### done(err, [...])
   *
   * The function returned from `thunk` signals
   * the completion of the thunk and is to be used
   * within the async function that the thunk represents.
   *
   * @param {Error|null} if error
   * @param {Mixed} repeatable result
   * @api public
   */

  var done = (function(t) {
    return function thunk() {
      assert(!Array.isArray(t.res), 'thunk has already completed');
      var argv = t.res = [].slice.call(arguments);
      var q = argv[0] ? t.listeners.error : t.listeners.complete;
      return call(q);
    };
  })(t);

  done.progress = (function(t) {
    return function(total, current) {
      t.progess = { total: total, current: current };
      call(t.listeners.progress);
      return this;
    }
  })(t);

  /**
   * #### done.thunk(cb)
   *
   * This method is used to stack callbacks
   * for invocation upon completion. A function/method
   * implementing thunks should return this function.
   *
   * @param {Function} callback to add to stack
   * @api public
   */

  done.thunk = (function(t) {
    function addListener(ev, fn) {
      assert(~[ 'error', 'complete', 'progress' ].indexOf(ev), 'invalid event listener key');
      assert('function' === typeof fn, 'invalid event listener callback');
      t.listeners[ev].push(fn);
    }

    function Oath(fn) {
      if (!fn) return Oath;

      if (Array.isArray(t.res)) {
        assert('function' === typeof fn, 'invalid event listener callback');
        call([ fn ]);
      } else {
        addListener('complete', fn);
        addListener('error', fn);
      }

      return Oath;
    }

    Object.defineProperty(Oath, 'progress', {
      get: function() { return t.progress; }
    });

    Object.defineProperty(Oath, 'onerror', {
      set: function(fn) { addListener('error', fn); }
    });

    Object.defineProperty(Oath, 'oncomplete', {
      set: function(fn) { addListener('complete', fn); }
    });

    Object.defineProperty(Oath, 'onprogress', {
      set: function(fn) { addListener('progress', fn); }
    });

    return Oath;
  })(t);

  if (cb) done.thunk(cb);
  return done;
}

/**
 * ### thunk.wrap(method, [source context], [target context])
 *
 * Convert a node-compatible standard async function
 * to a thunk-style function.
 *
 * ```js
 * // no context required
 * var read = thunk.wrap(fs.read);
 *
 * // contexts required
 * function Server() {
 *   var serv = this._handle = http.createServer();
 *   this.listen = thunk.wrap(serv.listen, serv, this);
 * }
 * ```
 *
 * @param {Function} function or method
 * @param {Mixed} source context (for method)
 * @param {Mixed} target context (for callbacks)
 * @return {Function} add callback to stack
 * @api public
 */

exports.wrap = function(method, sctx, tctx) {
  return function() {
    var argv = [].slice.call(arguments);
    var done = createThunk(null, tctx);
    argv[argv.length] = done;
    sctx = sctx || null;
    method.apply(sctx, argv);
    return done.thunk;
  };
};
