const router = require('koa-joi-router');
const route = router({
  method: ['GET', 'POST'],
  validate: { type: 'json' },
});
const db = require('../model/db.js');
const utils = require('../utils/utils.js');

const fs = require('fs');
const multer = require('@koa/multer');
const upload = multer({ dest: 'uploads/' });
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
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


function mapper(_) {
  return {
    title: _.title,
    speaker: _.speaker,
    notes: _.notes,
    status: _.status,
    file_name: _.file_name,
    file_size: `${_.file_size}MB`,
    file_upload_date: moment(_.file_upload_date).locale('zh_TW').format('LLLL'),
  };
}

route.get('/list', async (ctx) => {
  try {
 
    let filesArray = await(await db.FILE.find({})).map(_=>{ return mapper(_)  }).reverse();
    let keys = Object.keys(mapper(Object));

    await ctx.render('list', {'fileList': filesArray, 'keys': keys});
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
  async ctx => {
    let body = ctx.request.body;
    let files = ctx.files.file;
    for(let i=0;i<files.length;i++){
      let file = files[i];
      let originalFileName = file.originalname;
      let uuid = uuidv4().split("-").pop();
      let newFileName = `${body.title}__${uuid}__${originalFileName}`;
      fs.renameSync(`uploads/${file.filename}`, `uploads/${newFileName}`);
      let size = utils.getFileSize(newFileName);
      const FILE = new db.FILE({
        title: body.title,
        speaker: body.speaker,
        notes: body.notes,
        status: 'upload',
        file_name: newFileName,
        file_size: size,
        file_upload_date: new Date()
      })
      await FILE.save();
    }
    ctx.body = {
      'message': 'Upload success.'
    }
  }
);


exports.route = route;
