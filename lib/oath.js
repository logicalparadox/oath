/*!
 * drip - Node.js / browser event emitter.
 * Copyright(c) 2011 Jake Luer <@jakeluer>
 * MIT Licensed
 */

exports = module.exports = Oath;


/*!
 * oath version
 */
exports.version = '0.0.4';


/**
 * # Oath constructor
 * 
 * Create a new promise.
 * 
 * #### Options
 * 
 * * parent - used internally for chaining
 * * ...
 * 
 * #### You can use `Oath` within single functions
 * 
 *      var promise = new oath();
 *      promise.then(successFn, errorFn);
 *      myAsycFunction(function(err, result) {
 *        if (err) promise.reject(err);
 *        promise.resolve(result);
 *      });
 * 
 * #### Or return them to ease chaining of callbacks
 * 
 *      function doSomething(data) {
 *        var promise = new oath();
 *        // async stuff here
 *        // promise should be returned immediately
 *        return promise;
 *      }
 *      
 *      doSomething(data).then(successFn, errorFn);
 * 
 * @param {Object} options
 */
function Oath (options) {
  var self = this;
  options = options || {};
  
  this.pending = [];
  this._options = {
    parent: options.parent || null,
    context: options.context || this
  };
  
  /**
   * ## Oath#resolve
   * 
   * Emits completion event to execute `success` chain of functions.
   * 
   *        // When async work is complete
   *        promise.resolve(my_data_obj);
   * 
   * @param {Object} result
   */
  this.resolve = function (result) {
    self.complete('resolve', result);
  };
  
  /**
   * ## Oath#reject
   * 
   * Emit completion event to execute `failure` chain of functions.
   * 
   *        // When async work errors
   *        promise.reject(my_error_obj);
   * 
   * @param {Object} result
   */
  this.reject = function (result) {
    self.complete('reject', result);
  };
}


/**
 * # then
 * 
 * Chainable function for promise observers to queue result functions.
 * 
 *      doSomething(my_data)
 *        .then(successFn1, failureFn1)
 *        .then(successFn2, failureFn2)
 * 
 * @param {Function} success will execute on `resolve` 
 * @param {Function} failure will execute on `reject` (optional)
 */
Oath.prototype.then = function (success, failure) {
  var context = this._options.context,
      pending = { resolve: null, reject: null };
  
  if (success)
    pending.resolve = function () { success.apply(context, arguments); };
  
  if (failure)
    pending.reject = function () { failure.apply(context, arguments); };
  
  this.pending.push(pending);
  
  return this;
};

/**
 * # get
 * 
 * On `resolve`, will return `property` value from data passed by oath. Subsequent `then` calls will 
 * have the value of the `get` passed to them.
 * 
 *      doSomething(my_data).get('doctor')
 *        .then(function(doctor) { ... })
 *        .then(function(doctor) { ... });
 * 
 * @param {String} property
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
 * # pop
 * 
 * Return you to a parent oath if you have chained down.
 * 
 *      doSomething(my_data)
 *        .get('doctor')
 *          .then(function(doctor) { ... })
 *          .pop()
 *        .then(function(my_data) { ... });
 * 
 */
Oath.prototype.pop = function () {
  if (this._options.parent) {
    return this._options.parent;
  } else {
    return this;
  }
};


/**
 * # call
 * 
 * On `resolve`, will execute a function of `name` in the result object. The function that is called 
 * will be passed all subseqents parameters of `oath.call`. The context of `this` in the function 
 * that is called will be equal to the `result` object passed on `oath.resolve`.
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
 * @param {String} function name
 */
Oath.prototype.call = function (fn) {
  var args = arguments;
  return this.then(function(value) {
    return value[fn].apply(value, Array.prototype.slice.call(args, 1));
  });
};

/*!
 * # complete
 * 
 * Start the callback chain.
 * 
 * @param {String} type
 * @param {Object} result
 */
Oath.prototype.complete = function (type, result) {
  var fn;
  while (this.pending[0]) {
    fn = this.pending.shift()[type];
    if (fn && 'function' === typeof fn) fn(result);
  }
};