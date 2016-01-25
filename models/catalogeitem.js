var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var catalogeSchema   = new Schema({
    id: Number,
    name: String,
    price: Number,
    unit: String,
    image: String,
    onspecial: Boolean,
    maxqty: Number,
    onspecialprice: Number,
    itemtype: String,
    itemID: { type: mongoose.Schema.Types.ObjectId },
});

module.exports = mongoose.model('Grocitem', catalogeSchema);