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
- condition: function that return boolean, whether to cache this url, default true. (Optional)
- getter: custom getter function for get data from cache. (Optional)
- setter: custom setter function for set data to cache. (Optional)

**Warning**: If you cache `this.body`, make sure `this.body` is not a stream, check for source code how to config `getter` and `setter`.

### Example

```
DEBUG=* node example
```
**example.js**

```
var app = require('koa')();
var cache = require('./');

var count = 0;

app.use(cache(app, {
  '/': 5 * 1000
}));

app.use(function* () {
  this.body = count++;
  if (count === 5) {
    count = 0;
    this.app.emit(this.url);
  }
});

app.listen(3000, function () {
  console.log('listening on 3000.');
});
```

More examples see test.

### Test

```
npm test
```

### License

MIT
