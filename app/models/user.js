var mongoose     = require('mongoose');
var bcrypt       = require('bcrypt');
var Schema       = mongoose.Schema;

// function validate_18_years_old(value){return(Date.now - value.getTime()) > (18 * 31536000000);}
// function validate_email_exists(value){
//   User.findOne({email: value}, function(err, user) {
//     if(err) throw err;
//     if(user) return respond(false);
//     respond(true);
//   });
// 
// User.schema.path('username').validate(function(value, respond) {
//   User.findOne({username: value}, function(err, user) {
//     if(err) throw err;
//     if(user) return respond(false);
//     respond(true);
//   });
// }, 'exists');

var userSchema   = new Schema({
    dbid: String,
    firstname: { type: String, required: true, lowercase: true },
    lastname: { type: String, required: true, lowercase: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    mobile: { type: String, required: true, unique: true },
    lastlogin: { type: Date},
    role: {enum: ['', 'agent', 'admin', 'superadmin'], default: ''}
},
{
    timestamps: { }
}
);

userSchema.pre('save', function (next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

// Create method to compare password input to password saved in database
userSchema.methods.comparePassword = function(pw, cb) {
  bcrypt.compare(pw, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('grocusers', userSchema);