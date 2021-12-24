const axios = require("axios");
const api_key = require("./../config.json").api_key;

async function submit(payload){
    return new Promise( (resolve, reject) => {
    //   curl --data \
    //   '{"api_key":[CW_API_KEY],
    //     "url":[AUDIO_FILE_URL],
    //         "title":[TRANSCRIPT_TITLE],
    //         "names":[ARRAY_OF_SPEAKER_NAMES],
    //         "notes":[SOME_NOTES],
    //         "tags":"Interview"
    //    }' \
    const api = "https://castingwords.com/store/API4/order_url";
    let body = payload;
    body.api_key = api_key;
    body.tags = "Interview";
    if(process.env.NODE_ENV!="production") {
        file_path = "https://castingwords.peterlee.app/uploads/2021-10-27%20Interview%20with%20Emil%20Elo(2328-2912)__4ab160de3774__2021-10-27%20Interview%20with%20Emil%20Elo(2328-2912)_Audrey%20Tang,Emil%20Elo.mp4";
        body.test = 1;
    }
    console.log(body);
    axios.post(api, body)
        .then( (response) => {
            console.log(response.data);
            resolve(response.data);
        })
        .catch( (error) => {
            console.log(error.response.data);
            reject(error.response.data);
        });
    });
}

async function listJobs() {
    // curl https://castingwords.com/store/API4/audiofile/[AUDIO_FILE_ID]?api_key=[CW_API_KEY] \
    //     -H "Content-Type: application/json"
}

module.exports = {
    submit
}