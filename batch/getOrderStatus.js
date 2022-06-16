const config = require('../config.json');
const api_key = config.api_key;
const db = require('../model/db.js');
const bot = require('./bot.js');
const axios = require("axios");
const fs = require('fs');

const mailgun = require('mailgun-js')({apiKey: config.mailgunKey, domain: config.mailgunDomain});

async function getOrderStatus(order_audiofile) {
    return new Promise( (resolve, reject) => {
    const api = `https://castingwords.com/store/API4/audiofile/${order_audiofile}?api_key=${api_key}`;
    axios.get(api)
        .then( (response) => {
            console.log(response.data);
            resolve(response.data.audiofile);
        })
        .catch( (error) => {
            console.log(error.response.data);
            reject(error.response.data);
        });
    });
}

async function getTranscript(order_audiofile) {
    return new Promise( (resolve, reject) => {
    const api = `https://castingwords.com/store/API4/audiofile/${order_audiofile}/transcript.txt?api_key=${api_key}`;
        axios.get(api)
        .then( (response) => {
            resolve(response.data);
        })
        .catch( (error) => {
            console.log(error.response.data);
            reject(error.response.data);
        }); 
    });
}

async function sendEmail(order_id) {

    var data = {
      from: `PDIS <${config.mailgunSender}>`,
      to: config.mailgunTarget,
      cc: config.mailgunCC,
      subject: `資策會CastingWord結報收據-${order_id}`,
      text: `
      您好
      逐字稿訂單編號 ${order_id} 已完成
      該訂單收據可在 ${config.domain}/${order_id}/Order_${order_id}_Receipt_III.html 下載
      逐字稿 ${config.domain}/${order_id}/${order_id}_transcript.txt
      
      感謝
      `
    };
  
    mailgun.messages().send(data, function (error, body) {
      if(error) {
        console.log(error);
      }
      console.log(body);
    });
  }

async function batchGetOrderStatus() {
    try{
        const query = db.FILE.find({"status": {"$nin": ["uploaded", "Delivered" ]} });
        let files = await query.exec();
        for(let i=0;i<files.length;i++) {
            let file = files[i];
            let order_id = file.order_id;
            let order_audiofile  = file.order_audiofiles[0];
            let info = await getOrderStatus(order_audiofile);
            if(info.statename) {
                file.status = info.statename;
                file.order_duration = info.duration;
                file.order_id = String(info.orders);
                await file.save(); 
            }
            if(info.statename=="Delivered") {
                let transcript = await getTranscript(order_audiofile);
                let order_ids = file.order_id.split(",");
                let first_order_id = order_ids.at(-1);
                let dir = `transcript/${first_order_id}`;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                let transcriptPath = `${dir}/${first_order_id}_transcript.txt`;
                if(!fs.existsSync(transcriptPath)) {
                    fs.writeFileSync(transcriptPath, transcript);
                }
                for(let i=0;i<order_ids.length;i++) {
                    let order_id = order_ids[i];
                    let receiptPath = `${dir}/Order_${order_id}_Receipt_III.html`;
                    if(!fs.existsSync(receiptPath)) {
                        await bot.start(order_id, receiptPath);
                    } 
                }
                if(!file.receipt_send) {
                    console.log('will send receipt to email.');
                    await sendEmail(order_id);
                    file.receipt_send = true;
                }
          
                await file.save(); 
            }
        }
        db.close();
    }catch(e) {
        console.error(e);
    }
}



batchGetOrderStatus();
