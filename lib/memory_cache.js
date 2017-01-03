'use strict';

var MemoryCache = require('memory-cache');
var debug = require('debug')('koa-router-cache:memory_cache');

module.exports = {
  get: function* (key) {
    var value = MemoryCache.get(key);
    debug('get %s -> %j', key, value);

    return value;
  },
  set: function* (key, value, expire) {
    MemoryCache.put(key, value, expire);
    debug('set %s: %j, %s ms', key, value, expire);
  },
  destroy: function (key) {
    MemoryCache.del(key);
    debug('destroy %s', key);
  },
  passthrough: function* (_cache) {
    if (_cache == null) {
      return {
        shouldCache: true,
        shouldPass: true
      };
    }
    this.body = _cache;
    return {
      shouldCache: true,
      shouldPass: false
    };
  }
};
