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

const environment = process.env.NODE_ENV!="production"? "development":"production";


route.get('/', async (ctx) => {
  try {
    await ctx.render('index', {'environment': environment, 'listPage': false});
  } catch (e) {
    ctx.body =  {'result':'fail', 'message': e.name};
    ctx.status = e.status;
  }
});


route.get('/list', async (ctx) => {
  try {
    let filesArray = await(await db.FILE.find({})).map(_=>{ return utils.mapper(_)  }).reverse();
    let keys = Object.keys(utils.mapper(Object));
    await ctx.render('list', {'fileList': filesArray, 'keys': keys, 'environment': environment, 'listPage': true});
  } catch (e) {
    ctx.body =  {'result':'fail', 'message': e.name};
    ctx.status = 404;
    console.error(e);
  }
});

route.get('/api/transcript/:orderId', async (ctx) => {
  try {
    let orderId = ctx.params.orderId;
    let result = await db.FILE.find({"order_id": orderId}, "transcript");
    let fileStr = Buffer.from(result).toString();
    fs.writeFileSync(`${orderId}.txt`, fileStr);
    return ctx.attachment(`${orderId}.txt`, { type: 'inline' });

  } catch (e) {
    ctx.body =  {'result':'fail', 'message': e.name};
    ctx.status = 404;
    console.error(e);
  }
});

route.post('/api/submit', async ctx => {
  try{
  
  let file_name = ctx.request.body.file_name;
  let is_video_url = false;
  if(file_name.includes("http")) {
    is_video_url = true;
  }
  let result = await db.FILE.findOne({"file_name": file_name});
  if(result.status=="uploaded" && result.order_id == undefined) {
    result.status = "submitted";
    let url = result.video_url;
    if(!is_video_url) {
      let file_path = encodeURI(file_name);
      url = `https://castingwords.pdis.dev/uploads/${file_path}`;
    }
    let order = await castingwords.submit({
      "url": url,
      "title": result.title,
      "names": result.speaker.split(","),
      "notes": result.notes,
      "sku": result.speed_level
    });
    result.order_id = order.order;
    result.order_audiofiles = order.audiofiles;
    result.order_message = order.message;
    if(!fs.existsSync(`transcript/${result.order_id}`)) {
      fs.mkdirSync(`transcript/${result.order_id}`);
    }
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
  }catch(e) {
    ctx.body = {
      "message": e
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

    if(ctx.files) {
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
          speed_level: body.speed_level,
          status: 'uploaded',
          file_name: newFileName,
          file_size: size,
          file_upload_date: new Date()
        })
        await FILE.save();
      }
      ctx.body = {
        'message': `Upload success.\ttitle: ${body.title}`
      }
    }else {
      // video_url upload
      let video_url = body.video_url;
      if(!utils.videoURLValider(video_url)) {
        ctx.body = {
          'result': 'fail', 
          'message': `Upload fail. video_url is invalid.`
        }
        return; 
      }
      let result = await db.FILE.findOne({"file_name": video_url});
      if(result) {
        ctx.body = {
          'message': `Upload success. video_url exists.`
        }
      }

      const FILE = new db.FILE({
        title: body.title,
        speaker: body.speaker,
        notes: body.notes,
        speed_level: body.speed_level,
        status: 'uploaded',
        video_url: video_url,
        file_name: video_url,
        file_upload_date: new Date()
      })
      await FILE.save();
      if(!result) {
        ctx.body = {
          'message': `Upload success.\ttitle: ${body.title}`
        }
      }
    }
   
  }
);


exports.route = route;
