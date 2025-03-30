import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  market: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
  
  price: { type: Number, required: true },
  currency: { type: String, default: 'UGX' },
  date: { type: Date, required: true },
  lastUpdated: { type: Date, default: Date.now },

  productType: { type: String, enum: ['solid', 'liquid'], required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true, enum: ['kg', 'liters', 'grams', 'pieces'] },

  predictedPrice: { type: Number, default: null },
  predictionDate: { type: Date, default: null },

  trendPercentage: { type: Number, default: 0 },
  priceChangePercentage: { type: Number, default: 0 },

  alertThreshold: { type: Number, default: null },
  alertTriggered: { type: Boolean, default: false },

  historicalPrices: [
    {
      date: { type: Date },
      price: { type: Number }
    }
  ],

  isValid: { type: Boolean, default: true },
  errorLog: { type: String, default: '' }
});

// Index for faster queries
priceSchema.index({ product: 1, market: 1, date: -1 });

const Price = mongoose.model('Price', priceSchema);
export default Price;
