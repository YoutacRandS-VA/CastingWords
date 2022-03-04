const fs = require('fs');
const moment = require("moment");

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
    return {
        title: _.title,
        speaker: _.speaker,
        notes: _.notes,
        file_name: _.file_name,
        file_url: file_url_str,
        file_upload_date: moment(_.file_upload_date).locale('zh_TW').format('LLLL'),
        file_size: file_size_str,
        order_id:  _.order_id,
        audiofiles: _.order_audiofiles,
        duration: (_.order_duration)?_.order_duration+" min":"",
        speed_level: _.speed_level,
        status: _.status,
    };
}

function videoURLValider(url) {
    console.log(url);
    let valid = true;
    if(!url.includes('https')) {
        valid = false;
    }
    if(!url.includes('youtube')) {
        valid = false;
    }
    return valid;
}   

function getVideoURL(url) {
  

}


module.exports = {
    getFileSize, mapper, videoURLValider
};
