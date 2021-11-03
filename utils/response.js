
function responseFail(name, status = 404) {
    return {'name': 'responseFail', 'status': status};  
}


function responseNotFound(name, status = 404) {
    return {'name': 'responseNotFound', 'status': status};  
}

function responseRetryTimeOut(name, status = 404) {
    return {'name': 'responseRetryTimeOut', 'status': status};  
}



module.exports = {
    responseFail, responseNotFound, responseRetryTimeOut
}