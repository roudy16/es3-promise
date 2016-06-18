function P(execute) {

	if (!(this instanceof P)) 
		throw new Error('new keyword required when invoking Promise constructor');

	if (!execute || typeof execute !== 'function')
		throw new Error('Promise constructor needs one argument and it must be a function');

	if (arguments.length > 1)
		console.log('Promise constructor needs only one argument, the others are ignored');

	this.state = 'pending';
	this.value = undefined;

	var internals = this._internals = {
		resolve: undefined,
		reject: undefined
	}

	console.log(this);

	setTimeout(function() {
		execute.apply(null, [ internals.resolve, internals.reject ]);
	}, 0);

}

function then(onFulfillment, onRejection) {

	var promise = this;
	var internals = promise._internals;

	if (onFulfillment && typeof onFulfillment === 'function') {
		internals.resolve = function() {
			delete promise._internals;
			promise.state = 'fulfilled';
			promise.value = onFulfillment.apply(null, Array.prototype.slice.call(arguments));	
			console.log(promise);
		}
		return;
	}

	if (onRejection && typeof onRejection === 'function') {
		internals.reject = function() {
			delete promise._internals;
			promise.state = 'rejected';
			promise.reason = onRejection.apply(null, Array.prototype.slice.call(arguments));
		}
		return;
	}

}

P.prototype.constructor = P;
P.prototype.then = then;



var p = new P(function(resolve, reject) {
	console.log(this);
	setTimeout(function() {
		//console.log(this);
		//console.log(resolve);
		resolve && resolve("resolve");
	}, 1000);
});
p.then(function(data) {
	return data;
});