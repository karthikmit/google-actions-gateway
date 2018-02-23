const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const messageHandler = require('./components/message_handler');

'use strict';

function responseHandler (app) {
    // intent contains the name of the intent you defined in `initialTriggers`
    let intent = app.getIntent();
    switch (intent) {
        case app.StandardIntents.MAIN:
            app.ask('Welcome to Make My Trip. How can I assist you !');
            messageHandler.reset();
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