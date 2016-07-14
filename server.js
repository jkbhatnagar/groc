var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose   = require("mongoose");
var morgan     = require('morgan');
var passport   = require('passport');
var jwt        = require('jsonwebtoken');
var config     = require('./config/main');
var routes     = require('./app/routes');
var User       = require('./app/models/user');
const cors     = require('cors');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

//mongoose.connect('mongodb://localhost/groc')
mongoose.connect(config.database)

app.use(passport.initialize());

var port = process.env.PORT || 8080;

app.set('superSecret', config.secret); 

app.use(express.static(__dirname + '/public'));

app.use('/rest/v1/', routes);

app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.listen(port);
console.log('RESTAPI listening on port: ' + port);