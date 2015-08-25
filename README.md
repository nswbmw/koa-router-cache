## koa-router-cache

Router cache middleware for koa.

### Release notes

koa-router-cache v1.0.0 released, v0.3.0 readme see [v0.3.0_README.md](https://github.com/nswbmw/koa-router-cache/blob/master/v0.3.0_README.md).

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
- passthrough: `{GeneratorFunction}` whether pass request through, return `Boolean`. (Required)
- evtName: `{String}` event name for destroy cache. (Optional)
- destroy: `{function}` destroy cache. (Optional)
- pathToRegexp `{Object}` pathToRegexp options, see `https://github.com/pillarjs/path-to-regexp#usage`. (Optional)

### Example

`koa-router-cache` build-in simple `MemoryCache` and `RedisCache`, also you can write by yourself.

**MemoryCache**

```
'use strict';

var app = require('koa')();
var cache = require('../');
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
  this.body = count++;
  if (count === 3) {
    count = 0;
    this.app.emit('clearIndexCache');
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
var cache = require('../');
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
  this.body = {
    count: count++
  };
  if (count === 3) {
    count = 0;
    this.app.emit('clearIndexCache');
  }
});

app.listen(3000, function () {
  console.log('listening on 3000.');
});
```

another usage:

```
// find users by uids
'POST /uids': {
  key: function* () {
    return this.url;
  },
  expire: 5 * 60 * 1000,
  get: function* (key) {
    var body = this.request.body;
    var pass = [];
    var self = this;
    self._body = [];
    yield body.map(function* (uid) {
      var user = yield redis.get(key + ':' + uid);
      if (user) {
        self._body.push(JSON.parse(user));
      } else {
        pass.push(uid);
      }
    });
    debug('get %s -> %j', key, this._body);

    return pass;
  },
  passthrough: function* (pass) {
    if (!pass.length) {
      this.body = this._body;
      return false;
    }
    debug('pass -> %j', pass);
    this.request.body = pass;

    return true;
  },
  set: function* (key, value, expire) {
    yield value.map(function* (user) {
      yield redis.set(key + ':' + user._id, JSON.stringify(user), 'PX', expire);
    });
    debug('set %s: %j, %s ms', key, value, expire);
    this.body = this._body.concat(this.body);
  }
}
```

### Test

```
npm test
```

### License

MIT