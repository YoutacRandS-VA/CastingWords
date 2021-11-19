const fs = require('fs');

function getFileSize(file_name) {
    let fileStat = fs.statSync(`uploads/${file_name}`);
    var fileSizeInMegabytes =  (fileStat.size / (1024*1024)).toFixed(1);
    return fileSizeInMegabytes;
}

module.exports = {
    getFileSize
};