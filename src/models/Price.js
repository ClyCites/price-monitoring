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
  priceChangePercentage: { type: Number, default: 0 },  // Track price changes over time

  alertThreshold: { type: Number, default: null }, // Threshold for price alert
  alertTriggered: { type: Boolean, default: false }, // Indicates if alert has been triggered

  historicalPrices: [
    {
      date: { type: Date },
      price: { type: Number }
    }
  ],

  category: { type: String, enum: ['grain', 'vegetable', 'fruit', 'meat', 'beverage'], default: 'grain' }, // Categories to help organize products

  isValid: { type: Boolean, default: true },  // Data validity flag for data quality control
  errorLog: { type: String, default: '' },  // Log errors related to data entry or predictions
});

priceSchema.index({ product: 1, market: 1, date: -1 });

// Indexing for price alerts and predictions
priceSchema.index({ product: 1, market: 1, alertThreshold: 1, alertTriggered: 1 });

const Price = mongoose.model('Price', priceSchema);
export default Price;
