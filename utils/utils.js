const fs = require('fs');
const moment = require("moment");
const axios = require('axios');

function getFileSize(file_name) {
    let fileStat = fs.statSync(`uploads/${file_name}`);
    var fileSizeInMegabytes =  (fileStat.size / (1024*1024)).toFixed(1);
    return fileSizeInMegabytes;
}

function mapper(_) {
    let file_size_str = ''
    if(_.file_size) {
        file_size_str = `${_.file_size} MB`;
    }
    let file_url_str = `/uploads/${_.file_name}`
    if(_.video_url) {
        file_url_str = _.video_url;
    }
    let order_date = _.order_date;
    if(order_date) {
      order_date = moment(_.order_date).locale('zh_TW').format('LLLL');
    }
    let price = "";
    if(_.order_duration!=undefined && _.speed_level!=undefined) {
        speed_price = {
            "TRANS14": 1,
            "TRANS6": 1.5,
            "TRANS2": 2.5,
        }
        price = _.order_duration * speed_price[_.speed_level];
    }
    let order_id = _.order_id;
    let first_order_id = undefined;
    if(order_id!=undefined) {
        order_id = String(_.order_id).split(",");
        first_order_id = order_id.at(-1); 
    }
    
    return {
        file_id: _.id,
        title: _.title,
        speaker: _.speaker,
        notes: _.notes,
        file_url: file_url_str,
        file_size: file_size_str,
        file_upload_date: moment(_.file_upload_date).locale('zh_TW').format('LLLL'),
        order_date: order_date,
        first_order_id: first_order_id,
        order_id: order_id,
        audiofiles: _.order_audiofiles,
        duration: (_.order_duration)?_.order_duration+" min":"",
        speed_level: _.speed_level,
        price: price,
        status: _.status,
    };
}

function videoURLValider(url) {
    console.log(url);
    let valid = true;
    if(!url.includes('https')) {
        valid = false;
    }
    if(!url.includes('youtu')) {
        valid = false;
    }
    return valid;
}

async function getVideoRealURL(url) {
    return axios.get(url).then( response=> {
        return response.request.res.responseUrl;
    });
}



module.exports = {
    getFileSize, mapper, videoURLValider, getVideoRealURL
};