/*!
 * Oath - Node.js / browser event emitter.
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var exports = module.exports = Oath;


/*!
 * oath version
 */
exports.version = '0.1.0';

/**
 * # Oath constructor
 *
 * Create a new promise.
 *
 * #### Options
 *
 * * parent - used internally for chaining
 * * context - object to set as `this` in callbacks
 *
 * You can use `Oath` within single functions
 *
 *      // assignment style
 *      var promise = new oath();
 *      promise.then(successFn, errorFn);
 *      myAsycFunction(function(err, result) {
 *        if (err) promise.reject(err);
 *        promise.resolve(result);
 *      });
 *
 * Or return them to ease chaining of callbacks
 *
 *      // return style
 *      function doSomething(data) {
 *        var promise = new oath();
 *        // async stuff here
 *        // promise should be returned immediately
 *        return promise;
 *      }
 *
 *      doSomething(data).then(successFn, errorFn);
 *
 * @name constructor
 * @param {Object} options
 * @api public
 */

function Oath (options) {
  options = options || {};

  this._pending = {};
  this._oath = {
      complete: false
    , parent: options.parent || null
    , context: options.context || this
  };
}

/**
 * # Oath.resolve(result)
 *
 * Emits completion event to execute `success` chain of functions.
 *
 *        // When async work is complete
 *        promise.resolve(my_data_obj);
 *
 * @name Oath.resolve
 * @param {Object} result
 * @api public
 */

Oath.prototype.resolve = function (result) {
  this._fulfill('resolve', result);
};

/**
 * # Oath.reject(result)
 *
 * Emit completion event to execute `failure` chain of functions.
 *
 *        // When async work errors
 *        promise.reject(my_error_obj);
 *
 * @name Oath.reject
 * @param {Object} result
 * @api public
 */

Oath.prototype.reject = function (result) {
  this._fulfill('reject', result);
};

/**
 * # .then([success], [failure])
 *
 * Chainable function for promise observers to queue result functions.
 *
 *      doSomething(my_data)
 *        .then(successFn1, failureFn1)
 *        .then(successFn2, failureFn2)
 *
 * @name then
 * @param {Function} success will execute on `resolve`
 * @param {Function} failure will execute on `reject` (optional)
 * @api public
 */

Oath.prototype.then = function (success, failure) {
  if (success) this._register('resolve', success);
  if (failure) this._register('reject', failure);
  if (this._oath.complete) this._traverse();
  return this;
};

Oath.prototype._register = function (type, fn) {
  var context = this._oath.context
    , map = this._pending[type]
    , cb = function () { fn.apply(context, arguments); };

  if (!map) {
    this._pending[type] = cb;
  } else if ('function' == typeof map) {
    map = [ map ].push(cb);
  } else {
    map.push(cb);
  }
};

/**
 * # .get(property)
 *
 * On `resolve`, will return `property` value from data
 * passed by oath. Subsequent `then` calls will have the
 * value of the `get` passed to them.
 *
 *      doSomething(my_data)
 *        .get('doctor')
 *          .then(function(doctor) { ... })
 *          .then(function(doctor) { ... });
 *
 * @name get
 * @param {String} property
 * @api public
 */

Oath.prototype.get = function (property) {
  var o = new Oath({ parent: this });
  this.then(
    function(value) { o.resolve(value[property]); },
    function(value) { o.reject(value); }
  );
  return o;
};

/**
 * # .pop()
 *
 * Return you to a parent oath if you have chained down.
 *
 *      doSomething(my_data)
 *        .get('doctor')
 *          .then(function(doctor) { ... })
 *          .pop()
 *        .then(function(my_data) { ... });
 *
 * @name pop
 * @api public
 */

Oath.prototype.pop = function () {
  if (this._oath.parent) {
    return this._oath.parent;
  } else {
    return this;
  }
};


/**
 * # .call(functionName)
 *
 * On `resolve`, will execute a function of `name` in the
 * result object. The function that is called will be passed
 * all subseqents parameters of `oath.call`. The context of
 * `this` in the function that is called will be equal to the
 * `result` object passed on `oath.resolve`.
 *
 *      // queue up call on complete
 *      oath.call('validate', '1234');
 *
 *      oath.resolve({ some: 'data'
 *        , validate: function (apiKey) {
 *            this.some == 'data';
 *            apiKey == '1234';
 *            ...
 *          }
 *        });
 *
 * @name call
 * @param {String} function name
 * @api public
 */

Oath.prototype.call = function (fn) {
  var args = arguments;
  return this.then(function(value) {
    return value[fn].apply(value, Array.prototype.slice.call(args, 1));
  });
};

/*!
 * # ._fulfill(type, result)
 *
 * Start the callback chain.
 *
 * @name fulfill
 * @param {String} type
 * @param {Object} result
 * @api private
 */

Oath.prototype._fulfill = function (type, result) {
  if (this._oath.complete) return false;
  this._oath.complete = {
      type: type
    , result: result
  };

  this._traverse();
};

Oath.prototype._traverse = function () {
  var type = this._oath.complete.type
    , result = this._oath.complete.result
    , map = this._pending[type]
    , stack = [];

  if (!map) {
    return false;
  } else if ('function' == typeof map) {
    stack.push(map);
  } else {
    stack.concat(map);
  }

  delete this._pending[type];
  while (stack[0]) {
    var fn = stack.shift();
    if (fn && 'function' === typeof fn) fn(result);
  }
};