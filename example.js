var koa = require('koa');
var route = require('koa-route');
var logger = require('koa-logger');
var cache = require('./');

var count = 0;

var app = koa();

app.use(logger());
app.use(cache(app, {
  '/': 5 * 1000
}));

app.use(route.get('/', function* () {
  this.body = count++;
  if (count === 5) {
    count = 0;
    this.app.emit(this.url);
  }
}));

app.listen(3000, function () {
  console.log('listening on 3000.');
});