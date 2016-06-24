module.exports = (function(global) {

	var PENDING = 'pending';
	var FULFILLED = 'fulfilled';
	var REJECTED = 'rejected';

	var id = 0;

	function emptyFn() {}
	function isFn(fn) { return fn && typeof fn === 'function'; }

	function isPending(promise) { return promise.state === PENDING; }
	function isFulfilled(promise) { return promise.state === FULFILLED; }
	function isRejected(promise) { return promise.state === REJECTED; }

	function resolveFn(promise) {
		return function (value) {
			// 2.1.2.1: When fulfilled, a promise: must not transition to any 
			// other state.
			if (isPending(promise)) {
				promise.state = FULFILLED;
				promise.value = value;
				cache.clean(promise, enhanced[FULFILLED]);
			}
		};
	}

	function rejectFn(promise) {
		return function (reason) {
			// 2.1.3.1: When rejected, a promise: must not transition to any 
			// other state.
			if (isPending(promise)) {
				promise.state = REJECTED;
				promise.reason = reason;
				cache.clean(promise, enhanced[REJECTED]);
			}
		};
	}

	var enhanced = {};
	enhanced[FULFILLED] = {
		state: FULFILLED,
		otherState: REJECTED,
		isStateFn: isFulfilled,
		execFn: resolveFn,
		dataName: 'value'
	};
	enhanced[REJECTED] = {
		state: REJECTED,
		otherState: FULFILLED,
		isStateFn: isRejected,
		execFn: rejectFn,
		dataName: 'reason'
	}

	var cache = (function() {

		var map = {};

		function registerPromise(promise, resolve, reject) {
			// register the promise into a map
			// the key is the promise itself
			map[promise] = {
				// promise itself whose state can change
				promise: promise,
				// resolve function
				resolve: resolve,
				// reject function
				reject: reject,
				// then stack { onFulfillment, nextPromise returned by then }
				onfulfilled : [],
				// then stack { onRejection, nextPromise returned by then }
				onrejected: []
			};
		}

		function registerThen(promise, nextPromise, onFulfillment, onRejection) {

			promise.a && console.log(promise.ID, map[promise].promise);

			// update the promise property in the map - its state may have 
			// changed
			map[promise].promise = promise;

			// register the onFulfillment callback in its stack, with the 
			// nextPromise by the then function
			map[promise].onfulfilled.push({
				nextPromise: nextPromise,
				callback: onFulfillment
			});

			// register the onRejection callback in its stack, with the 
			// nextPromise by the then function
			map[promise].onrejected.push({
				nextPromise: nextPromise,
				callback: onRejection
			});

			// if the promise is already fulfilled
			if (isFulfilled(promise)) {
				// execute all the onFulfilled callbacks register within the
				// various then calls
				clean(promise, enhanced[FULFILLED]);

			} else if (isRejected(promise)) {
				// execute all the onRejected callbacks register within the
				// various then calls				
				clean(promise, enhanced[REJECTED]);

			}
		}		

		function clean(promise, o) {

			// if the promise is not pending
			// then it's either resolved or rejected
			if (o.isStateFn(promise)) {
				// the registered object mapped to the promise
				var registeredPromise = map[promise];
				// the then stacked based on the promise state
				var stack = registeredPromise['on' + o.state];

				// while there are elements in the stack
				while (stack.length) {

					// 2.2.2: If `onFulfilled` is a function
					// 2.2.2.3: it must not be called more than once.
					// remove the first element of the stack
					// then calls are handled on registering order
					var element = stack.shift();

					// the nextPromise returned by the specific then
					var nextPromise = element.nextPromise;
					// the then callback (onFulfillment or onRejection)
					var callback = element.callback;
					// the data of the promise (value or reason)
					var data = promise[o.dataName];

					// 2.2.1: Both `onFulfilled` and `onRejected` are optional 
					// arguments.
					// 2.2.1.1: If `onFulfilled` is not a function, it must be 
					// ignored.
					// 2.2.1.2: If `onRejected` is not a function, it must be 
					// ignored.

					if (isFn(callback)) {

						// 2.2.4: `onFulfilled` or `onRejected` must not be 
						// called until the execution context stack contains 
						// only platform code.
						setTimeout(function() {

							// 2.2.2: If `onFulfilled` is a function
							// 2.2.2.1: it must be called after `promise` is 
							// fulfilled, with `promise`’s fulfillment value 
							// as its first argument.
            				// 2.2.2.2: it must not be called before `promise` 
            				// is fulfilled
							// 2.2.3: If `onRejected` is a function,
							// 2.2.3.1: it must be called after `promise` is 
							// rejected, with `promise`’s rejection reason as 
							// its first argument.
            				// 2.2.3.2: it must not be called before `promise` 
            				// is rejected
            				// 2.2.3.3: it must not be called more than once.
							// be careful here, callback can be asynchronous

							// 2.2.5 `onFulfilled` and `onRejected` must be 
							// called as functions (i.e. with no `this` value).
							// -> thus the apply with undefined as context
							callback.apply(undefined, [ data ]);
						}, 0);
 
					} else {
						// resolve / reject the nextPromise
						// with the value / reason of the invoking promise
						o.execFn(nextPromise)(data);
					}
				}
				// clear the other stack
				registeredPromise['on' + o.otherState] = [];
			}
		}	
				
		return {
			clean: clean,
			registerPromise: registerPromise,
			registerThen: registerThen,
			map: map
		};

	})();

	function Promise(executor) {

		if (!(this instanceof Promise)) 
			throw new Error('TypeError: Not enough arguments to Promise.');

		if (!executor || typeof executor !== 'function')
			throw new Error('TypeError: Argument 1 of Promise.constructor is not an object.');

		this.state = PENDING;

		this.ID = ++id;

		var resolve = resolveFn(this);
		var reject = rejectFn(this);

		cache.registerPromise(this, resolve, reject);

		executor.apply(undefined, [ resolve, reject ]);

	}

	function resolve(value) {
		var promise = new Promise(emptyFn);
		resolveFn(promise)(value);
		return promise;
	}

	function reject(reason) {
		var promise = new Promise(emptyFn);
		rejectFn(promise)(reason);
		return promise;
	}

	function then(onFulfillment, onRejection) {

		var promise = this;
		var nextPromise = new Promise(emptyFn);

		// 2.2.1: Both `onFulfilled` and `onRejected` are optional arguments.
		// 2.2.1.1: If `onFulfilled` is not a function, it must be ignored.
		// 2.2.1.2: If `onRejected` is not a function, it must be ignored.
		cache.registerThen(promise, nextPromise, onFulfillment, onRejection);

		// 2.2.7: `then` must return a promise: 
		// `promise2 = promise1.then(onFulfilled, onRejected)`
		return nextPromise;

	}

	Promise.resolve = resolve;
	Promise.reject = reject;

	Promise.prototype.then = then;

	return { 
		Promise: Promise
	};

})(global);