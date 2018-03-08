const request = require('request');
const responseFormatter = require('./response_formatter');
const localCache = require('./local_cache').cache;
const stateHolder = require("./state_holder").stateHolder;
const otpHandler = require("./otp_handler").optHandler;
const userHandler = require("./user_handler").userHandler;

const uri = 'http://10.106.105.18:8091/usermessagehandler/api/voice';

/*exports.reset = () => {
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
};*/

exports.handleMessage = (app) => {
    let question = app.getRawInput();

    let currentState = stateHolder.getCurrentState(app.getConversationId());
    userHandler.getUserInfo(app.getUser().userId, function (error, result) {
        let userInfo = !error && result.value;
        if(currentState && currentState === 'WAITING_FOR_PHONE' || currentState === 'WAITING_FOR_OTP') {
            if(currentState === 'WAITING_FOR_OTP') {
                console.log("OTP Entered :: " + question);
                if(userInfo && userInfo["otp"] === question.trim()) {
                    app.ask("Thanks. Your number is verified. How may I assist you.");
                    userInfo["verified"] = true;
                    userHandler.setUserInfo(app.getUser().userId, userInfo, function () {

                    });
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
                        }, function () {

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

        console.log("Question asked :: " + question);
        if(question.trim() === 'repeat') {
            var message = localCache.getValue("last_message");
            app.ask(message);
            return;
        }

        // Here User Info shouldn't be undefined / null.
        if(userInfo && (userInfo["verified"] === true)) {
            let phone = userInfo["phone"];
            if(!phone) {
                console.log("Inconsistent state. User should have been verified to reach this point");
                app.tell("Sorry, I couldn't help you at this moment.");
                return;
            }

            let options = {
                uri: uri,
                method: 'POST',
                json: {
                    "msg": question,
                    "user": phone
                }
            };
            console.log("Request Options :: ");
            console.log(options);
            request(options, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    let message = body["message"];
                    if(body["EOC"] === true) {
                        app.tell(message);
                        return;
                    }
                    else {
                        message = message + ". Please say repeat to repeat the same message.";
                        localCache.setValue("last_message", message);
                        app.ask(message);
                        return;
                    }
                }
            });
        } else {
            console.log("Inconsistent state. User should have been verified to reach this point");
            app.tell("Sorry, I couldn't help you at this moment.");
            return;
        }
    });
};