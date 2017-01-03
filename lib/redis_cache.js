'use strict';

var debug = require('debug')('koa-router-cache:redis_cache');

module.exports = function (client) {
  if (!client) {
    client = new require('ioredis')();
    client.on('error', function () {
      console.warn('Please start redis-server...');
    });
  }
  return {
    get: function* (key) {
      var value = yield client.get(key);
      debug('get %s -> %j', key, value);

      return JSON.parse(value);
    },
    set: function* (key, value, expire) {
      yield client.psetex(key, expire, JSON.stringify(value));

      debug('set %s: %j, %s ms', key, value, expire);
    },
    destroy: function (key) {
      client.del(key);
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
};
