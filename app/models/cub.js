var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CubSchema = new Schema({
  term: String,
  when: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cub', CubSchema);
