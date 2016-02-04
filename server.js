
var express    = require('express');
var bodyParser = require('body-parser');
var routes     = require('./routes');
var mongoose = require("mongoose");
var morgan = require('morgan');
var app        = express();

var config = require('./config');

// mongoose.connect('mongodb://localhost/groc')
mongoose.connect('mongodb://jk:jk@ds051575.mongolab.com:51575/groc')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

var port = process.env.PORT || 8080;

app.set('superSecret', config.secret); 

app.use(express.static(__dirname + '/public'));

app.use('/', routes);

app.listen(port);
console.log('RESTAPI listening on port: ' + port);