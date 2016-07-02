var promisesAplusTests = require("promises-aplus-tests");
var fs = require('fs');
var path = require('path');

var root = path.resolve(__dirname, '../') + '/';

var data = fs.readFileSync(root + 'src/promise.js', 'utf-8');
var module = 'module.exports = ' + data.slice(1);
var moduleFileName = root + 'test/promise.module.js';

fs.writeFileSync(moduleFileName, module);

var Promise = require(moduleFileName).Promise;

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

fs.unlink(moduleFileName, (err) => { if (err) throw err; });