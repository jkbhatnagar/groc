
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var routes     = require('./routes');

var mongoose = require("mongoose");
var db_name = 'groc';

//provide a sensible default for local development
mongodb_connection_string = 'mongodb://127.0.0.1:27017/' + db_name;
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + db_name;
}

// mongoose.connect('mongodb://localhost/groc')
mongoose.connect(mongodb_connection_string);

// Express app will use body-parser to get data from POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set port
// var port = process.env.PORT || 8080;        // set the port
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

// Define a prefix for all routes
// Can define something unique like MyRestAPI
// We'll just leave it so all routes are relative to '/'
app.use('/', routes);

// Start server listening on port 8080
// app.listen(port);
// console.log('RESTAPI listening on port: ' + port);
app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});
