const mongoose = require('mongoose');
let mongodbURI = "mongodb://mongo-service:27017/castingwords"
if(process.env.NODE_ENV!="production") {
    mongodbURI = "mongodb://localhost:27017/castingwords";
}
mongoose.connect(mongodbURI);

const FILE = mongoose.model('File', { 
    title: String,
    speaker: String,
    notes: String,
    status: String,
    file_name: String,
    file_size: Number,
    file_upload_date: Date,
    speed_level: String,
    order_id: String,
    order_audiofiles: [Number],
    order_message: String
});


module.exports = {
    FILE
};