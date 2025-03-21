import Price from '../models/Price.js';

// =========================
// 1️⃣ Create a New Price Entry (Manual Data Entry)
// =========================
export const addPrice = async (req, res) => {
  try {
    const { product, market, price, currency, date, productType, quantity, unit } = req.body;

    // Check if required fields exist
    if (!product || !market || !price || !date || !productType || !quantity || !unit) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new price entry
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
// 2️⃣ Get Prices (Based on Product & Market)
// =========================
export const getPrices = async (req, res) => {
  try {
    const { product, market } = req.query;

    // Query based on product & market if provided
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
// 3️⃣ Get Price by ID
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
// 4️⃣ Update Price Entry
// =========================
export const updatePrice = async (req, res) => {
  try {
    const price = await Price.findById(req.params.id);

    if (!price) {
      return res.status(404).json({ message: 'Price not found' });
    }

    // Update fields if provided
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
// 6️⃣ Get Price Trends & Analytics
// =========================
export const getPriceTrends = async (req, res) => {
  try {
    const { product, market, days } = req.query;
    const pastDays = days ? parseInt(days) : 30;

    if (!product || !market) {
      return res.status(400).json({ message: 'Product and market are required' });
    }

    // Get historical prices
    const historicalPrices = await Price.find({
      product,
      market,
      date: { $gte: new Date(Date.now() - pastDays * 24 * 60 * 60 * 1000) }
    }).sort({ date: 1 });

    // Calculate trend percentage
    if (historicalPrices.length < 2) {
      return res.status(200).json({ message: 'Not enough data for trend analysis' });
    }

    const firstPrice = historicalPrices[0].price;
    const latestPrice = historicalPrices[historicalPrices.length - 1].price;
    const trendPercentage = ((latestPrice - firstPrice) / firstPrice) * 100;

    res.status(200).json({
      product,
      market,
      trendPercentage: trendPercentage.toFixed(2),
      historicalPrices
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
