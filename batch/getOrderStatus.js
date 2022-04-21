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
      to: 'peterlee0127@gmail.com',
      subject: `CastingWord結報收-${order_id}`,
      text: `
      您好

      逐字稿訂單 ${order_id} 已完成
      該訂單收據可在 <a href="${config.domain}/${order_id}/receipt.html">此</a> 下載
      
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
                await file.save(); 
            }
            if(info.statename=="Delivered") {
                let transcript = await getTranscript(order_audiofile);
                let dir = `transcript/${file.order_id}`;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                let transcriptPath = `${dir}/transcript.txt`;
                if(!fs.existsSync(transcriptPath)) {
                    fs.writeFileSync(transcriptPath, transcript);
                }
                let receiptPath = `${dir}/receipt.html`;
                if(!fs.existsSync(receiptPath)) {
                    await bot.start(order_id);
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
