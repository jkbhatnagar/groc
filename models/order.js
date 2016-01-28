var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var orderSchema   = new Schema({
    dbid: String,
    _userid: { type : Schema.Types.ObjectId, ref : 'grocusers', required: true},
    shoppinglistid: { type : Schema.Types.ObjectId, ref : 'shoppinglist', unique: true, required: true},
    shoppinglistfinal: String,
    _listitems: [{ type : Schema.Types.ObjectId, ref : 'grocitems' }],
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    total: Number,
    status: { type: String, required: true, enum: ['new', 'pending', 'paid'] },
    paymentid: String,
},
{
    timestamps: { }
}
);

module.exports = mongoose.model('orders', orderSchema);