## koa-router-cache

Router cache middleware for koa@1.

### Install

```
npm i koa-router-cache --save
```

### Usage

```
cache(app, options)
```

Options:

- key: `{String|GeneratorFunction}` cache key. (Required)
- expire: `{Number}` expire time, in `ms`. (Required)
- get: `{GeneratorFunction}` custom getter function for getting data from cache. (Required)
- set: `{GeneratorFunction}` custom setter function for setting data to cache. (Required)
- passthrough: `{GeneratorFunction}` whether pass request through, return an object. (Required)
  - shouldCache: {Boolean} whether cache this result
  - shouldPass: {Boolean} whether pass this request through
- evtName: `{String}` event name for destroy cache. (Optional)
- destroy: `{function}` destroy cache. (Optional)
- pathToRegexp `{Object}` pathToRegexp options, see `https://github.com/pillarjs/path-to-regexp#usage`. (Optional)

### Example

`koa-router-cache` build-in simple `MemoryCache` and `RedisCache`, also you can write by yourself.

**MemoryCache**

```
'use strict';
 
var app = require('koa')();
var cache = require('koa-router-cache');
var MemoryCache = cache.MemoryCache;
 
var count = 0;
 
app.use(cache(app, {
  'GET /': {
    key: 'cache:index',
    expire: 2 * 1000,
    get: MemoryCache.get,
    set: MemoryCache.set,
    passthrough: MemoryCache.passthrough,
    evtName: 'clearIndexCache',
    destroy: MemoryCache.destroy
  }
}));
 
app.use(function* () {
  if (this.path === '/') {
    this.body = count++;
    if (count === 3) {
      count = 0;
      this.app.emit('clearIndexCache');
    }  
  }
});
 
app.listen(3000, function () {
  console.log('listening on 3000.');
});
```

**RedisCache**

```
'use strict';

var app = require('koa')();
var cache = require('koa-router-cache');
var RedisCache = cache.RedisCache();// or RedisCache(client)

var count = 0;

app.use(cache(app, {
  'GET /': {
    key: 'cache:index',
    expire: 2 * 1000,
    get: RedisCache.get,
    set: RedisCache.set,
    passthrough: RedisCache.passthrough,
    evtName: 'clearIndexCache',
    destroy: RedisCache.destroy
  }
}));

app.use(function* () {
  if (this.path === '/') {
    this.body = {
      count: count++
    };
    if (count === 3) {
      count = 0;
      this.app.emit('clearIndexCache');
    }
  }
});

app.listen(3000, function () {
  console.log('listening on 3000.');
});
```

another usage:

```
// Guests share one index page cache
GET /': {
  key: 'cache:index',
  expire: 10 * 1000,
  get: MemoryCache.get,
  set: MemoryCache.set,
  destroy: MemoryCache.destroy,
  passthrough: function* passthrough(_cache) {
    // Guests
    if (!this.session || !this.session.user) {
      if (_cache == null) {
        return {
          shouldCache: true,
          shouldPass: true
        };
      }
      this.type = 'text/html; charset=utf-8';
      this.set('content-encoding', 'gzip');
      this.body = _cache;
      return {
        shouldCache: true,
        shouldPass: false
      };
    }
    // Logged-in users
    return {
      shouldCache: false,
      shouldPass: true
    };
  }
}
```

### Test

```
npm test
```

### License

MIT