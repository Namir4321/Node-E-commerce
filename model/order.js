const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
 
  products: [
    {
      product: { type: Object, required: true },
      title: { type: String, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    email: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);
