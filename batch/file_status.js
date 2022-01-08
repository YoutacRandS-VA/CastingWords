const config = require('../config.json');
const api_key = config.api_key;
const db = require('../model/db.js');
const axios = require("axios");

async function get_file_status(order_audiofiles) {
    return new Promise( (resolve, reject) => {
    const api = `https://castingwords.com/store/API4/audiofile/${order_audiofiles}?api_key=${api_key}`;
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

async function load_file_status() {
    const query = db.FILE.find({"status": {"$nin": ["uploaded", "Delivered" ]} });
    let files = await query.exec();
    for(let i=0;i<files.length;i++) {
        let file = files[i];
        let order_audiofile  = file.order_audiofiles[0];
        let info = await get_file_status(order_audiofile);
        if(info.statename) {
            file.status = info.statename;
            file.order_duration = info.duration;
            await file.save(); 
        }
    }
    db.close();
}

load_file_status();