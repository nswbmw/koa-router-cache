var _cache = require('memory-cache');

var defaultResponseKeys = ['header', 'body'];

module.exports = function (app, opts) {
  opts = opts || {};

  for (var url in opts) {
    if ('number' === typeof opts[url]) {
      opts[url] = {expire: opts[url]};
    }
    opts[url].getter = ('function' === typeof opts[url].getter) ? opts[url].getter : defaultCacheGet;
    opts[url].setter = ('function' === typeof opts[url].setter) ? opts[url].setter : defaultCacheSet;

    var evtName = (opts[url].prefix || '') + url;
    app.on(evtName, function () {
      _cache.del(url);
    });
  }

  return function *cache(next) {
    var url = this.url;
    var method = this.method;

    if ((method === 'GET') && (url in opts) && (('function' === typeof opts[url].condition) ? opts[url].condition.call(this) : true)) {
      var fresh = opts[url].getter.call(this, _cache);
      if (fresh) return;

      yield* next;

      if (this.status === 200) {
        opts[url].setter.call(this, _cache, opts[url].expire);
      }
    } else {
      yield* next;
    }
  };
};

/**
 * defaultCacheGet
 *
 * @param {Object} cache
 * @return {Boolean}
 * @api private
 */

function defaultCacheGet(cache) {
  var cacheData = cache.get(this.url);
  if (cacheData) {
    for (var key in cacheData) {
      var value = cacheData[key];
      if (key === 'header') {
        for (var header in value) {
          this.set(header, value[header]);
        }
      } else {
        this[key] = value;
      }
    }
    return true;
  }
}

/**
 * defaultCacheSet
 *
 * @param {Object} cache
 * @param {Number} expire
 * @api private
 */

function defaultCacheSet(cache, expire) {
  var response = this.response;
  var _response = {};
  for (var key in response) {
    if (~defaultResponseKeys.indexOf(key)) {
      _response[key] = response[key];
    }
  }
  cache.put(this.url, _response, expire);
}