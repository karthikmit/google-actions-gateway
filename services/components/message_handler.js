const request = require('request');
const responseFormatter = require('./response_formatter');
const localCache = require('./local_cache').cache;

const uri = 'http://172.16.94.230:8000/panini/api/dst';

exports.reset = () => {
    var options = {
        uri: uri,
        method: 'POST',
        json: {
            "message": "",
            "sessionId": "MMT-WHATSAPP-918971752000-abc",
            "userInfo": {
                "channel": "WHATSAPP",
                "org": "MMT",
                "referenceId": "918971752000",
                "referenceType": "PHONENUMBER",
                "sessionId": "MMT-WHATSAPP-918971752000-abc"
            },
            "messageId": "SOME-RANDOM-MESSAGE-ID",
            "sessionExpired" : true
        }
    };
    console.log("Reset Request Options :: ");
    console.log(options);
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Previous Conversation was successfully reset");
        }
    });
};

exports.handleMessage = (app) => {
    let question = app.getRawInput();

    if(question.toLowerCase() === 'yes') {
        app.tell("Your ticket will be cancelled and you will get a mail on the same. Thank you.");
        return;
    } else if(question.toLowerCase() === 'repeat') {
        app.ask(localCache.getValue("last_message"));
        return;
    }

    var options = {
        uri: uri,
        method: 'POST',
        json: {
            "message": question,
            "sessionId": "MMT-WHATSAPP-918971752000-abc",
            "userInfo": {
                "channel": "WHATSAPP",
                "org": "MMT",
                "referenceId": "918971752000",
                "referenceType": "PHONENUMBER",
                "sessionId": "MMT-WHATSAPP-918971752000-abc"
            },
            "messageId": app.getConversationId()
        }
    };
    console.log("Request Options :: ");
    console.log(options);
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var resultContainer = responseFormatter.formatMessage(body);
            if(resultContainer.tell === true) {
                app.tell(resultContainer.message);
            }
            else {
                resultContainer.message = resultContainer.message + ". Please say repeat to repeat the same message.";
                localCache.setValue("last_message", resultContainer.message);
                app.ask(resultContainer.message);
            }
        }
    });
};