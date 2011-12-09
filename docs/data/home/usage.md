---
  title: Usage Scenarios
  weight: 5
  render-file: false
---

### Using Oath in Async Functions

Our async function will returne a new `oath` and to allow queue of success or failure callbacks be
registered by the recieving function. Here is a look at the internals of `asyncFunc`. In this
scenario, let's say we are querying a database,doing some minupulation to the dataset, then
returned an object that represents its data.

    function asyncFunc(id) {
      var promise = new oath();

      // db.get is async function with callback
      db.get({_id: id}, function(err, result) {
        if (err) {
          promise.reject(err); // we had an error, execute failure stack
          return; // we are done here
        }
        // ...
        promise.resolve(result); // execute success stack sending it the result
      });

      // promise will be returned immediately
      return promise;
    }

Since `db.get` is asyncronous, the promise will be returned immediately. Our callbacks will be queued.

When `db.get` is done, the callback is executed. If there was an error, we call `reject` on our promise
to execute the falure stack. If there was no error, we continue, do our work, then `resolve` our promise
to execute the success stack, returning the result to each function in that stack.

### Code Sample of a Futures Style API

In the following scenario, an async function will return an oath and then begin doing its
work. Upon completion of the async work it will either execute the `success` stack or the `failure`
stack, passing the result or the error object, respectively.

    var success = function (data) {
      console.log('We were a success: ' + data);
    }

    var failure = function (err) {
      console.log('We had an error: ' + err);
    }

    var doAsync = asyncFunc(123);

    doAsync.then(success, failure);

And primary advantage being that a queue is built. You can later queue more callbacks onto
the `doAsync` as needed.

    doAsync.then(success2, failure2);
    // other code stuff here
    doAsync.then(success3);
    // more stff
    doAsync.then(null, failure3);
