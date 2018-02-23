exports.formatMessage = (response) => {
    console.log("Message to reformat :: ");
    console.log(JSON.stringify(response));

    let formatResult = {
        "tell": true,
        "options" : [],
        "message": ""
    };

    if(response) {
        if(response.intent) {
            if(response.intent === 'MMT.Cancellation.CancellationCharges') {
                if(response.templateIdentifier) {
                    if(response.templateIdentifier.endsWith("NOBOOKINGFOUND")) {
                        formatResult.message = "Sorry, I couldn't find any upcoming bookings for you.";
                        return formatResult;
                    } else if(response.templateIdentifier.startsWith("execute_command")) {
                        if(response.actionHandlerResponse && response.actionHandlerResponse.data) {
                            var data = response.actionHandlerResponse.data;
                            if(data.response) {
                                let dynamicAnswer = data.response.dynamicAnswer;
                                dynamicAnswer = dynamicAnswer.replace(/(?:\r\n|\r|\n)/g, ". ");
                                formatResult.message = dynamicAnswer + ". Would you like to cancel the ticket. Please respond with yes or no.";
                                formatResult.tell = false;

                                return formatResult;
                            }
                        }
                    }
                }
            }
        }
    }

    formatResult.message = "Sorry, I couldn't understand you.";
    return formatResult;
};