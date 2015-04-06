var koa = require('koa');
var route = require('koa-route');
var request = require('supertest');
var cache = require('..');
var async = require('async');

describe('Test koa-router-cache', function () {

  it('cache / with number expire', function (done) {
    var indexCount = 0;

    var app = koa();
    app.use(cache(app, {
      '/': 2 * 1000
    }));
    app.use(route.get('/', function* () {
      this.type = 'json';
      this.body = String(++indexCount);
      if (indexCount === 2) {
        indexCount = 0;
        this.app.emit(this.url);
      }
    }));

    async.series([
      function (callback) {
        request(app.callback()).get('/').expect(200).expect('Content-Type', /json/).expect("1", callback);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect('Content-Type', /json/).expect("1", callback);
        }, 1000);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect('Content-Type', /json/).expect("2", callback);
        }, 1500);
      },
      function (callback) {
        request(app.callback()).get('/').expect(200).expect('Content-Type', /json/).expect("2", callback);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect('Content-Type', /json/).expect("1", callback);
        }, 2500);
      }
    ], done);
  });

  it('cache / with object options', function (done) {
    var indexCount = 0;

    var app = koa();
    app.use(cache(app, {
      '/': {
        prefix: 'cache_',
        getter: function (cache) {
          var cacheData = cache.get('cache_' + this.url);
          if (cacheData) {
            this.body = cacheData;
            return true;
          }
        },
        setter: function (cache) {
          cache.put('cache_' + this.url, this.response.body, 2 * 1000);
        }
      }
    }));
    app.use(route.get('/', function* () {
      this.body = String(++indexCount);
      if (indexCount === 2) {
        indexCount = 0;
        this.app.emit('cache_' + this.url);
      }
    }));

    async.series([
      function (callback) {
        request(app.callback()).get('/').expect(200).expect('Content-Type', /plain/).expect("1", callback);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect('Content-Type', /plain/).expect("1", callback);
        }, 1000);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect('Content-Type', /plain/).expect("2", callback);
        }, 1500);
      },
      function (callback) {
        request(app.callback()).get('/').expect(200).expect('Content-Type', /plain/).expect("2", callback);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect('Content-Type', /plain/).expect("1", callback);
        }, 2500);
      },
      function (callback) {
        request(app.callback()).get('/').expect(200).expect('Content-Type', /plain/).expect("1", callback);
      }
    ], done);
  });

  it('cache / and /posts', function (done) {
    var indexCount = 0;
    var postsCount = 0;

    var app = koa();
    app.use(cache(app, {
      '/': 2 * 1000,
      '/posts': 2 * 1000
    }));
    app.use(route.get('/', function* () {
      this.body = String(++indexCount);
      if (indexCount === 2) {
        indexCount = 0;
        this.app.emit(this.url);
      }
    }));

    app.use(route.get('/posts', function* () {
      this.body = String(++postsCount);
      if (postsCount === 3) {
        postsCount = 0;
        this.app.emit(this.url);
      }
    }));

    async.series([
      function (callback) {
        request(app.callback()).get('/').expect(200).expect('Content-Type', /plain/).expect("1", callback);
      },
      function (callback) {
        request(app.callback()).get('/posts').expect(200).expect('Content-Type', /plain/).expect("1", callback);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect('Content-Type', /plain/).expect("1", callback);
        }, 1000);
      },
      function (callback) {
        request(app.callback()).get('/posts').expect(200).expect('Content-Type', /plain/).expect("1", callback);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect('Content-Type', /plain/).expect("2", callback);
        }, 1500);
      },
      function (callback) {
        request(app.callback()).get('/posts').expect(200).expect('Content-Type', /plain/).expect("2", callback);
      },
      function (callback) {
        request(app.callback()).get('/').expect(200).expect('Content-Type', /plain/).expect("2", callback);
      },
      function (callback) {
        request(app.callback()).get('/posts').expect(200).expect('Content-Type', /plain/).expect("2", callback);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect('Content-Type', /plain/).expect("1", callback);
        }, 2500);
      },
      function (callback) {
        request(app.callback()).get('/posts').expect(200).expect('Content-Type', /plain/).expect("3", callback);
      },
      function (callback) {
        request(app.callback()).get('/').expect(200).expect('Content-Type', /plain/).expect("1", callback);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/posts').expect(200).expect('Content-Type', /plain/).expect("1", callback);
        }, 2500);
      }
    ], done);
  });

  it('not cache /', function (done) {
    var indexCount = 0;

    var app = koa();
    app.use(cache(app, {
      '/': {
        expire: 2 * 1000,
        condition: function () {
          return this.session && this.session.user;
        }
      }
    }));
    app.use(route.get('/', function* () {
      this.type = 'json';
      this.body = String(++indexCount);
      if (indexCount === 2) {
        indexCount = 0;
        this.app.emit(this.url);
      }
    }));

    async.series([
      function (callback) {
        request(app.callback()).get('/').expect(200).expect('Content-Type', /json/).expect("1", callback);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect('Content-Type', /json/).expect("2", callback);
        }, 1000);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect('Content-Type', /json/).expect("1", callback);
        }, 1500);
      },
      function (callback) {
        request(app.callback()).get('/').expect(200).expect('Content-Type', /json/).expect("2", callback);
      },
      function (callback) {
        setTimeout(function () {
          request(app.callback()).get('/').expect(200).expect('Content-Type', /json/).expect("1", callback);
        }, 2500);
      }
    ], done);
  });
});