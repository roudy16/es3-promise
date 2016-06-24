var promisesAplusTests = require("promises-aplus-tests");

var Promise = require('../src/promise').Promise;

var adapter = {
	resolved: function(value) { return Promise.resolve(value); },
  	rejected: function(reason) { return Promise.reject(reason); },
	deferred: function() {
		var d = {};
		d.promise = new Promise(function(resolve, reject) {
			d.resolve = resolve;
			d.reject = reject;
		});
		return d;
	}
};

promisesAplusTests(adapter, function (err) {
    // All done; output is in the console. Or check `err` for number of failures.
});