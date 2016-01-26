var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var catalogeSchema   = new Schema({
    dbid: String,
    id: Number,
    name: String,
    price: Number,
    unit: String,
    image: String,
    onspecial: Boolean,
    maxqty: Number,
    onspecialprice: Number,
    itemtype: String
});

module.exports = mongoose.model('Grocitem', catalogeSchema);