const mongoose = require('mongoose');
let mongodbURI = "mongodb://mongo-service:27017/castingwords"
if(!process.env.IN_DOCKER) {
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
    video_url: String, 
    file_upload_date: Date,
    speed_level: String,
    receipt_send: Boolean,
    order_date: Date,
    order_id: String,
    order_audiofiles: [Number],
    order_message: String,
    order_duration: Number,
});

function close() {
    mongoose.disconnect();
}

module.exports = {
    FILE, close
};