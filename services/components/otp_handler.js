const request = require('request');
const constants = require('../../config');

class OtpHandler {

    generateOtp(phone, successCB, errorCB) {
        var url = constants.OTP_SERVICE + "/mmt-extservices/service/v3/generateAndSendOtp?phonenumber=" + phone;
        var options = {
            uri: url,
            method: 'GET',
            headers : {
                "Authorization" : "Basic cmVzdDoxMjM0NTY=",
                "accept" : "application/json"
            }
        };
        console.log("Request Options :: ");
        console.log(options);

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200 && body) {
                console.log(body);
                var responseBody = JSON.parse(body);
                if(responseBody["status"] === 'Success') {
                    successCB(responseBody["otp"]);
                }
                return;
            } else {
                errorCB();
            }
        });
    }
}

module.exports = {
    optHandler : new OtpHandler()
};