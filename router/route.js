const router = require('koa-joi-router');
const route = router({
  method: ['GET'],
  validate: { type: 'json' },
});
const fs = require('fs');
const multer = require('@koa/multer');
const upload = multer(); // note you can pass `multer` options here
/**
 * async checkAuth
 */
// route.use(async (ctx, next) => {
//   ctx.auth = await auth.checkAuth(ctx);
//   await next();
// });

route.get('/', async (ctx) => {
  try {
    ctx.body = `
    <form action="/api/upload" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="multipleFiles" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>
  `;
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
