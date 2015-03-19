## koa-router-cache

Router cache middleware for koa. Useful for caching some pages like `/`.

### Install

```
npm i koa-router-cache --save
```

### Usage

```
cache(app, options)
```

Options {Object|Number->expire}:

- expire: expire time, use `ms`. (Required)
- prefix: event listener prefix for deleting the router cache. (Optional)
- get: custom getter function for get data from cache. (Optional)
- set: custom setter function for set data to cache. (Optional)

**Warning**: If you cache `this.body`, make sure `this.body` is not a stream, check for source code how to config `get` and `set`.

### Example

```
DEBUG=* node example
```
**example.js**

```
var koa = require('koa');
var route = require('koa-route');
var logger = require('koa-logger');
var cache = require('./');

var count = 0;

var app = koa();

app.use(logger());
app.use(cache(app, {
  '/': 5 * 1000
}));

app.use(route.get('/', function* () {
  this.body = count++;
  if (count === 5) {
    count = 0;
    this.app.emit(this.url);
  }
}));

app.listen(3000, function () {
  console.log('listening on 3000.');
});
```

### Test

```
npm test
```

### License

MIT
