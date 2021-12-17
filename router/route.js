const router = require('koa-joi-router');
const route = router({
  method: ['GET', 'POST'],
  validate: { type: 'json' },
});
const db = require('../model/db.js');
const utils = require('../utils/utils.js');
const castingwords = require('./castingwords.js');

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

route.get('/list', async (ctx) => {
  try {
    let filesArray = await(await db.FILE.find({})).map(_=>{ return utils.mapper(_)  }).reverse();
    let keys = Object.keys(utils.mapper(Object));
    await ctx.render('list', {'fileList': filesArray, 'keys': keys});
  } catch (e) {
    ctx.body =  {'result':'fail', 'message': e.name};
    ctx.status = 404;
    console.error(e);
  }
});

route.post('/api/submit', async ctx => {
  let file_name = ctx.request.body.file_name;
  let result = await db.FILE.findOne({"file_name": file_name});
  if(result.status!="submitted" && result.order == undefined) {
    result.status = "submitted";
    let order = await castingwords.submit({
      "url": "https://castingwords.peterlee.app/uploads/2021-10-27%20Interview%20with%20Emil%20Elo(2328-2912)__4ab160de3774__2021-10-27%20Interview%20with%20Emil%20Elo(2328-2912)_Audrey%20Tang,Emil%20Elo.mp4",
      "title": result.title,
      "speaker": result.speaker,
      "notes": result.notes,
      "tags": result.tags
    });
    result.order_id = order.order;
    result.order_audiofiles = order.audiofiles;
    result.order_message = order.message;
  }
  await result.save();

  if(file_name && result) {
    ctx.body = {
      "message": "ok"
    };
  }else {
    ctx.body = {
      "message": "fail"
    };
  }
});

route.post(
  '/api/upload',
  upload.fields([
    { name: 'file', maxCount: 1 }
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
        status: 'unprocessed',
        file_name: newFileName,
        file_size: size,
        file_upload_date: new Date()
      })
      await FILE.save();
    }
    ctx.body = {
      'message': `Upload success.\t\ttitle: ${body.title}`
    }
  }
);


exports.route = route;
