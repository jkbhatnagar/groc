var express = require('express');

// Get the router
var router = express.Router();

var Catelogeitem     = require('./models/catalogeitem');

// Middleware for all this routers requests
router.use(function timeLog(req, res, next) {
  console.log('Request Received: ', dateDisplayed(Date.now()));
  next();
});

// Welcome message for a GET at http://localhost:8080/restapi
router.get('/', function(req, res) {
    res.json({ message: 'Welcome to the REST API' });   
});

// GET all messages (using a GET at http://localhost:8080/messages)
router.route('/catalogeitems')
    .get(function(req, res) {
        Catelogeitem.find(function(err, items) {
            if (err)
                res.send(err);
            res.json(items);
        });
    });

// Create a message (using POST at http://localhost:8080/messages)
router.route('/catalogeitems')
    .post(function(req, res) {
        Catelogeitem.create(req.body, function (err, item){
            if (err)
                res.send(err);
            res.json({ message: 'Successfully created!' });
        });
    });


router.route('/catalogeitems/:dbid')
    // GET message with id (using a GET at http://localhost:8080/messages/:message_id)
    .get(function(req, res) {
        Catelogeitem.findById(req.params.dbid, function(err, item) {
            if (err)
                res.send(err);
            res.json(item);
        });
    })

    // Update message with id (using a PUT at http://localhost:8080/messages/:message_id)
    .put(function(req, res) {
        Catelogeitem.findByIdAndUpdate(req.params.dbid, req.body, function(err, item) {
            if (err)
                res.send(err);
                res.json({ message: 'Successfully updated!' });
            });
        })

    // Delete message with id (using a DELETE at http://localhost:8080/messages/:message_id)
    .delete(function(req, res) {
        Catelogeitem.findByIdAndRemove(req.params.dbid, function(err, item) {
            if (err)
                res.send(err);
            res.json({ message: 'Successfully deleted!' });
        });
    });

module.exports = router;

function dateDisplayed(timestamp) {
    var date = new Date(timestamp);
    return (date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
}