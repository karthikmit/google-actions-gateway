const express = require('express');
const bodyParser = require("body-parser");
const mmt = require('./services/mmt_services');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/mmt', (request, response) => {
    console.log(request.body);
    mmt.mmtServices(request, response);
});

let port = 3000;
app.listen(port, () => console.log('Google Actions Gateway started listening on the port ' + port));