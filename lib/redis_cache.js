'use strict';

var debug = require('debug')('koa-generic-cache:redis_cache');
var Redis = require('ioredis');
var redis = new Redis();

redis.on('error', function () {
  console.warn('Please start redis-server...');
});

module.exports = {
  get: function* (key) {
    var value = yield redis.get(key);
    debug('get %s -> %j', key, value);

    return JSON.parse(value);
  },
  set: function* (key, value, expire) {
    yield redis.psetex(key, expire, JSON.stringify(value));

    debug('set %s: %j, %s ms', key, value, expire);
  },
  destroy: function (key) {
    redis.del(key);
    debug('destroy %s', key);
  }
};
