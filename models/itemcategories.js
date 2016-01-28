var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var itemcategoriesSchema   = new Schema({
    dbid: String,
    catname: { type: String, required: true, unique: true },
    status: { type: String, required: true, enum: ['active', 'archived'] },
},
{
    timestamps: { }
}
);

module.exports = mongoose.model('itemcategories', itemcategoriesSchema);