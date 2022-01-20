const config = require('../config.json');
const api_key = config.api_key;
const db = require('../model/db.js');
const axios = require("axios");
const fs = require('fs');

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

async function batchGetOrderStatus() {
    const query = db.FILE.find({"status": {"$nin": ["uploaded", "Delivered" ]} });
    let files = await query.exec();
    for(let i=0;i<files.length;i++) {
        let file = files[i];
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
            fs.writeFileSync(`${dir}/transcript.txt`, transcript);
            await file.save(); 
        }
    }
    db.close();
}



batchGetOrderStatus();