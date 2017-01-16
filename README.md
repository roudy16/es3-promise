## Promise library targeting ES3

[!["Promises/A+ logo"](https://promisesaplus.com/assets/logo-small.png "Promises/A+ 1.0 compliant")]("https://promisesaplus.com/")

#### Description
This is simply an implementation of the then function, just for learning.<br />
It is written with ES3 syntax.<br />
setTimeout is used to ensure asynchronous flow.<br />  
Contrary to many other implementations, here a promise object only exposes 
status, value and resolve properties. No internal properties are exposed. 
Instead, an enhanced promise object is created for every promise and a register 
links the promise to its enhanced promise.<br />
At the moment the register is a simple array and this data structure should
be replaced in a future better performing version.

#### Promises/A+ compliance tests
```
npm run test
```

#### Note
Command used to generate minified file
```
.node_modules/uglify-js/bin/uglifyjs src/promise.js --support-ie8 --compress --output src/promise.min.js
```