import Price from '../models/Price.js';
import Product from '../models/Product.js';
import Market from '../models/Market.js';

// =========================
// 1️⃣ Add a New Price Entry (Manual Entry)
// =========================
export const addPrice = async (req, res) => {
  try {
    const { product, market, price, currency, date, productType, quantity, unit } = req.body;

    if (!product || !market || !price || !date || !productType || !quantity || !unit) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingProduct = await Product.findById(product);
    if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

    const existingMarket = await Market.findById(market);
    if (!existingMarket) return res.status(404).json({ message: 'Market not found' });

    const newPrice = new Price({
      product,
      market,
      price,
      currency: currency || 'UGX',
      date,
      productType,
      quantity,
      unit,
      lastUpdated: new Date()
    });

    await newPrice.save();
    res.status(201).json({ message: 'Price added successfully', price: newPrice });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 2️⃣ Get Prices (Filter by Product & Market)
// =========================
export const getPrices = async (req, res) => {
  try {
    const { product, market } = req.query;
    const query = {};
    if (product) query.product = product;
    if (market) query.market = market;

    const prices = await Price.find(query)
      .sort({ date: -1 })
      .populate('product', 'name category')
      .populate('market', 'name location region');

    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 3️⃣ Get Price by ID
// =========================
export const getPriceById = async (req, res) => {
  try {
    const price = await Price.findById(req.params.id)
      .populate('product', 'name category')
      .populate('market', 'name location region');

    if (!price) return res.status(404).json({ message: 'Price not found' });

    res.status(200).json(price);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// =========================
// 4️⃣ Update Price Entry
// =========================
export const updatePrice = async (req, res) => {
  try {
    const { product, market } = req.body;

    const price = await Price.findById(req.params.id);
    if (!price) return res.status(404).json({ message: 'Price not found' });

    // Validate product and market existence if updated
    if (product) {
      const existingProduct = await Product.findById(product);
      if (!existingProduct) return res.status(404).json({ message: 'Product not found' });
    }
    if (market) {
      const existingMarket = await Market.findById(market);
      if (!existingMarket) return res.status(404).json({ message: 'Market not found' });
    }

    Object.assign(price, req.body, { lastUpdated: new Date() });
    await price.save();
    res.status(200).json({ message: 'Price updated successfully', price });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 5️⃣ Delete a Price Entry
// =========================
export const deletePrice = async (req, res) => {
  try {
    const price = await Price.findById(req.params.id);
    if (!price) return res.status(404).json({ message: 'Price not found' });

    await price.deleteOne();
    res.status(200).json({ message: 'Price deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 6️⃣ Get Price Trends & Moving Averages
// =========================
export const getPriceTrends = async (req, res) => {
  try {
    const { product, market, days } = req.query;
    const pastDays = days ? parseInt(days) : 30;

    if (!product || !market) {
      return res.status(400).json({ message: 'Product and market are required' });
    }

    const historicalPrices = await Price.find({
      product,
      market,
      date: { $gte: new Date(Date.now() - pastDays * 24 * 60 * 60 * 1000) }
    }).sort({ date: 1 });

    if (historicalPrices.length < 2) {
      return res.status(200).json({ message: 'Not enough data for trend analysis' });
    }

    const firstPrice = historicalPrices[0].price;
    const latestPrice = historicalPrices[historicalPrices.length - 1].price;
    const trendPercentage = ((latestPrice - firstPrice) / firstPrice) * 100;

    res.status(200).json({ product, market, trendPercentage: trendPercentage.toFixed(2), historicalPrices });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 7️⃣ Predict Future Prices (AI Model Integration)
// =========================
export const predictPrice = async (req, res) => {
  try {
    const { product, market } = req.body;

    if (!product || !market) {
      return res.status(400).json({ message: 'Product and market are required' });
    }

    // Placeholder: Replace with AI model prediction logic
    const predictedPrice = Math.random() * 1000; 
    const predictionDate = new Date();

    res.status(200).json({ product, market, predictedPrice, predictionDate });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 8️⃣ Bulk Import Prices
// =========================
export const bulkImportPrices = async (req, res) => {
  try {
    const { prices } = req.body;
    if (!Array.isArray(prices) || prices.length === 0) {
      return res.status(400).json({ message: 'Invalid price data' });
    }

    await Price.insertMany(prices);
    res.status(201).json({ message: 'Prices imported successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 9️⃣ Get Historical Prices
// =========================
export const getHistoricalPrices = async (req, res) => {
  try {
    const { product, market, limit = 30 } = req.query;
    const query = { product, market };

    const historicalPrices = await Price.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(200).json(historicalPrices);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 🔟 Get Top Markets for a Product
// =========================
export const getTopMarketsForProduct = async (req, res) => {
  try {
    const { product } = req.query;
    if (!product) return res.status(400).json({ message: 'Product is required' });

    const markets = await Price.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(product) } },
      { 
        $group: { 
          _id: '$market', 
          avgPrice: { $avg: '$price' } 
        } 
      },
      { $sort: { avgPrice: -1 } }
    ]);

    res.status(200).json(markets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 11️⃣ Set User Price Alerts
// =========================
export const setUserPriceAlerts = async (req, res) => {
  try {
    const { product, market, priceThreshold, userId } = req.body;

    // Placeholder for saving user alerts in DB
    res.status(200).json({ message: 'Price alert set successfully', product, market, priceThreshold, userId });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 12️⃣ Detect Price Anomalies (Fraud Detection)
// =========================
export const detectPriceAnomalies = async (req, res) => {
  try {
    // Placeholder logic for AI-based anomaly detection
    res.status(200).json({ message: 'Anomaly detection completed' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 13️⃣ Get Average Price Per Market
// =========================
export const getAveragePricePerMarket = async (req, res) => {
  try {
    const prices = await Price.aggregate([
      { $group: { _id: '$market', avgPrice: { $avg: '$price' } } }
    ]);

    res.status(200).json(prices);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const checkPriceAlerts = async (req, res) => {
  try {
    const { product, market, userId } = req.query;

    if (!product || !market || !userId) {
      return res.status(400).json({ message: 'Product, market, and user ID are required' });
    }

    // Fetch price alerts (Assuming you have a `PriceAlert` model)
    const alerts = await PriceAlert.find({ product, market, userId });

    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const compareMarketPrices = async (req, res) => {
  try {
    const { product } = req.query;

    if (!product) {
      return res.status(400).json({ message: 'Product is required' });
    }

    // Fetch prices for the product across different markets
    const marketPrices = await Price.find({ product }).sort({ market: 1 });

    if (!marketPrices.length) {
      return res.status(404).json({ message: 'No price data found for this product' });
    }

    res.status(200).json(marketPrices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getPriceVolatility = async (req, res) => {
  try {
    const { product, market, days } = req.query;
    const pastDays = days ? parseInt(days) : 30;

    if (!product || !market) {
      return res.status(400).json({ message: 'Product and market are required' });
    }

    // Fetch price data for the past `days` days
    const historicalPrices = await Price.find({
      product,
      market,
      date: { $gte: new Date(Date.now() - pastDays * 24 * 60 * 60 * 1000) }
    }).sort({ date: 1 });

    if (historicalPrices.length < 2) {
      return res.status(200).json({ message: 'Not enough data for volatility analysis' });
    }

    const prices = historicalPrices.map(p => p.price);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const standardDeviation = Math.sqrt(variance);

    res.status(200).json({
      product,
      market,
      volatility: standardDeviation.toFixed(2),
      historicalPrices
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
