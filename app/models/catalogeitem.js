var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var catalogeSchema   = new Schema({
    dbid:  String,
    name:  { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    unit:  { type: String, required: true },
    image:  { type: String, required: true },
    onspecial: { type: Boolean, required: true },
    maxqty: { type: Number, required: true },
    onspecialprice: { type: Number, required: true },
    _itemtype: { type : Schema.Types.ObjectId, ref : 'itemcategories' },
},
{
    timestamps: { }
}
);


module.exports = mongoose.model('grocitems', catalogeSchema);