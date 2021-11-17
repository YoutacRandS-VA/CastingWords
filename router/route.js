const router = require('koa-joi-router');
const route = router({
  method: ['GET', 'POST'],
  validate: { type: 'json' },
});

const fs = require('fs');
const multer = require('@koa/multer');
const upload = multer({ dest: 'uploads/' });

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

route.get('/list', async (ctx) => {
  try {
    const files = fs.readdirSync('uploads').filter(_=>_!='.DS_Store');
    const filesArray = [];
    for(let i=0;i<files.length;i++) {
      let file = files[i];
      let fileStat = fs.statSync(`uploads/${file}`);
      var fileSizeInMegabytes =  (fileStat.size / (1024*1024)).toFixed(1);
      let fileSize = `${fileSizeInMegabytes} MB`;
      if(fileSizeInMegabytes>1000) {
        let gb = (fileSizeInMegabytes/1024).toFixed(1);
        fileSize = `${gb} GB`; 
      }
      filesArray.push({
        'name': file,
        'size': fileSize,
        'create_date': fileStat.birthtime
      });
    }
    await ctx.render('list', {'fileList': filesArray});
  } catch (e) {
    ctx.body =  {'result':'fail', 'message': e.name};
    ctx.status = 404;
  }
});

route.post(
  '/api/upload',
  upload.fields([
    {
      name: 'file',
      maxCount: 1
    }
  ]),
  ctx => {
    let body = ctx.request.body;
    let files = ctx.files.file;
    for(let i=0;i<files.length;i++){
      let file = files[i];
      fs.renameSync(`uploads/${file.filename}`, `uploads/${file.originalname}`)
    }
    ctx.body = {
      'message': 'Upload success.'
    }
  }
);


exports.route = route;
