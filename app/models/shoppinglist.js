var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var shoppinglistSchema   = new Schema(
{
    dbid: String,
    _userid: { type : Schema.Types.ObjectId, ref : 'grocusers', required: true},
    _listitems: [{ type : Schema.Types.ObjectId, ref : 'grocitems' }],
},
{
    timestamps: { }
}
);

module.exports = mongoose.model('shoppinglist', shoppinglistSchema);