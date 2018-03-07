const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const messageHandler = require('./components/message_handler');
const userHandler = require("./components/user_handler").userHandler;
const stateHolder = require("./components/state_holder").stateHolder;

'use strict';

function responseHandler (app) {
    let intent = app.getIntent();
    switch (intent) {
        case app.StandardIntents.MAIN:
            var promptSuffix = 'How can I assist you !';
            var inputPrompt = 'Welcome to Make My Trip. This is Maira, your Personal Assistant. ';
            var userId = app.getUser().userId;
            console.log("User ID :: " + userId);
            userHandler.getUserInfo(userId, function (error, result) {
                let userInfo = !error && result.value;

                if (!error && userInfo && (userInfo["verified"] && (userInfo["verified"] === true))) {
                    inputPrompt += promptSuffix;
                    stateHolder.setCurrentState(app.getConversationId(), "CONVERSATION_BEGAN");
                } else {
                    inputPrompt += "Please tell your phone number for me to assist you better.";
                    stateHolder.setCurrentState(app.getConversationId(), "WAITING_FOR_PHONE");
                }
                app.ask(inputPrompt);
            });
            break;

        case app.StandardIntents.TEXT: {
            messageHandler.handleMessage(app);
            break;
        }
    }
}

exports.mmtServices = (request, response) => {
    const app = new ActionsSdkApp({request: request, response: response});

    // Create functions to handle requests here
    // you can add the function name instead of an action map
    app.handleRequest(responseHandler);
    console.log(request.query);
};