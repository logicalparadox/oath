# Oath

Oath is a tiny javascript library that makes it easy to build future based APIs.

## What is a future anyway?

A future (or promise), is an alternative method to callbacks when working with asyncronous 
code. For more information check out the very information Wikipedia article 
on [Futures and Promises](http://en.wikipedia.org/wiki/Futures_and_promises).

## Installation

Oath is available in npm:

      $ npm install oath
      
## Help, resources, and issues?

* The annotated source / full API documentation is available at [alogicalparadox.com/oath](http://alogicalparadox.com/oath/).
* If you have questions or issues, please use this projects [Github Issues](https://github.com/logicalparadox/oath/issues).

## Roadmap

* Client side version

Want to see something else? All pull requests will be seriously considered or 
open a `feature` request on [Github Issues](https://github.com/logicalparadox/oath/issues).

## Code Sample of a Futures Style API

A future enabled async function will return an instance of an Oath. Here is what 
interacting with your API would look like if you implemented Oath as your futures solution.

In the following scenario, an async function will return an oath and then begin doing its
work. Upon completion of the async work it will either execute the `success` stack or the `failure`
stack, passing the result or the error object, respectively.

```js
var success = function (data) {
  console.log('We were a success: ' + data);
}

var failure = function (err) {
  console.log('We had an error: ' + err);
}

var doAsync = asyncFunc(123);

doAsync.then(success, failure);
```

And primary advantage being that a queue is built. You can later queue more callbacks onto the `doAsync`.

```js
doAsync
  .then(success2, failure2)
  .then(success3, failure3);
```

## Using Oath in Async Function

*Full API docs available [here](http://alogicalparadox.com/oath/).*

The async function above returned a new `oath` and then queued up a bunch of success or failure callbacks.
Here is a look at the internals of `asyncFunc`. In this scenario, let's say we are querying a database,
doing some minupulation to the dataset, then returned an object that represents its data.

```js
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
```

Since `db.get` is asyncronous, the promise will be returned immediately. Our callbacks will be queued.

When `db.get` is done, the callback is executed. If there was an error, we call `reject` on our promise
to execute the falure stack. If there was no error, we continue, do our work, then `resolve` our promise
to execute the success stack, returning the result to each function in that stack.

## Tests

Tests are writting in [Sherlock](http://github.com/logicalparadox/sherlock). Make sure you have that 
installed, clone this repo, install dependacies using `npm install`.

    $ sherlock test/*.test.js

## Contributors

Interested in contributing? Fork to get started. Contact [@logicalparadox](http://github.com/logicalparadox) if you are interested in being a regular contributor.

* Jake Luer [[Github: @logicalparadox](http://github.com/logicalparadox)] [[Twitter: @jakeluer](http://twitter.com/jakeluer)] [[Website](http://alogicalparadox.com)]

## License

(The MIT License)

Copyright (c) 2011 Jake Luer <jake@alogicalparadox.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.