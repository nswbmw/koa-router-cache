'use strict';

var app = require('koa')();
var cache = require('../');
var RedisCache = cache.RedisCache();

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
