import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
  product: { type: String, required: true, trim: true },
  market: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'UGX' },

  date: { type: Date, required: true },
  lastUpdated: { type: Date, default: Date.now },

  productType: { type: String, enum: ['solid', 'liquid'], required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['kg', 'liters'], required: true },

  predictedPrice: { type: Number, default: null },
  predictionDate: { type: Date, default: null },

  trendPercentage: { type: Number, default: 0 },
  historicalPrices: [
    {
      date: { type: Date },
      price: { type: Number }
    }
  ]
});

priceSchema.index({ product: 1, market: 1, date: -1 });

const Price = mongoose.model('Price', priceSchema);
export default Price;
