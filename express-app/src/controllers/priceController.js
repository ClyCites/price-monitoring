import Price from '../models/Price.js';
import axios from 'axios';

// =========================
// 1️⃣ Add a New Price Entry (Manual Data Entry)
// =========================
export const addPrice = async (req, res) => {
  try {
    const { product, market, price, currency, date, productType, quantity, unit, alertThreshold } = req.body;

    if (!product || !market || !price || !date || !productType || !quantity || !unit) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newPrice = new Price({
      product,
      market,
      price,
      currency: currency || 'UGX',
      date,
      productType,
      quantity,
      unit,
      alertThreshold: alertThreshold || null,
      lastUpdated: new Date(),
    });

    await newPrice.save();
    res.status(201).json({ message: 'Price added successfully', price: newPrice });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 2️⃣ Get Prices (Filtered by Product & Market)
// =========================
export const getPrices = async (req, res) => {
  try {
    const { product, market } = req.query;
    const query = {};

    if (product) query.product = product;
    if (market) query.market = market;

    const prices = await Price.find(query).sort({ date: -1 });
    res.status(200).json(prices);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 3️⃣ Get a Price Entry by ID
// =========================
export const getPriceById = async (req, res) => {
  try {
    const price = await Price.findById(req.params.id);

    if (!price) {
      return res.status(404).json({ message: 'Price not found' });
    }

    res.status(200).json(price);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 4️⃣ Update a Price Entry
// =========================
export const updatePrice = async (req, res) => {
  try {
    const price = await Price.findById(req.params.id);

    if (!price) {
      return res.status(404).json({ message: 'Price not found' });
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

    if (!price) {
      return res.status(404).json({ message: 'Price not found' });
    }

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
    const { product, market, days = 30 } = req.query;
    const pastDays = parseInt(days);

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

    const movingAverage = historicalPrices.map((entry, index, arr) => {
      const slice = arr.slice(Math.max(0, index - 5), index + 1);
      return {
        date: entry.date,
        avgPrice: slice.reduce((sum, e) => sum + e.price, 0) / slice.length
      };
    });

    res.status(200).json({
      product,
      market,
      trendPercentage: trendPercentage.toFixed(2),
      movingAverage,
      historicalPrices
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 7️⃣ Predict Future Price (Uses ML Model)
// =========================
export const predictPrice = async (req, res) => {
  try {
    const { product, market, quantity, unit } = req.body;

    if (!product || !market || !quantity || !unit) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const latestPrice = await Price.findOne({ product, market }).sort({ date: -1 });

    if (!latestPrice) {
      return res.status(404).json({ message: 'No price data available' });
    }

    const response = await axios.post('http://your-flask-service/predict', {
      product,
      market,
      currentPrice: latestPrice.price,
      quantity,
      unit
    });

    res.status(200).json({ predictedPrice: response.data.predictedPrice });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 8️⃣ Check Price Alerts
// =========================
export const checkPriceAlerts = async (req, res) => {
  try {
    const { product, market } = req.query;
    const priceEntries = await Price.find({ product, market }).sort({ date: -1 });

    if (!priceEntries.length) {
      return res.status(404).json({ message: 'No price data available' });
    }

    const latestPrice = priceEntries[0];

    if (latestPrice.alertThreshold && latestPrice.price > latestPrice.alertThreshold) {
      await Price.findByIdAndUpdate(latestPrice._id, { alertTriggered: true });
      return res.status(200).json({
        message: 'Price alert triggered',
        price: latestPrice.price,
        threshold: latestPrice.alertThreshold
      });
    }

    res.status(200).json({ message: 'No alert triggered', price: latestPrice.price });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 9️⃣ Compare Prices Across Markets
// =========================
export const compareMarketPrices = async (req, res) => {
  try {
    const { product } = req.query;
    if (!product) {
      return res.status(400).json({ message: 'Product is required' });
    }

    const marketPrices = await Price.aggregate([
      { $match: { product } },
      { $group: { _id: '$market', avgPrice: { $avg: '$price' } } }
    ]);

    res.status(200).json(marketPrices);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
