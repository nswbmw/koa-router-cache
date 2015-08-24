'use strict';

var koa = require('koa');
var request = require('supertest');
var async = require('async');

var cache = require('..');
var MemoryCache = cache.MemoryCache;
var RedisCache = cache.RedisCache();

describe('Test koa-router-cache', function () {
  it('memory cache', function (done) {
    var count = 0;

    var app = koa();
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

    async.series([
      function (callback) {
        request(app.callback()).get('/').expect(200).expect("0", callback);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect("0", callback);
        }, 1000);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect("1", callback);
        }, 1500);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect("1", callback);
        }, 1000);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect("2", callback);
        }, 1500);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect("2", callback);
        }, 1000);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect("0", callback);
        }, 1500);
      }
    ], done);
  });

  it('redis cache', function (done) {
    var count = 0;

    var app = koa();
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

    async.series([
      function (callback) {
        request(app.callback()).get('/').expect(200).end(function (err, res) {
          if (err) return callback(err);
          if (!res.body || res.body.count !== 0) {
            return callback('count should be 0');
          }
          callback();
        });
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).end(function (err, res) {
            if (err) return callback(err);
            if (!res.body || res.body.count !== 0) {
              return callback('count should be 0');
            }
            callback();
          });
        }, 1000);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).end(function (err, res) {
            if (err) return callback(err);
            if (!res.body || res.body.count !== 1) {
              return callback('count should be 1');
            }
            callback();
          });
        }, 1500);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).end(function (err, res) {
            if (err) return callback(err);
            if (!res.body || res.body.count !== 1) {
              return callback('count should be 1');
            }
            callback();
          });
        }, 1000);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).end(function (err, res) {
            if (err) return callback(err);
            if (!res.body || res.body.count !== 2) {
              return callback('count should be 2');
            }
            callback();
          });
        }, 1500);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).end(function (err, res) {
            if (err) return callback(err);
            if (!res.body || res.body.count !== 2) {
              return callback('count should be 2');
            }
            callback();
          });
        }, 1000);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).end(function (err, res) {
            if (err) return callback(err);
            if (!res.body || res.body.count !== 0) {
              return callback('count should be 0');
            }
            callback();
          });
        }, 1500);
      }
    ], done);
  });
});