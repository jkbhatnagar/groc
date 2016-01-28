var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var quicklistSchema   = new Schema(
{
    dbid: String,
    _userid: { type : Schema.Types.ObjectId, ref : 'grocusers', required: true, unique: true},
    _listitems: [{ type : Schema.Types.ObjectId, ref : 'grocitems' }],
},
{
    timestamps: { }
}
);

module.exports = mongoose.model('quicklists', quicklistSchema);