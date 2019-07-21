const mongoose = require('mongoose');

const Stock = mongoose.model('stock', {
  stock: { type: String, required: true },
  price: { type: String, required: true },
  likes: { type: Number, required: true },
  date_retrieved: { type: Date, required: true },
  tracked_ips: [ { type: String} ],
})

module.exports = Stock;