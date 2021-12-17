const fs = require('fs');
const moment = require("moment");

function getFileSize(file_name) {
    let fileStat = fs.statSync(`uploads/${file_name}`);
    var fileSizeInMegabytes =  (fileStat.size / (1024*1024)).toFixed(1);
    return fileSizeInMegabytes;
}

function mapper(_) {
    return {
        title: _.title,
        speaker: _.speaker,
        notes: _.notes,
        status: _.status,
        order: JSON.stringify({"id": _.order_id, "audiofiles": _.order_audiofiles, "message": _.order_message}),
        file_name: _.file_name,
        file_size: `${_.file_size}MB`,
        file_upload_date: moment(_.file_upload_date).locale('zh_TW').format('LLLL'),
    };
}

module.exports = {
    getFileSize, mapper
};