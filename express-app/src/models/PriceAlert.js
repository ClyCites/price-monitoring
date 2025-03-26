// models/PriceAlert.js
import mongoose from 'mongoose';

const priceAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  market: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
  priceThreshold: { type: Number, required: true },
  alertTriggered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema);
export default PriceAlert;