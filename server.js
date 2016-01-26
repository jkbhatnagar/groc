
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var routes     = require('./routes');
var mongoose = require("mongoose");

// mongoose.connect('mongodb://localhost/groc')
mongoose.connect('mongodb://jk:jk@ds051575.mongolab.com:51575/groc')

// Express app will use body-parser to get data from POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set port
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

app.use('/', routes);

// Start server listening on port 8080
app.listen(port);
console.log('RESTAPI listening on port: ' + port);
