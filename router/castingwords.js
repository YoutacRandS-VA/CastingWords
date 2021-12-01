const axios = require("axios");
const api_key = require("./../config.json").api_key;

async function submit(payload){
    //   curl --data \
    //   '{"api_key":[CW_API_KEY],
    //     "url":[AUDIO_FILE_URL],
    //         "title":[TRANSCRIPT_TITLE],
    //         "names":[ARRAY_OF_SPEAKER_NAMES],
    //         "notes":[SOME_NOTES],
    //         "tags":"Interview"
    //    }' \
    // https://castingwords.com/store/API4/order_url \
    // -H "Content-Type: application/json"
    const api = "https://castingwords.com/store/API4/order_url";
    let body = {
        "test": 1,
        "api_key": api_key,
        "url": payload.url,
        "title": payload.title,
        "names": payload.names,
        "notes": payload.notes,
        "tags": payload.tags
    }
    axios.post(api, body)
        .then( (response) => {
            console.log(response);
        })
        .catch( (error) => {
            console.log(error)
        });
}

async function listJobs() {
    // curl https://castingwords.com/store/API4/audiofile/[AUDIO_FILE_ID]?api_key=[CW_API_KEY] \
    //     -H "Content-Type: application/json"
}