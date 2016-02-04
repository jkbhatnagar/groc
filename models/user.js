var mongoose     = require('mongoose');
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
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    mobile: { type: String, required: true, unique: true },
    lastlogin: { type: Date}
},
{
    timestamps: { }
}
);

module.exports = mongoose.model('grocusers', userSchema);