const request = require('request');
const responseFormatter = require('./response_formatter');
const localCache = require('./local_cache').cache;
const stateHolder = require("./state_holder").stateHolder;
const otpHandler = require("./otp_handler").optHandler;
const userHandler = require("./user_handler").userHandler;

const uri = 'http://172.16.94.230:8000/panini/api/dst';

exports.reset = () => {
    localCache.setValue("misunderstanding_repeat", 0);
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
        if (!error && response.statusCode === 200) {
            console.log("Previous Conversation was successfully reset");
        }
    });
};

exports.handleMessage = (app) => {
    let question = app.getRawInput();

    var currentState = stateHolder.getCurrentState(app.getConversationId());
    if(currentState && currentState === 'WAITING_FOR_PHONE' || currentState === 'WAITING_FOR_OTP') {
        if(currentState === 'WAITING_FOR_OTP') {
            console.log("OTP Entered :: " + question);
            var userInfo = userHandler.getUserInfo(app.getUser().userId);
            if(userInfo && userInfo["otp"] === question.trim()) {
                app.ask("Thanks. Your number is verified. How may I assist you.");
                userInfo["verified"] = true;
                stateHolder.setCurrentState(app.getConversationId(), "CONVERSATION_BEGAN");
            } else {
                app.ask("I am sorry. OTP doesn't look right. Please try again.");
            }
        } else {

            question = question.replace(/\+/, "00");
            question = question.replace(/\D/g, "");
            question = question.trim();
            console.log("Phone number entered :: " + question);
            if(isNaN(parseInt(question))) {
                app.ask("Couldn't get your number, Please tell your 10 digits mobile number.");
            } else {

                otpHandler.generateOtp(question, function (otp) {
                    userHandler.setUserInfo(app.getUser().userId, {
                        "phone" : question,
                        "verified" : false,
                        "otp" : otp
                    });

                    stateHolder.setCurrentState(app.getConversationId(), "WAITING_FOR_OTP");
                    app.ask("An OTP has been sent to your number. Please tell me once you receive it.")
                }, function () {
                    console.log("OTP Generation Failed");
                    app.tell("Sorry, I couldn't send you the OTP, Please try later.");
                });
            }
        }

        return;
    }

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