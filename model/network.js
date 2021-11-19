const axios = require('axios');
const response = require('../utils/response.js');
const maxRetry = 5;

/** 
 * get API
 * @param {String} api
 * @param {Int} retry = 0 
 * @return result 
*/
async function getAPI(api, retry = 0) {
    try{
        const res = await axios.get(api); 
        if(res.data.code==1000){
            throw response.responseNotFound();
        }
        else{
            return res;
        }
    }
    catch(e) {
        if(e.response!=undefined) {
            if(e.response.status==404){
                throw response.responseNotFound();
            }
        }
        if(retry<maxRetry) {
            // console.log(`retry: ${retry} at api: ${api}`);
            return getAPI(api, retry+1);
        }else {
            throw response.responseRetryTimeOut();
        }
    }
}

module.exports = {
   getAPI 
}