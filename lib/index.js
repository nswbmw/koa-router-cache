'use strict';

let ms = require('ms');
let pathToRegexp = require('path-to-regexp');
let isGeneratorFn = require('is-generator').fn;

module.exports = function (app, opts) {
  opts = opts || {};

  for (let url in opts) {
    let urlConf = opts[url];
    if (!(isGeneratorFn(urlConf.key) || ('string' === typeof urlConf.key))) {
      throw new Error('`key` must be string or generatorFunction!');
    }
    if (!isGeneratorFn(urlConf.get) || !isGeneratorFn(urlConf.set) || !isGeneratorFn(urlConf.passthrough)) {
      throw new Error('`get` or `set` or `passthrough` must be generatorFunction!');
    }
    if (urlConf.evtName) {
      if ('string' !== typeof urlConf.evtName) {
        throw new Error('`evtName` must be string!');
      }
      if ('function' !== typeof urlConf.destroy) {
        throw new Error('`destroy` must be function!');
      }
    }

    urlConf._compilePathToRegexp = pathToRegexp(url, [], urlConf.pathToRegexp);
    opts[url] = urlConf;
    
    if (urlConf.evtName) {
      app.on(urlConf.evtName, function () {
        var args = [].slice.call(arguments);
        urlConf.destroy.apply(app, [urlConf.key].concat(args));
      });
    }
  }

  return function *cache(next) {
    let path = this.path;
    let method = this.method;

    for (let i in opts) {
      if (opts[i]._compilePathToRegexp.test(method + ' ' + path)) {
        let key = ('string' === typeof opts[i].key) ? opts[i].key : (yield* opts[i].key.call(this));
        
        var _cache = yield* opts[i].get.call(this, key);
        var cond = yield* opts[i].passthrough.call(this, _cache);
        if (cond.shouldCache && !cond.shouldPass) {
          return;
        }

        yield* next;

        if (cond.shouldCache && this.status === 200) {
          yield* opts[i].set.call(this, key, this.body, ms(opts[i].expire + ''));
        }

        return;
      }
    }

    yield* next;
  };
};

module.exports.MemoryCache = require('./memory_cache');
module.exports.RedisCache = require('./redis_cache');
