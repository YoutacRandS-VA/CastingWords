const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
app.use(bodyParser());

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

const apiRoute = require('./router/route.js').route;
app.use(apiRoute.middleware());


const server = require('http').createServer(app.callback());
server.listen(3000);


module.exports = {
  app, server
};