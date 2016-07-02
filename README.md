## Another Promise library targeting ES3


#### Description
This is only an implementation of the then function.<br />
It is written with ES3 syntax.<br />
To ensure asynchronous flow, setTimeout is used.<br />  
Contrary to many other implementations, in this one a promise object only 
exposes status, value and resolve properties. No internal properties are 
exposed. Instead, an enhanced promise object is created for every promise
and a register links the promise to the enhanced promise.<br />
At the moment the register is a simple array and this data structure should
be replaced in a next better performing version.

#### Promises/A+ compliance tests
```
npm run test
```

#### Note
Command used to generate minified file
```
.node_modules/uglify-js/bin/uglifyjs src/promise.js --support-ie8 --compress --output src/promise.min.js
```