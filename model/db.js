const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/castingwords');

const FILE = mongoose.model('File', { 
    title: String,
    speaker: String,
    notes: String,
    status: String,
    file_name: String,
    file_size: Number,
    file_upload_date: Date
});


module.exports = {
    FILE
};