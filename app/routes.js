var express    = require('express');
var passport   = require('passport');
var config     = require('../config/main');
var jwt = require('jsonwebtoken');

var requireAuth = passport.authenticate('jwt', { session: false });
// Get the router
var router = express.Router();
require('../config/passport')(passport);

//------------------------Generic---------------------------
// Middleware for all this routers requests
router.use(function timeLog(req, res, next) {
  console.log('Request Received: ', dateDisplayed(Date.now()));
  next();
});

// Welcome message for a GET at http://localhost:8080/
router.get('/', function(req, res) {
    res.status(200).json({ message: 'Welcome to the GROC API' });   
});

function dateDisplayed(timestamp) {
    var date = new Date(timestamp);
    return (date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
};

//------------------------Authentication---------------------------

var User             = require('./models/user');

// GET all users (using a GET at http://localhost:8080/users)
router.route('/users')
    .get(function(req, res) {
        User.find(function(err, item) {
            if (err)
                res.status(400).json({'status' : 'error', description: err});
            else
                res.status(200).json({status: 'Success', data:item, timestamp: Date.now()});
        });
    });

router.route('/users/username/:username')
    // GET users with id (using a GET at http://localhost:8080/users/:message_id)
    .get(function(req, res, next) {
        User.findOne({username : req.params.username}, function(err, user) {
            if (err)
                res.status(400).json({status : 'error', description: err});
            else
                if (!user)
                    res.status(200).json({status : 'User Not Found', description: req.params.username});
                else
                    res.status(400).json({status : 'Username already used', description: req.params.username});
            });
        });

router.route('/users/email/:email')
    .get(function(req, res) {
        User.findOne({email : req.params.email}, function(err, user) {
            if (err)
                res.status(400).json({status : 'error', description: err});
            else
                if (!user)
                    res.status(200).json({status : 'User Not Found', description: req.params.email});
                else
                    res.status(400).json({status : 'Email already used', description: req.params.email});
        });
    });

router.route('/users/mobile/:mobile')
    .get(function(req, res) {
        User.findOne({mobile : req.params.mobile}, function(err, user) {
            if (err)
                res.status(400).json({status : 'error', description: err});
            else
                if (!user)
                    res.status(200).json({status : 'User Not Found', description: req.params.mobile});
                else
                    res.status(400).json({status : 'Mobile already used', description: req.params.mobile});
        });
    });

// Create a user (using POST at http://localhost:8080/users)
router.route('/users')
    .post(function(req, res) {
      if(!req.body.firstname)
          res.status(400).json({status : 'error', description: 'Invalid firstname'});
      else if (!req.body.lastname)
          res.status(400).json({status : 'error', description: 'Invalid lastname'});
      else if (!req.body.username)
          res.status(400).json({status : 'error', description: 'Invalid username'});
      else if (!req.body.email)
          res.status(400).json({status : 'error', description: 'Invalid email'});
      else if (!req.body.password)
          res.status(400).json({status : 'error', description: 'Invalid password'});
      else if (!req.body.dob)
          res.status(400).json({status : 'error', description: 'Invalid Date of birth'});
      else if (!req.body.mobile)
          res.status(400).json({status : 'error', description: 'Invalid mobile'});
      else
        User.create(
            {
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                username : req.body.username,
                email : req.body.email,
                password : req.body.password,
                dob : req.body.dob,
                mobile : req.body.mobile,
                role: req.body.role

            }, function (err, item){
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                //res.status(200).json({ status : 'success', message: 'User Successfully created!' });
                User.findOne({username: req.body.username}, function(err, user) {
                if (err)
                    res.status(400).json({status: 'error', description: err});
                else
                    var token = jwt.sign(user, config.secret, {
                        expiresIn: 86400 // expires in seconds
                    });

                    res.status(200).json({
                      status: 'success',
                      message: 'User Successfully created',
                      //validityInSeconds: 86400,
                      //token: token,
                      //data: user
                    });
                });
            }
        );
    });

router.route('/authenticate')
    .post(function(req, res) {

      if(!req.body.username)
          res.status(400).json({status: 'error', description: 'Invalid username'});
      else if (!req.body.password)
          res.status(400).json({status: 'error', description: 'Invalid password'});
      else
          User.findOne({username: req.body.username}, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            if (!user)
                res.status(400).json({status: 'error', description: 'Invalid username : ' + req.body.username});
            if (user) {
              user.comparePassword(req.body.password, function(err, isMatch) {
                  if (isMatch && !err) {
                    var token = jwt.sign(user, config.secret, {
                      expiresIn: 86400 // expires in seconds
                    });
                    res.status(200).json({
                      status: 'success',
                      message: 'Enjoy your token!',
                      validityInSeconds: 86400,
                      token: 'JWT '+token,
                      userid: user._id,
                      firstname: user.firstname,
                      lastname: user.lastname,
                      email: user.email,
                      dob: user.dob,
                      mobile: user.mobile,
                      lastlogin: user.lastlogin,
                    });
                  }else{
                    res.status(401).json({status: 'error', description: 'Authentication failed. Passwords did not match.'});
                  }
              });
            }
        });
   });

//------------------------Users---------------------------

router.route('/users/:dbid')
    // GET users with id (using a GET at http://localhost:8080/users/:message_id)
    .get(requireAuth, function(req, res) {
        User.findById(req.params.dbid, function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description : "Bad request: invalid user id"});
            else
                res.status(200).json({status: 'Success', data:item, timestamp: Date.now()});
        });
    })

    // Update users with id (using a PUT at http://localhost:8080/users/:message_id)
    .put(requireAuth, function(req, res) {
        User.findByIdAndUpdate(req.params.dbid, 
            {
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                username : req.body.username,
                email : req.body.email,
                password : req.body.password,
                dob : req.body.dob,
                mobile : req.body.mobile

            }, function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', message: 'User Successfully updated!' });
        });
    })

    // Delete users with id (using a DELETE at http://localhost:8080/users/:message_id)
    .delete(requireAuth, function(req, res) {
        User.findByIdAndRemove(req.params.dbid, function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', message: 'User Successfully deleted!' });
        });
    });

router.route('/users/:dbid')
    // Update user last login time (using a POST at http://localhost:8080/users/:dbid)
    .post(requireAuth, function(req, res) {
        User.findByIdAndUpdate(req.params.dbid, 
            {
             lastlogin : Date.now()
            }, function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', message: 'User Successfully updated!' });
        });
    });

//------------------------ItemCategories---------------------------
var ItemCategory             = require('./models/itemcategories');

// GET all ItemCategory (using a GET at http://localhost:8080/itemcategories)
router.route('/itemcategories')
    .get(function(req, res) {
        ItemCategory.find(function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', data:item, timestamp: Date.now() });
        })
        .sort({"catname":1});
    });

// Create a ItemCategory (using POST at http://localhost:8080/itemcategories)
router.route('/itemcategories')
    .post(function(req, res) {
        ItemCategory.create(req.body, function (err, item){
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', message: 'ItemCategory Successfully created!' });
        });
    });


router.route('/itemcategories/:dbid')
    // GET ItemCategory with id (using a GET at http://localhost:8080/itemcategories/:dbid)
    .get(function(req, res) {
        ItemCategory.findById(req.params.dbid, function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: 'ItemCategory not found'});
            else
                res.status(200).json({status: 'Success', data:item, timestamp: Date.now() });
        });
    })

    // Update ItemCategory with id (using a PUT at http://localhost:8080/itemcategories/:dbid)
    .put(function(req, res) {
        ItemCategory.findByIdAndUpdate(req.params.dbid, req.body, function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', message: 'ItemCategory Successfully updated!' });
            });
        })

    // Delete ItemCategory with id (using a DELETE at http://localhost:8080/itemcategories/:dbid)
    .delete(function(req, res) {
        ItemCategory.findByIdAndRemove(req.params.dbid, function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', message: 'ItemCategory Successfully deleted!' });
        });
    });

//------------------------Catelogeitem---------------------------
var Catelogeitem     = require('./models/catalogeitem');

// GET all catalogeitems (using a GET at http://localhost:8080/catalogeitems)
router.route('/catalogeitems')
    .get(function(req, res) {
        Catelogeitem.find(function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', data:item, timestamp: Date.now() });
        })
        .sort({"_itemtype":1})
        .sort({"name":1});
    });

// GET details of catalogeitems given in POST request (using a GET at http://localhost:8080/catalogeitemsfilterd)
// {"_listitems":["56a9be22459ecb8b8ccbadec", "56a9be2b459ecb8b8ccbaded", "56a9be32459ecb8b8ccbadee"]}
router.route('/catalogeitemsfilterd')
    .post(function(req, res) {
        if (!req.body._listitems)
            res.status(400).json({status: 'error', description: err});
        else
            Catelogeitem.find({_id : { $in: req.body._listitems }}, function(err, item) {
                if (err)
                    res.status(400).json({status: 'error', description: err});
                else
                    res.status(200).json({status: 'Success', data:item, timestamp: Date.now() });
            })
        .sort({"_itemtype":1})
        .sort({"name":1});
    });

// GET all catalogeitems by ItemCategory (using a GET at http://localhost:8080/catalogeitems/:catid)
router.route('/catalogeitems/itemcategory/:catid')
    .get(function(req, res) {
        ItemCategory.findById(req.params.catid, function(err, catitem) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!catitem)
                res.status(400).json({status: 'error', description: 'Invalid ItemCategory'});
            else
                Catelogeitem.find({_itemtype: req.params.catid}, function(err, item) {
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({status: 'Success', data:item, timestamp: Date.now() });
                });
            })
        .sort({"name":1});
    });

// Create a message (using POST at http://localhost:8080/catalogeitems)
// router.route('/catalogeitems')
//     .post(function(req, res) {
//         Catelogeitem.create(req.body, function (err, item){
//             if (err)
//                 res.send(err);
//             res.json({ message: 'Successfully created!' });
//         });
//     });

router.route('/catalogeitems')
    // Add a catalogeitem (using a POST at http://localhost:8080/catalogeitems)
    /*
    {id":300X,"name":"Item Name","price":2.49,"unit":"Each","image":"images/3004.jpg","onspecial":false,"maxqty":10,"onspecialprice":0,"_itemtype":"56a8058c715380a2f9f75e2b"}]
    */
    .post(function(req, res) {
        ItemCategory.findById(req.body._itemtype, function(err, catitem) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!catitem)
                res.status(400).json({status: 'error', description: 'Invalid ItemCategory'});
            else
                Catelogeitem.create(
                    {
                        name : req.body.name,
                        price : req.body.price,
                        unit : req.body.unit,
                        image : req.body.image,
                        onspecial : req.body.onspecial,
                        maxqty : req.body.maxqty,
                        onspecialprice : req.body.onspecialprice,
                        _itemtype : req.body._itemtype
                    }, function (err, item){
                if (err)
                    res.status(400).json({status: 'error', description: err});
                else
                    res.status(200).json({status: 'Success', message: 'Catelogeitem Successfully created!'})
            });
        });
    });


router.route('/catalogeitems/:dbid')
    // GET catalogeitem with id (using a GET at http://localhost:8080/catalogeitems/:dbid)
    .get(function(req, res) {
        Catelogeitem.findById(req.params.dbid, function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', data:item, timestamp: Date.now()});
        });
    })

    // Update catalogeitem with id (using a PUT at http://localhost:8080/catalogeitems/:dbid)
    .put(function(req, res) {
        ItemCategory.findById(req.body._itemtype, function(err, catitem) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!catitem)
                res.status(400).json({status: 'error', description: 'Invalid ItemCategory'});
            else
                Catelogeitem.findByIdAndUpdate(req.params.dbid, {
                    name : req.body.name,
                    price : req.body.price,
                    unit : req.body.unit,
                    image : req.body.image,
                    onspecial : req.body.onspecial,
                    maxqty : req.body.maxqty,
                    onspecialprice : req.body.onspecialprice,
                    _itemtype : req.body._itemtype
                }, function(err, item) {
                if (err)
                    res.status(400).json({status: 'error', description: err});
                else
                    res.status(200).json({status: 'Success', message: 'Catelogeitem Successfully updated!'})
                });
        })
    })


    // Delete catalogeitem with id (using a DELETE at http://localhost:8080/catalogeitems/:dbid)
    .delete(function(req, res) {
        Catelogeitem.findByIdAndRemove(req.params.dbid, function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', message: 'Catelogeitem Successfully deleted!'})
        });
    });

//------------------------QuickLists---------------------------

var QuickList             = require('./models/quicklist');

// GET all QLs (using a GET at http://localhost:8080/quicklists)
router.route('/quicklists')
    .get(function(req, res) {
        QuickList.find(function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', data:item, timestamp: Date.now()});
        });
    });

// GET all QLs for given user (using a GET at http://localhost:8080/quicklists)
router.route('/quicklists/:userid')
    .get(requireAuth, function(req, res) {
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                //res.json({message: req.params.userid});
                res.status(400).json({status: 'error', description: 'Invalid User'});
            else
            QuickList.find({_userid : req.params.userid}, function(err, item) {
                if (err)
                    res.status(400).json({status: 'error', description: err});
                else
                    res.status(200).json({status: 'Success', data:item, timestamp: Date.now()});
            });
        });
    });

// Create a QuickList with empty itemlist, for given user (using POST at http://localhost:8080/quicklists/:userid)
router.route('/quicklists/:userid')
    .post(requireAuth, function(req, res) {
        QuickList.create(
            {
                _userid : req.params.userid,
                _listitems : []
            }, function (err, item){
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({ status : 'success', message: 'QuickList Successfully created!' });
        });
    });

router.route('/quicklists/:userid/:itemid')
// Remove item from a QuickList for given user (using DELETE at http://localhost:8080/:userid/:itemid)
    .delete(requireAuth, function(req, res) {
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                res.status(400).json({status: 'error', description: 'Invalid User'});
            else
                QuickList.update({_userid : req.params.userid}, { $pull: { _listitems : req.params.itemid }}, function(err, item) {
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({ status : 'success', message: 'QuickList Item Successfully Removed!' });
                });
        });
    })

    .put(requireAuth, function(req, res) {
        // Add item to a QuickList for given user (using PUT at http://localhost:8080/:userid/:itemid)
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                res.status(400).json({status: 'error', description: 'Invalid User'});
            else
                QuickList.update({_userid : req.params.userid}, { $addToSet: { _listitems : req.params.itemid }}, function(err, item) {
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({ status : 'success', message: 'QuickList Item Successfully Added!' });
                });
        });
    });

router.route('/quicklists/:userid')
    // Remove multiple items from a QuickList for given user (using DELETE at http://localhost:8080/:userid)
    // {"_listitems":["56a9be22459ecb8b8ccbadec", "56a9be2b459ecb8b8ccbaded", "56a9be32459ecb8b8ccbadee"]}
    .delete(requireAuth, function(req, res) {
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                res.status(400).json({status: 'error', description: 'Invalid User'});
            else if (!req.body._listitems)
                res.status(400).json({status: 'error', description: 'Invalid List'});
            else
                QuickList.update({_userid : req.params.userid}, { $pullAll: { _listitems : req.body._listitems }}, function(err, item) {
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({ status : 'success', message: 'QuickList Items Successfully Removed!' });
                });
        });
    })

    .put(requireAuth, function(req, res) {
    // Add multiple items to a QuickList for given user (using PUT at http://localhost:8080/:userid/)
    // {"_listitems":["56a9be22459ecb8b8ccbadec", "56a9be2b459ecb8b8ccbaded", "56a9be32459ecb8b8ccbadee"]}
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                res.status(400).json({status: 'error', description: 'Invalid User'});
            else if (!req.body._listitems)
                res.status(400).json({status: 'error', description: 'Invalid List'});
            else
                QuickList.update({_userid : req.params.userid}, { $addToSet: { _listitems : { $each: req.body._listitems }}}, function(err, item) {
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({ status : 'success', message: 'QuickList Items Successfully Added!' });
                });
        });
    });

//------------------------Shopping Lists---------------------------

var ShoppingList             = require('./models/shoppinglist');

// GET all messages (using a GET at http://localhost:8080/shoppinglist)
router.route('/shoppinglists')
    .get(requireAuth, function(req, res) {
        ShoppingList.find(function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', data:item, timestamp: Date.now()});
        });
    });

// GET all ShoppingLists (using a GET at http://localhost:8080/shoppinglist)
router.route('/shoppinglists/:userid')
    .get(requireAuth, function(req, res) {
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                //res.json({message: req.params.userid});
                res.status(400).json({status: 'error', description: 'Invalid User'});
            else
            ShoppingList.find({_userid : req.params.userid}, function(err, item) {
                if (err)
                    res.status(400).json({status: 'error', description: err});
                else
                    res.status(200).json({status: 'Success', data:item, timestamp: Date.now()});
            });
        });
    });

// GET a ShoppingList (using a GET at http://localhost:8080/shoppinglist/:shoppinglistid)
router.route('/shoppinglists/:userid/:shoppinglistid')
    .get(requireAuth, function(req, res) {
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                //res.json({message: req.params.userid});
                res.status(400).json({status: 'error', description: 'Invalid User'});
            else
                ShoppingList.find({_id : req.params.shoppinglistid}, function(err, item) {
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({status: 'Success', data:item, timestamp: Date.now()});
                });
        });
    });

// Create a ShoppingList with empty itemlist, for given user (using POST at http://localhost:8080/shoppinglist/:userid)
router.route('/shoppinglists/:userid')
    .post(requireAuth, function(req, res) {
        ShoppingList.create(
            {
                _userid : req.params.userid,
                _listitems : []
            }, function (err, item){
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({ status : 'success', message: 'ShoppingList Successfully created!' });
        });
    });

router.route('/shoppinglists/:userid/:shoppinglistid/')
// Remove item from a ShoppingList for given user (using DELETE at http://localhost:8080/shoppinglist/:userid/:itemid)
    .delete(requireAuth, function(req, res) {
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                res.status(400).json({status: 'error', description: 'Invalid User'});
            else
                ShoppingList.findByIdAndRemove(req.params.shoppinglistid, function(err, item){
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({ status : 'success', message: 'ShoppingList Successfully Removed!' });
                });
        });
    });


router.route('/shoppinglists/:userid/:shoppinglistid/:itemid')
// Remove item from a ShoppingList for given user (using DELETE at http://localhost:8080/shoppinglist/:userid/:itemid)
    .delete(requireAuth, function(req, res) {
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                res.status(400).json({status: 'error', description: 'Invalid User'});
            else
                ShoppingList.update({_id : req.params.shoppinglistid}, { $pull: { _listitems : req.params.itemid }}, function(err, item) {
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({ status : 'success', message: 'ShoppingList Successfully Removed!' });
                });
        });
    })

    .put(requireAuth, function(req, res) {
        // Add item to a ShoppingList for given user (using PUT at http://localhost:8080/:userid/:itemid)
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                res.status(400).json({status: 'error', description: 'Invalid User'});
            else
                ShoppingList.update({_id : req.params.shoppinglistid}, { $addToSet: { _listitems : req.params.itemid }}, function(err, item) {
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({ status : 'success', message: 'ShoppingList Successfully Added!' });
                });
        });
    });

router.route('/shoppinglists/:userid/:shoppinglistid')
    // Remove multiple items from a ShoppingList for given user (using DELETE at http://localhost:8080/shoppinglist/:userid)
    // {"_listitems":["56a9be22459ecb8b8ccbadec", "56a9be2b459ecb8b8ccbaded", "56a9be32459ecb8b8ccbadee"]}
    .delete(requireAuth, function(req, res) {
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                res.status(400).json({status: 'error', description: 'Invalid User'});
            else if (!req.body._listitems)
                res.status(400).json({status: 'error', description: 'Invalid List'});
            else
                ShoppingList.update({_id : req.params.shoppinglistid}, { $pullAll: { _listitems : req.body._listitems }}, function(err, item) {
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({ status : 'success', message: 'ShoppingList Successfully Deleted!' });
                });
        });
    })

    .put(requireAuth, function(req, res) {
    // Add multiple items to a ShoppingList for given user (using PUT at http://localhost:8080/:userid/)
    // {"_listitems":["56a9be22459ecb8b8ccbadec", "56a9be2b459ecb8b8ccbaded", "56a9be32459ecb8b8ccbadee"]}
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                res.status(400).json({status: 'error', description: 'Invalid User'});
            else if (!req.body._listitems)
                res.status(400).json({status: 'error', description: 'Invalid List'});
            else
                ShoppingList.update({_id : req.params.shoppinglistid}, { $addToSet: { _listitems : { $each: req.body._listitems }}}, function(err, item) {
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({ status : 'success', message: 'ShoppingList Successfully Added!' });
                });
        });
    });

//------------------------Orders---------------------------

var Order             = require('./models/order');

// GET all Orders (using a GET at http://localhost:8080/orders)
router.route('/orders')
    .get(function(req, res) {
        Order.find(function(err, item) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                res.status(200).json({status: 'Success', data:item, timestamp: Date.now()});
        });
    });

// GET all Orders for given user (using a GET at http://localhost:8080/Orders/:userid)
router.route('/orders/:userid')
    .get(requireAuth, function(req, res) {
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                res.status(400).json({status: 'error', description: 'Invalid user'});
            else
                Order.find({_userid : req.params.userid}, function(err, item) {
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({status: 'Success', data:item, timestamp: Date.now()});
            });
        });
    });

// GET Orders for given OrderID (using a GET at http://localhost:8080/Orders/:userid/:orderid)
router.route('/orders/:userid/:orderid')
    .get(requireAuth, function(req, res) {
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                res.status(400).json({status: 'error', description: 'Invalid user'});
            else
            Order.find({_id : req.params.orderid}, function(err, item) {
                if (err)
                    res.status(400).json({status: 'error', description: err});
                else
                    res.status(200).json({status: 'Success', data:item, timestamp: Date.now()});
            });
        });
    });

// GET details of catalogeitems given in POST request (using a GET at http://localhost:8080/catalogeitemsfilterd)
// {"_listitems":["56a9be22459ecb8b8ccbadec", "56a9be2b459ecb8b8ccbaded", "56a9be32459ecb8b8ccbadee"]}
// router.route('/catalogeitemsfilterd')
//     .post(function(req, res) {
//         if (!req.body._listitems)
//             res.send(err);
//         else
//             Catelogeitem.find({_id : { $in: req.body._listitems }}, function(err, items) {
//                 if (err)
//                     res.send(err);
//                 res.json(items);
//             });
//     });


// Create an Order for given user (using POST at http://localhost:8080/Orders/:userid)
/*
{
"_userid" : "56a9b6909d6bf8798c04d333",
"shoppinglistid" : "56aa0eeef96159ea8d089006",
"email" : "abc@gmail.com",
"mobile" : "0451515151",
"paymentid" : "",
"status" : "new",
"total" : 80,
"_listitems":["56a9ba8d9d6bf8798c04d335","56a9bb549d6bf8798c04d33a","56a9be22459ecb8b8ccbadec","56a9be2b459ecb8b8ccbaded"]
}
*/
router.route('/orders')
    .post(requireAuth, function(req, res) {
        ShoppingList.find({_id : req.body.shoppinglistid}, function(err, sl) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else
                Order.create(
                    {
                        _userid : req.body._userid,
                        shoppinglistid : req.body.shoppinglistid,
                        _listitems : req.body._listitems,
                        email : req.body.email,
                        mobile : req.body.mobile,
                        paymentid : req.body.paymentid,
                        status : req.body.status,
                        shoppinglistfinal : JSON.stringify(sl),
                        total : req.body.total,

                }, function (err, item){
                if (err)
                    res.status(400).json({status: 'error', description: err});
                else
                    res.status(200).json({ status : 'success', message: 'Order Successfully created!' });
        });
    });
});

router.route('/Orders/:userid/:Orderid')
    // Remove item from a Order for given user (using DELETE at http://localhost:8080/Order/:userid/:itemid)
    .delete(requireAuth, function(req, res) {
        User.findById(req.params.userid, function(err, user) {
            if (err)
                res.status(400).json({status: 'error', description: err});
            else if (!user)
                res.status(400).json({status: 'error', description: 'Invalid user'});
            else
                Order.findByIdAndRemove(req.params.Orderid, function(err, item){
                    if (err)
                        res.status(400).json({status: 'error', description: err});
                    else
                        res.status(200).json({ status : 'success', message: 'Order Successfully deleted!' });
                });
        });
    })

//router.route('/Orders/:userid/:Orderid/:itemid')
// Remove item from a Order for given user (using DELETE at http://localhost:8080/Order/:userid/:itemid)
    // .delete(function(req, res) {
    //     User.findById(req.params.userid, function(err, user) {
    //         if (err)
    //             res.send(err);
    //         else if (!user)
    //             res.json({message: 'Invalid User'});
    //         else
    //             Order.update({_id : req.params.Orderid}, { $pull: { _listitems : req.params.itemid }}, function(err, item) {
    //                 if (err)
    //                     res.send(err);
    //                 res.json({ message: 'Order Item Successfully Removed!' });
    //             });
    //     });
    // })

    // .put(function(req, res) {
    //     // Add item to a Order for given user (using PUT at http://localhost:8080/:userid/:itemid)
    //     User.findById(req.params.userid, function(err, user) {
    //         if (err)
    //             res.send(err);
    //         else if (!user)
    //             res.json({message: 'Invalid User'});
    //         else
    //             Order.update({_id : req.params.Orderid}, { $addToSet: { _listitems : req.params.itemid }}, function(err, item) {
    //                 if (err)
    //                     res.send(err);
    //                 res.json({ message: 'Order Item Successfully Added!' });
    //             });
    //     });
    // });

// router.route('/Orders/:userid/:Orderid')
//     // Remove multiple items from a Order for given user (using DELETE at http://localhost:8080/Order/:userid)
//     // {"_listitems":["56a9be22459ecb8b8ccbadec", "56a9be2b459ecb8b8ccbaded", "56a9be32459ecb8b8ccbadee"]}
//     .delete(function(req, res) {
//         User.findById(req.params.userid, function(err, user) {
//             if (err)
//                 res.send(err);
//             else if (!user)
//                 res.json({message: 'Invalid User'});
//             else if (!req.body._listitems)
//                 res.json({message: 'Invalid List'});
//             else
//                 Order.update({_id : req.params.Orderid}, { $pullAll: { _listitems : req.body._listitems }}, function(err, item) {
//                     if (err)
//                         res.send(err);
//                     res.json({ message: 'Successfully Deleted!' });
//                 });
//         });
//     })

//     .put(function(req, res) {
//     // Add multiple items to a Order for given user (using PUT at http://localhost:8080/:userid/)
//     // {"_listitems":["56a9be22459ecb8b8ccbadec", "56a9be2b459ecb8b8ccbaded", "56a9be32459ecb8b8ccbadee"]}
//         User.findById(req.params.userid, function(err, user) {
//             if (err)
//                 res.send(err);
//             else if (!user)
//                 res.json({message: 'Invalid User'});
//             else if (!req.body._listitems)
//                 res.json({message: 'Invalid List'});
//             else
//                 Order.update({_id : req.params.Orderid}, { $addToSet: { _listitems : { $each: req.body._listitems }}}, function(err, item) {
//                     if (err)
//                         res.send(err);
//                     res.json({ message: 'Successfully ADDED!' });
//                 });
//         });
//     });

//

//------------------------EXPORT---------------------------
module.exports = router;

