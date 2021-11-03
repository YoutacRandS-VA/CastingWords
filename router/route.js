const router = require('koa-joi-router');
const route = router({
  method: ['GET', 'POST'],
  validate: { type: 'json' },
});

const fs = require('fs');
const multer = require('@koa/multer');
const upload = multer();

/**
 * async checkAuth
 */
// route.use(async (ctx, next) => {
//   ctx.auth = await auth.checkAuth(ctx);
//   await next();
// });

route.get('/', async (ctx) => {
  try {
    await ctx.render('index');
  } catch (e) {
    ctx.body =  {'result':'fail', 'message': e.name};
    ctx.status = e.status;
  }
});

// add a route for uploading multiple files
route.post(
  '/api/upload',
  upload.fields([
    {
      name: 'multipleFiles',
      maxCount: 10
    }
  ]),
  ctx => {
    console.log('ctx.request.files', ctx.request.files);
    console.log('ctx.files', ctx.files);
    console.log('ctx.request.body', ctx.request.body);
    ctx.body = 'done';
  }
);


exports.route = route;
